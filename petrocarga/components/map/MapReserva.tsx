'use client';

import { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useVagasReserva } from '../hooks/map/useVagasReserva';
import { useMapbox } from '../hooks/map/useMapbox';
import { addVagaMarkersReserva } from '../utils/map/markerUtilsReserva';
import { Vaga } from '@/lib/types/vaga';

interface MapReservaProps {
  onClickVaga?: (vaga: Vaga) => void;
}

export function MapReserva({ onClickVaga }: MapReservaProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { vagas, loading, error } = useVagasReserva();
  const { map } = useMapbox({
    containerRef: mapContainer,
    enableSearch: true,
    enableNavigation: false,
    expandSearch: true,
    onSelectPlace: (place) => console.log(place),
  });

  const renderMarkers = useCallback(() => {
    if (!map || !vagas || vagas.length === 0) return;

    // 1. Remove todos os marcadores antigos
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // 2. Adiciona os novos marcadores (vagas atualizadas)
    addVagaMarkersReserva(map, vagas, markersRef, onClickVaga);
    console.log(`Marcadores renderizados: ${vagas.length}`);
  }, [map, vagas, onClickVaga]);

  useEffect(() => {
    if (!map) return;

    if (map.isStyleLoaded()) {
      renderMarkers();
    } else {
      map.on('load', renderMarkers);
    }

    return () => {
      if (map && map.isStyleLoaded()) {
        map.off('load', renderMarkers);
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, vagas, renderMarkers]);

  return (
    <div className="w-full h-full rounded-lg overflow-visible relative">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg shadow-md overflow-visible"
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
