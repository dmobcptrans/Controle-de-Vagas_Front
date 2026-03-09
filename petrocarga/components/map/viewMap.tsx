'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useVagas } from './hooks/useVagas';
import { useMapbox } from '../hooks/map/useMapbox';
import { addVagaMarkers } from './utils/markerUtils';
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

export function ViewMap({ selectedPlace, onSelectPlace }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Hooks
  const { vagas, loading, error } = useVagas();
  const { map, mapLoaded } = useMapbox({
    containerRef: mapContainer,
    onSelectPlace,
  });

  useEffect(() => {
    if (!map || !selectedPlace || !map.isStyleLoaded()) return;

    const [lng, lat] = selectedPlace.geometry.coordinates;
    map.flyTo({ center: [lng, lat], zoom: 14 });

    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
  }, [selectedPlace, map]);

  // Cria marcadores das vagas
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
