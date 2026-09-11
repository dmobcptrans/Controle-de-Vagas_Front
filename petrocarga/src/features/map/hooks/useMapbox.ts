import { useEffect, useState, MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

// Tipagens
interface MapboxFeature {
  id: string;
  place_name: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
}

interface UseMapboxProps {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onSelectPlace?: (place: MapboxFeature) => void;
  enableSearch?: boolean;
  enableNavigation?: boolean;
  enableGeolocate?: boolean;
  expandSearch?: boolean;
}

interface GeocoderResultEvent {
  result: {
    id: string;
    place_name: string;
    geometry: { coordinates: [number, number] };
  };
}

// Mapa global persistente (singleton)
let globalMap: mapboxgl.Map | null = null;

/**
 * @hook useMapbox
 * @version 1.0.0
 * 
 * @description Hook customizado para gerenciamento de instância do mapa Mapbox GL.
 * Implementa padrão singleton para reutilizar a mesma instância do mapa em múltiplos componentes.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {MutableRefObject<HTMLDivElement | null>} containerRef - Referência ao container do mapa
 * @property {(place: MapboxFeature) => void} [onSelectPlace] - Callback ao selecionar local no geocoder
 * @property {boolean} [enableSearch=true] - Habilita campo de busca (geocoder)
 * @property {boolean} [enableNavigation=true] - Habilita controles de navegação (zoom, etc.)
 * @property {boolean} [expandSearch=false] - Expande campo de busca horizontalmente (centralizado)
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {mapboxgl.Map | null} map - Instância do mapa
 * @property {boolean} mapLoaded - Indica se o estilo do mapa foi carregado
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - SINGLETON: globalMap evita múltiplas instâncias do mapa
 * - REUTILIZAÇÃO: Reconecta o mapa ao novo container quando necessário
 * - EXPANSÃO: Campo de busca centralizado e com largura 80% quando expandSearch é true
 * - CLEANUP: Remove event listeners de resize na desmontagem
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - MapboxGeocoder: Componente de busca de endereços
 * - MapboxGL: Biblioteca de mapas
 * 
 * @example
 * ```tsx
 * const mapContainer = useRef<HTMLDivElement>(null);
 * const { map, mapLoaded } = useMapbox({
 *   containerRef: mapContainer,
 *   onSelectPlace: (place) => console.log('Local selecionado:', place),
 *   enableSearch: true,
 *   enableNavigation: true,
 *   expandSearch: true
 * });
 * 
 * useEffect(() => {
 *   if (map && mapLoaded) {
 *     // Adicionar marcadores ou camadas
 *   }
 * }, [map, mapLoaded]);
 * 
 * return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
 * ```
 */

export function useMapbox({
  containerRef,
  onSelectPlace,
  enableSearch = false,
  enableNavigation = false,
  enableGeolocate = false,
  expandSearch = false,
}: UseMapboxProps) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) throw new Error('MAPBOX TOKEN não definido');
    mapboxgl.accessToken = token;

    const container = containerRef.current;
    if (!container) return;

    // ==================== REUTILIZAR MAPA GLOBAL ====================
    if (globalMap) {
      const mapContainer = globalMap.getContainer();

      // Reanexa ao novo container, se necessário
      if (
        mapContainer &&
        mapContainer !== container &&
        !container.contains(mapContainer)
      ) {
        mapContainer.parentNode?.removeChild(mapContainer);
        container.appendChild(mapContainer);
      }

      globalMap.resize();

      if (!mapLoaded) {
        if (globalMap.isStyleLoaded()) {
          setMapLoaded(true);
        } else {
          globalMap.once('styledata', () => {
            setMapLoaded(true);
          });
        }
      }

      setMap(globalMap);
      return;
    }

    // ==================== CRIAR NOVA INSTÂNCIA DO MAPA ====================
    globalMap = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/jusenx/cmg9pmy5d006b01s2959hdkmb',
      center: [-43.17572436276286, -22.5101573150628],
      zoom: 13,
    });

    // ==================== CONTROLES DE NAVEGAÇÃO ====================
    if (enableNavigation) {
      globalMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    if (enableGeolocate) {
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      globalMap.addControl(geolocateControl, 'top-right');
    }

    // ==================== CAMPO DE BUSCA (GEOCODER) ====================
    if (enableSearch) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
        marker: false,
        placeholder: 'Pesquisar endereço',
      });

      globalMap.addControl(geocoder, 'top-left');

      // Expansão do campo de busca (centralizado, largura 80%)
      if (expandSearch) {
        const adjustGeocoder = () => {
          const wrapper = document.querySelector(
            '.mapboxgl-ctrl-top-left',
          ) as HTMLElement;
          const geocoderContainer = document.querySelector(
            '.mapboxgl-ctrl-geocoder',
          ) as HTMLElement;

          if (!wrapper || !geocoderContainer) return;

          geocoderContainer.classList.add('my-custom-geocoder');

          // Centraliza horizontalmente o campo
          wrapper.style.width = '100%';
          wrapper.style.display = 'flex';
          wrapper.style.justifyContent = 'center';
          wrapper.style.position = 'absolute';
          wrapper.style.top = '10px';
          wrapper.style.left = '0';

          geocoderContainer.style.width = '80%';
          geocoderContainer.style.maxWidth = '800px';
          geocoderContainer.style.boxSizing = 'border-box';

          const input = geocoderContainer.querySelector(
            'input',
          ) as HTMLInputElement;
          if (input) input.style.width = '100%';
        };

        // Garante renderização após o layout
        requestAnimationFrame(() => setTimeout(adjustGeocoder, 0));

        const handleResize = () => {
          globalMap?.resize();
          adjustGeocoder();
        };
        window.addEventListener('resize', handleResize);

        // Cleanup do resize (apenas para o caso expandSearch)
        return () => window.removeEventListener('resize', handleResize);
      }

      // Callback ao selecionar endereço
      geocoder.on('result', (e: GeocoderResultEvent) => {
        const [lng, lat] = e.result.geometry.coordinates;

        const input = document.querySelector(
          '.mapboxgl-ctrl-geocoder input',
        ) as HTMLInputElement;

        if (input) {
          input.blur();
        }

        onSelectPlace?.({
          id: e.result.id,
          place_name: e.result.place_name,
          geometry: { type: 'Point', coordinates: [lng, lat] },
        });

        globalMap?.flyTo({ center: [lng, lat], zoom: 16 });
      });
    }

    // ==================== EVENTO DE CARREGAMENTO ====================
    globalMap.on('load', () => setMapLoaded(true));
    setMap(globalMap);

    // ==================== REDIMENSIONAMENTO ====================
    const handleResize = () => globalMap?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [
    containerRef,
    onSelectPlace,
    enableSearch,
    enableNavigation,
    expandSearch,
    enableGeolocate,
    mapLoaded,
  ]);

  return { map, mapLoaded };
}