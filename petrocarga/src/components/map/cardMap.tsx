'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vaga } from '@/lib/types/vaga';

interface CardMapProps {
  vaga: Vaga;
}

/**
 * @component CardMap
 * @version 1.0.0
 *
 * @description Mini-mapa para exibição da localização da vaga em um card.
 * Renderiza um retângulo rotacionado representando a vaga entre dois pontos geográficos.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 *
 * 1. PARSE DE COORDENADAS:
 *    - Converte string "lat, lng" para array [lng, lat] (formato Mapbox)
 *
 * 2. RETÂNGULO ROTACIONADO:
 *    - Calcula retângulo baseado nos pontos de início e fim da vaga
 *    - Rotação automática conforme ângulo entre os pontos
 *    - Largura fixa de 2.5 metros (ajustável)
 *
 * 3. RENDERIZAÇÃO:
 *    - Fundo azul com opacidade (fill-color: #2563EB, opacity: 0.4)
 *    - Contorno azul (line-color: #2563EB, width: 2)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - METERS TO DEGREES: Conversão aproximada (0.00001 * widthMeters) para simplificar
 * - ROTACIONAMENTO: Cálculo de offset baseado no ângulo entre os pontos
 * - RESIZE: Event listener para redimensionamento do mapa
 * - CLEANUP: Remove mapa e event listener na desmontagem
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Vaga: Tipo de vaga com coordenadas de início e fim
 *
 * @example
 * ```tsx
 * <CardMap vaga={vaga} />
 * ```
 */

export default function CardMap({ vaga }: CardMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Validação de coordenadas
    if (!mapContainer.current || !vaga.longitudeInicio || !vaga.latitudeInicio)
      return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    /**
     * @function parseCoordinates
     * @description Converte string "lat, lng" para array [lng, lat]
     */
    const start: [number, number] = [vaga.longitudeInicio, vaga.latitudeInicio];

    const end: [number, number] = [vaga.longitudeFim, vaga.latitudeFim];
    /**
     * @function getRotatedRectangle
     * @description Cria um retângulo rotacionado baseado em dois pontos
     *
     * @param start - Ponto inicial [lng, lat]
     * @param end - Ponto final [lng, lat]
     * @param widthMeters - Largura do retângulo em metros
     * @returns Array de coordenadas do polígono (5 pontos, fecha no início)
     */
    function getRotatedRectangle(
      start: [number, number],
      end: [number, number],
      widthMeters: number,
    ): [number, number][] {
      const [lng1, lat1] = start;
      const [lng2, lat2] = end;

      // Calcula ângulo da linha
      const dx = lng2 - lng1;
      const dy = lat2 - lat1;
      const angle = Math.atan2(dy, dx);

      // Conversão aproximada de metros para graus
      const metersToDeg = 0.00001 * widthMeters;

      const offsetLng = metersToDeg * Math.sin(angle);
      const offsetLat = metersToDeg * Math.cos(angle);

      // Retorna polígono (retângulo) com 5 pontos (fecha no início)
      return [
        [lng1 - offsetLng, lat1 + offsetLat],
        [lng2 - offsetLng, lat2 + offsetLat],
        [lng2 + offsetLng, lat2 - offsetLat],
        [lng1 + offsetLng, lat1 - offsetLat],
        [lng1 - offsetLng, lat1 + offsetLat],
      ];
    }

    const rectangleCoordinates = getRotatedRectangle(start, end, 2.5); // largura ~2.5m

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/jusenx/cmg9pmy5d006b01s2959hdkmb',
      center: start,
      zoom: 18,
      attributionControl: false,
    });

    // Redimensionamento do mapa
    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    map.on('load', () => {
      map.resize(); // garante que o mapa fique dentro da div

      // Adiciona fonte GeoJSON
      map.addSource(`vaga-${vaga.id}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [rectangleCoordinates],
          },
          properties: {},
        },
      });

      // Camada de preenchimento (fill)
      map.addLayer({
        id: `vaga-polygon-${vaga.id}`,
        type: 'fill',
        source: `vaga-${vaga.id}`,
        layout: {},
        paint: {
          'fill-color': '#2563EB',
          'fill-opacity': 0.4,
        },
      });

      // Camada de contorno (outline)
      map.addLayer({
        id: `vaga-outline-${vaga.id}`,
        type: 'line',
        source: `vaga-${vaga.id}`,
        layout: {},
        paint: {
          'line-color': '#2563EB',
          'line-width': 2,
        },
      });
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
  }, [vaga]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-48 rounded-lg shadow-md"
      style={{ minHeight: '200px' }}
    />
  );
}
