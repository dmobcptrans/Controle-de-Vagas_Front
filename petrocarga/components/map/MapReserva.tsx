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

/**
 * @component MapReserva
 * @version 1.0.0
 * 
 * @description Mapa interativo para seleção de vagas no fluxo de reserva.
 * Exibe marcadores coloridos (azul = disponível, vermelho = ocupado) e permite clique para seleção.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO DE VAGAS:
 *    - Hook useVagasReserva busca vagas disponíveis
 *    - Estados: loading, error, vagas
 * 
 * 2. MAPA:
 *    - Hook useMapbox gerencia instância do mapa
 *    - Geocoder para busca de endereços
 *    - Navigation control desabilitado (expanded)
 * 
 * 3. MARCADORES:
 *    - addVagaMarkersReserva adiciona marcadores coloridos
 *    - 🔵 Azul = vaga disponível (clicável)
 *    - 🔴 Vermelho = vaga ocupada (não clicável)
 *    - Atualização automática quando vagas mudam
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useCallback: Memoiza renderMarkers para evitar re-renders desnecessários
 * - CLEANUP: Remove marcadores e event listeners na desmontagem
 * - CONDICIONAL: Aguarda style loaded antes de renderizar marcadores
 * - OVERLAY: Mensagens de loading e erro sobrepostas ao mapa
 * 
 * ----------------------------------------------------------------------------
 * 🔗 HOOKS RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useVagasReserva: Busca vagas para reserva
 * - useMapbox: Gerencia instância do Mapbox (com geocoder)
 * - addVagaMarkersReserva: Utilitário de marcadores
 * 
 * @example
 * ```tsx
 * <MapReserva onClickVaga={(vaga) => setVagaSelecionada(vaga)} />
 * ```
 */

export function MapReserva({ onClickVaga, selectedLocation }: MapReservaProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // ==================== HOOKS ====================
  const { vagas, loading, error } = useVagasReserva();

  const { map } = useMapbox({
    containerRef: mapContainer,
    enableSearch: false,
    enableNavigation: false,
    enableGeolocate: true,
    expandSearch: true,
    onSelectPlace: (place) => console.log(place),
  });

  // ==================== RENDERIZAÇÃO DE MARCADORES ====================
  const renderMarkers = useCallback(() => {
    if (!map || !vagas || vagas.length === 0) return;

    // Remove antigos
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Adiciona novos
    addVagaMarkersReserva(map, vagas, markersRef, onClickVaga);
  }, [map, vagas, onClickVaga]);

  // ==================== EFFECT 1: INIT MAP (RODA 1x) ====================
  useEffect(() => {
    if (!map) return;

    if (map.isStyleLoaded()) {
      renderMarkers();
    } else {
      map.on('load', renderMarkers);
    }

    return () => {
      if (map) {
        map.off('load', renderMarkers);
      }
    };
  }, [map, renderMarkers]);

  // ==================== EFFECT 2: ATUALIZA MARCADORES ====================
  useEffect(() => {
    if (!map || !vagas) return;

    renderMarkers();
  }, [vagas, map, renderMarkers]);

  // ==================== EFFECT 3: ZOOM NA BUSCA ====================
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