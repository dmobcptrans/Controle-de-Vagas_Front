'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useVagas } from '../hooks/map/useVagas';
import { useMapbox } from '../hooks/map/useMapbox';
import { addVagaMarkers } from '../utils/map/markerUtils';
import { Vaga } from '@/lib/types/vaga';

interface MapboxFeature {
  id: string;
  place_name: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
}

interface MapProps {
  selectedPlace: MapboxFeature | null;
  onSelectPlace?: (place: MapboxFeature) => void;
}

/**
 * @component ViewMap
 * @version 1.0.0
 * 
 * @description Mapa de visualização com marcadores de vagas e suporte a seleção de localização.
 * Exibe marcadores para todas as vagas e permite centralizar em locais selecionados via geocoder.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO DE VAGAS:
 *    - Hook useVagas busca todas as vagas disponíveis
 *    - Estados: loading, error, vagas
 * 
 * 2. MAPA:
 *    - Hook useMapbox gerencia instância do mapa com geocoder
 *    - Geocoder para busca de endereços
 *    - onSelectPlace callback para localizações selecionadas
 * 
 * 3. MARCADORES:
 *    - addVagaMarkers adiciona marcadores azuis para todas as vagas
 *    - Atualização automática quando vagas mudam
 * 
 * 4. SELEÇÃO DE LOCAL:
 *    - Quando selectedPlace muda, centraliza o mapa no local
 *    - Adiciona marcador temporário no local selecionado
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - DOIS MARCADORES: markersRef (vagas) + markerRef (local selecionado)
 * - FLY TO: Animação suave ao centralizar em local selecionado (zoom 14)
 * - CLEANUP: Remove marcadores na desmontagem
 * - OVERLAY: Mensagens de loading e erro sobrepostas ao mapa
 * 
 * ----------------------------------------------------------------------------
 * 🔗 HOOKS RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useVagas: Busca todas as vagas
 * - useMapbox: Gerencia instância do Mapbox (com geocoder)
 * - addVagaMarkers: Utilitário de marcadores de vagas
 * 
 * @example
 * ```tsx
 * <ViewMap
 *   selectedPlace={selectedPlace}
 *   onSelectPlace={(place) => setSelectedPlace(place)}
 * />
 * ```
 */

export function ViewMap({ selectedPlace, onSelectPlace }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // ==================== HOOKS ====================
  const { vagas, loading, error } = useVagas();
  const { map, mapLoaded } = useMapbox({
    containerRef: mapContainer,
    onSelectPlace,
  });

  // ==================== EFEITO: SELEÇÃO DE LOCAL ====================
  /**
   * Quando um local é selecionado no geocoder:
   * - Centraliza o mapa no local com animação flyTo
   * - Adiciona um marcador temporário no local
   * - Remove o marcador anterior se existir
   */
  useEffect(() => {
    if (!map || !selectedPlace || !map.isStyleLoaded()) return;

    const [lng, lat] = selectedPlace.geometry.coordinates;
    map.flyTo({ center: [lng, lat], zoom: 14 });

    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
  }, [selectedPlace, map]);

  // ==================== EFEITO: MARCADORES DE VAGAS ====================
  /**
   * Adiciona marcadores para todas as vagas quando o mapa carrega
   * e quando a lista de vagas é atualizada
   */
  useEffect(() => {
    if (!map || !mapLoaded || vagas.length === 0) return;
    addVagaMarkers(map, vagas as Vaga[], markersRef);
  }, [vagas, map, mapLoaded]);

  return (
    <div className="w-full h-full rounded-lg overflow-visible relative">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg shadow-md overflow-visible"
        style={{ minHeight: '300px' }}
      />
      
      {/* Overlay de Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          Carregando vagas...
        </div>
      )}
      
      {/* Overlay de Erro */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 z-10">
          Erro: {error}
        </div>
      )}
    </div>
  );
}