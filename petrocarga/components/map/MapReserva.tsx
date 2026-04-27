'use client';

import { useRef, useEffect, useCallback } from 'react';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useVagasReserva } from '../hooks/map/useVagasReserva';
import { useMapbox } from '../hooks/map/useMapbox';
import { addVagaMarkersReserva } from '../utils/map/markerUtilsReserva';
import { Vaga } from '@/lib/types/vaga';

interface MapReservaProps {
  onClickVaga?: (vaga: Vaga) => void;
  selectedLocation?: {
    lat: number;
    lng: number;
  } | null;
}

export function MapReserva({ onClickVaga, selectedLocation }: MapReservaProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBoundsRef = useRef<string | null>(null);

  const { vagas, loading, error, buscarVagas } = useVagasReserva();

  const { map } = useMapbox({
    containerRef: mapContainer,
    enableSearch: false,
    enableNavigation: false,
    enableGeolocate: true,
    expandSearch: true,
    onSelectPlace: (place) => console.log(place),
  });

  // ==================== BUSCA POR BOUNDS ====================
  const carregarVagas = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const currentBounds = JSON.stringify({
      n: bounds.getNorth(),
      s: bounds.getSouth(),
      e: bounds.getEast(),
      w: bounds.getWest(),
    });

    // evita refetch do mesmo lugar
    if (lastBoundsRef.current === currentBounds) return;

    lastBoundsRef.current = currentBounds;

    buscarVagas({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  }, [map, buscarVagas]);

  // ==================== MARCADORES ====================
  const renderMarkers = useCallback(() => {
    if (!map || !vagas) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    addVagaMarkersReserva(map, vagas, markersRef, onClickVaga);
  }, [map, vagas, onClickVaga]);

  // ==================== INIT + MOVE MAP ====================
  useEffect(() => {
    if (!map) return;

    const handleLoad = () => {
      carregarVagas();
    };

    const handleMoveEnd = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        carregarVagas();
      }, 600); // debounce
    };

    if (map.isStyleLoaded()) {
      handleLoad();
    } else {
      map.on('load', handleLoad);
    }

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('load', handleLoad);
      map.off('moveend', handleMoveEnd);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [map, carregarVagas]);

  // ==================== UPDATE MARKERS ====================
  useEffect(() => {
    renderMarkers();
  }, [vagas, renderMarkers]);

  // ==================== ZOOM SEARCH ====================
  useEffect(() => {
    if (!map || !selectedLocation) return;

    map.flyTo({
      center: [selectedLocation.lng, selectedLocation.lat],
      zoom: 16,
      duration: 1200,
      essential: true,
    });
  }, [selectedLocation?.lat, selectedLocation?.lng, map]);

  return (
    <div className="w-full h-full rounded-lg overflow-visible relative">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg shadow-md overflow-visible"
        style={{ minHeight: '300px' }}
      />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          Carregando vagas...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 z-10">
          Erro: {error}
        </div>
      )}
    </div>
  );
}
