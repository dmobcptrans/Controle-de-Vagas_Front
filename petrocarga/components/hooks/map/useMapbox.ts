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
  expandSearch?: boolean;
}

interface GeocoderResultEvent {
  result: {
    id: string;
    place_name: string;
    geometry: { coordinates: [number, number] };
  };
}

// Mapa global persistente
let globalMap: mapboxgl.Map | null = null;

export function useMapbox({
  containerRef,
  onSelectPlace,
  enableSearch = true,
  enableNavigation = true,
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

    // Reutiliza o mapa global já existente
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

    // Cria o mapa apenas uma vez
    globalMap = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/jusenx/cmg9pmy5d006b01s2959hdkmb',
      center: [-43.17572436276286, -22.5101573150628],
      zoom: 13,
    });

    //  Controles de navegação
    if (enableNavigation) {
      globalMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    //  Campo de busca (Geocoder)
    if (enableSearch) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
        marker: false,
        placeholder: 'Pesquisar endereço',
      });

      globalMap.addControl(geocoder, 'top-left');

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

        // Cleanup do resize
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

    globalMap.on('load', () => setMapLoaded(true));
    setMap(globalMap);

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
    mapLoaded,
  ]);

  return { map, mapLoaded };
}
