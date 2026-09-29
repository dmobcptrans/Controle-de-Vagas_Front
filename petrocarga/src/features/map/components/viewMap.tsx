'use client';

import { useEffect, useMemo, useRef } from 'react';

import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useVagasMap } from '@/features/vaga/vagas/hooks/useVagasMap';
import {
  FiltroVaga,
  StatusVaga,
} from '@/features/vaga/vagas/types/vaga';

import { useMapbox } from '../hooks/useMapbox';

import {
  addClusterMarkerReserva,
  addVagaMarkersReserva,
} from '../utils/markerUtils';

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
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  const markersRef = useRef<mapboxgl.Marker[]>([]);

  /**
   * Guarda a última coordenada utilizada no flyTo.
   *
   * Isso impede que o mesmo flyTo seja iniciado
   * novamente caso o componente renderize novamente
   * com um novo objeto firstCoord contendo os mesmos valores.
   */
  const ultimaCoordenadaRef = useRef<{
    lat: number;
    lng: number;
  } | null>(null);

  const { map, mapLoaded } = useMapbox({
    containerRef: mapContainer,
    onSelectPlace,
  });

  /**
   * Converte o filtro da tela para o status esperado pela API.
   */
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

  const {
    vagasMap,
    loading,
    error,
    buscar,
  } = useVagasMap({
    buscarAutomaticamente: false,
  });

  /**
   * Mantém a referência mais recente da função buscar.
   */
  const buscarRef = useRef(buscar);

  useEffect(() => {
    buscarRef.current = buscar;
  }, [buscar]);

  /**
   * Busca as vagas do viewport sempre que o mapa
   * terminar de se mover.
   *
   * IMPORTANTE:
   * Aqui estamos mantendo a lógica de busca que já
   * existia no seu componente.
   */
  useEffect(() => {
    if (!map || !mapLoaded) {
      return;
    }

    const buscarVagasViewport = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      buscarRef.current({
        north: bounds!.getNorth(),
        south: bounds!.getSouth(),
        east: bounds!.getEast(),
        west: bounds!.getWest(),
        zoom,
        status,
      });
    };

    // Busca inicial
    buscarVagasViewport();

    // Busca quando o mapa terminar de se mover
    map.on('moveend', buscarVagasViewport);

    return () => {
      map.off('moveend', buscarVagasViewport);
    };
  }, [map, mapLoaded, status]);

  /**
   * Atualiza os markers quando a resposta da API muda.
   *
   * Agora utiliza EXATAMENTE os mesmos markers
   * utilizados pelo MapReserva.
   */
  useEffect(() => {
    if (!map || !mapLoaded) {
      return;
    }

    // Remove markers anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!vagasMap) {
      return;
    }

    // ==================== CLUSTERS ====================

    if (vagasMap.tipo === 'CLUSTERS') {
      if (vagasMap.clusters.length > 0) {
        addClusterMarkerReserva(
          map,
          vagasMap.clusters,
          markersRef
        );
      }

      return;
    }

    // ==================== VAGAS ====================

    if (
      vagasMap.tipo === 'VAGAS' &&
      vagasMap.vagas.length > 0
    ) {
      addVagaMarkersReserva(
        map,
        vagasMap.vagas,
        markersRef
      );
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [vagasMap, map, mapLoaded]);

  /**
   * Move o mapa para o local selecionado na pesquisa.
   *
   * O moveend gerado pelo flyTo irá disparar
   * a busca das vagas do novo viewport.
   */
  useEffect(() => {
    if (!map || !firstCoord) {
      return;
    }

    const { lat, lng } = firstCoord;

    const ultimaCoordenada = ultimaCoordenadaRef.current;

    /**
     * Se a coordenada já foi utilizada,
     * não inicia outro flyTo.
     */
    if (
      ultimaCoordenada?.lat === lat &&
      ultimaCoordenada?.lng === lng
    ) {
      return;
    }

    ultimaCoordenadaRef.current = {
      lat,
      lng,
    };

    map.flyTo({
      center: [lng, lat],
      zoom: 16,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  }, [
    map,
    firstCoord?.lat,
    firstCoord?.lng,
  ]);

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
