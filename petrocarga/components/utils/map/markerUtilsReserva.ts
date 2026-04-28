import mapboxgl from 'mapbox-gl';
import { Vaga } from '@/lib/types/vaga';

/**
 * @module utils/map/markersReserva
 * @description Funções utilitárias para adicionar marcadores de vagas no mapa para reserva.
 * Os marcadores são coloridos conforme a disponibilidade da vaga.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. parseCoordinates - Converte string de coordenadas em array [lng, lat]
 * 2. addVagaMarkersReserva - Adiciona marcadores de vagas ao mapa com cores por disponibilidade
 */

/**
 * @function parseCoordinates
 * @description Converte uma string de coordenadas no formato "lat, lng" para array [lng, lat].
 * 
 * @param coord - String com coordenadas (ex: "-23.55052, -46.633308")
 * @returns Array com [longitude, latitude] (ordem correta para Mapbox)
 * 


/**
 * @function addVagaMarkersReserva
 * @description Adiciona marcadores de vagas no mapa para o fluxo de reserva.
 * 
 * Características dos marcadores:
 * - 🟢 Azul: vaga disponível para reserva (cursor pointer, clicável)
 * - 🔴 Vermelho: vaga ocupada/indisponível (cursor not-allowed, não clicável)
 * 
 * @param map - Instância do mapa Mapbox GL
 * @param vagas - Lista de vagas a serem exibidas
 * @param markersRef - Referência mutável para armazenar os marcadores (para limpeza posterior)
 * @param onClickVaga - Callback opcional ao clicar em uma vaga disponível
 * 
 * @remarks
 * - Vagas sem coordenadas de início são ignoradas
 * - Popup exibe logradouro e status da vaga
 * - Apenas vagas com status "DISPONIVEL" são clicáveis
 * 
 * @example
 * ```tsx
 * const markersRef = useRef<mapboxgl.Marker[]>([]);
 * 
 * useEffect(() => {
 *   if (map && vagas.length) {
 *     addVagaMarkersReserva(map, vagas, markersRef, (vaga) => {
 *       setVagaSelecionada(vaga);
 *       setStep('reserva');
 *     });
 *   }
 *   
 *   return () => {
 *     markersRef.current.forEach(marker => marker.remove());
 *     markersRef.current = [];
 *   };
 * }, [map, vagas]);
 * ```
 */
export function addVagaMarkersReserva(
  map: mapboxgl.Map,
  vagas: Vaga[],
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  onClickVaga?: (vaga: Vaga) => void,
) {
  vagas.forEach((vaga) => {
    // Ignora vagas sem coordenadas de início
    if (!vaga.longitudeInicio || !vaga.latitudeInicio) return;

    const isDisponivel = vaga.status === 'DISPONIVEL';

    // Cria elemento HTML do marcador com cores diferenciadas
    const el = document.createElement('div');
    el.className = `
      vaga-marker w-6 h-6 rounded-full border-2 border-white shadow-lg
      ${
        isDisponivel
          ? 'bg-blue-500 cursor-pointer'
          : 'bg-red-500 opacity-60 cursor-not-allowed'
      }
    `;

    // Converte coordenadas
    const coordinates = [vaga.longitudeInicio, vaga.latitudeInicio] as [number, number];

    // Cria marcador com popup
    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${vaga.endereco.logradouro}</strong><br/>${vaga.status}`,
        ),
      )
      .addTo(map);

    // Apenas vagas disponíveis são clicáveis
    if (isDisponivel && onClickVaga) {
      el.addEventListener('click', () => onClickVaga(vaga));
    }

    // Armazena marcador para referência
    markersRef.current.push(marker);
  });
}