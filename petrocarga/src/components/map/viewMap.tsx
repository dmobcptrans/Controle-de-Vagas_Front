'use client';

import { useEffect, useMemo, useRef } from 'react';

import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useVagas } from '../hooks/map/useVagas';
import { useMapbox } from '../hooks/map/useMapbox';
import { addVagaMarkers } from '../utils/map/markerUtils';

import { FiltroVaga } from '@/lib/types/vaga';

interface MapboxFeature {
  id: string;
  place_name: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface MapProps {
  selectedPlace: MapboxFeature | null;
  onSelectPlace?: (place: MapboxFeature) => void;
  searchQuery?: string;
  firstCoord?: {
    lat: number;
    lng: number;
  } | null;
  filtro: FiltroVaga;
}

export function ViewMap({
  onSelectPlace,
  firstCoord,
  filtro,
  searchQuery,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // ==================== HOOKS ====================

  const { vagas, loading, error } = useVagas();

  const { map, mapLoaded } = useMapbox({
    containerRef: mapContainer,
    onSelectPlace,
  });

  // ==================== FILTRO ====================

  const vagasFiltradas = useMemo(() => {
    switch (filtro) {
      case 'disponiveis':
        return vagas.filter(
          (vaga) => vaga.status === 'DISPONIVEL'
        );

      case 'indisponiveis':
        return vagas.filter(
          (vaga) => vaga.status === 'INDISPONIVEL'
        );

      case 'todas':
      default:
        return vagas;
    }
  }, [vagas, filtro]);

  // ==================== SELEÇÃO DE LOCAL ====================

  useEffect(() => {
    if (!map || !firstCoord) return;

    const { lat, lng } = firstCoord;

    map.flyTo({
      center: [lng, lat],
      zoom: 16,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  }, [firstCoord, map]);

  // ==================== MARCADORES ====================

  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Remove os marcadores antigos
    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = [];

    // Adiciona somente as vagas do filtro atual
    if (vagasFiltradas.length > 0) {
      addVagaMarkers(
        map,
        vagasFiltradas,
        markersRef
      );
    }

    // Limpeza ao desmontar ou mudar o filtro
    return () => {
      markersRef.current.forEach((marker) => {
        marker.remove();
      });

      markersRef.current = [];
    };
  }, [vagasFiltradas, map, mapLoaded]);

  return (
    <div className="w-full h-full rounded-2xl overflow-visible relative">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-2xl overflow-visible"
        style={{ minHeight: '300px' }}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          Carregando vagas...
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 z-10">
          Erro: {error}
        </div>
      )}
    </div>
  );
}