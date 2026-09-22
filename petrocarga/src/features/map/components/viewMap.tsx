'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useVagasMap } from '@/features/vaga/vagas/hooks/useVagasMap';

import { FiltroVaga, StatusVaga } from '@/features/vaga/vagas/types/vaga';

import { useMapbox } from '../hooks/useMapbox';
import { addVagaMarkers } from '../utils/markerUtils';

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

export function ViewMap({ onSelectPlace, firstCoord, filtro }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // ==================== MAPBOX ====================

  const { map, mapLoaded } = useMapbox({
    containerRef: mapContainer,
    onSelectPlace,
  });

  // ==================== FILTRO ====================

  const status: StatusVaga | undefined = useMemo(() => {
    switch (filtro) {
      case 'disponiveis':
        return 'DISPONIVEL';

      case 'indisponiveis':
        return 'INDISPONIVEL';

      case 'manutencao':
        return 'MANUTENCAO';

      case 'todas':
      default:
        return undefined;
    }
  }, [filtro]);

  // ==================== BUSCA DAS VAGAS ====================

  const { vagasMap, loading, error, buscar } = useVagasMap({
    buscarAutomaticamente: false,
  });

  // ==================== BUSCAR PELO VIEWPORT ====================

  const buscarVagasDoMapa = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();

    if (!bounds) return;

    buscar({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      zoom: map.getZoom(),
      status,
    });
  }, [map, status, buscar]);

  // ==================== PRIMEIRA BUSCA ====================

  useEffect(() => {
    if (!map || !mapLoaded) return;

    buscarVagasDoMapa();
  }, [map, mapLoaded, buscarVagasDoMapa]);

  // ==================== ATUALIZAR AO MOVER MAPA ====================

  useEffect(() => {
    if (!map || !mapLoaded) return;

    map.on('moveend', buscarVagasDoMapa);

    return () => {
      map.off('moveend', buscarVagasDoMapa);
    };
  }, [map, mapLoaded, buscarVagasDoMapa]);

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

    // Remove marcadores anteriores
    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = [];

    // API retornou clusters
    if (vagasMap?.tipo === 'CLUSTERS') {
      return;
    }

    // API retornou vagas
    if (vagasMap?.tipo === 'VAGAS' && vagasMap.vagas.length > 0) {
      addVagaMarkers(map, vagasMap, markersRef);
    }

    return () => {
      markersRef.current.forEach((marker) => {
        marker.remove();
      });

      markersRef.current = [];
    };
  }, [vagasMap, map, mapLoaded]);

  // ==================== RENDER ====================

  return (
    <div className="w-full h-full rounded-2xl overflow-visible relative">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-2xl overflow-visible"
        style={{ minHeight: '300px' }}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          Carregando vagas...
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 z-10">
          Erro: {error}
        </div>
      )}

      {vagasMap?.limiteAtingido && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow z-10 text-sm text-gray-600">
          Aproxime o mapa para visualizar mais vagas.
        </div>
      )}
    </div>
  );
}
