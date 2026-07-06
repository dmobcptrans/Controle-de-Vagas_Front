import mapboxgl from 'mapbox-gl';
import { Vaga } from '@/lib/types/vaga';

/**
 * @module utils/map/markers
 * @description Funções utilitárias para adicionar marcadores de vagas ao mapa Mapbox GL.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. parseCoordinates - Converte string de coordenadas em array [lng, lat]
 * 2. addVagaMarkers - Adiciona marcadores de vagas ao mapa
 */

/**
 * @function parseCoordinates
 * @description Converte uma string de coordenadas no formato "lat, lng" para array [lng, lat].
 * 
 * @param coord - String com coordenadas (ex: "-23.55052, -46.633308")
 * @returns Array com [longitude, latitude] (ordem correta para Mapbox)
 * 
 * @example
 * ```ts
 * parseCoordinates("-23.55052, -46.633308") // [-46.633308, -23.55052]
 * ```


/**
 * @function addVagaMarkers
 * @description Adiciona marcadores para todas as vagas no mapa Mapbox GL.
 * Cada marcador exibe um popup com informações da vaga e é clicável.
 * 
 * @param map - Instância do mapa Mapbox GL
 * @param vagas - Lista de vagas a serem exibidas
 * @param markersRef - Referência mutável para armazenar os marcadores (para limpeza posterior)
 * @param onClickVaga - Callback opcional ao clicar no marcador
 * 
 * @remarks
 * - Marcadores são círculos azuis com borda branca (classe CSS: "vaga-marker")
 * - Popup exibe número do endereço, logradouro e bairro
 * - Vagas sem coordenadas de início são ignoradas
 * 
 * @example
 * ```tsx
 * const markersRef = useRef<mapboxgl.Marker[]>([]);
 * 
 * useEffect(() => {
 *   if (map && vagas.length) {
 *     addVagaMarkers(map, vagas, markersRef, (vaga) => {
 *       console.log('Vaga clicada:', vaga);
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
export function addVagaMarkers(
  map: mapboxgl.Map,
  vagas: Vaga[],
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  onClickVaga?: (vaga: Vaga) => void,
) {
  vagas.forEach((vaga) => {
    // Ignora vagas sem coordenadas de início
    if (!vaga.longitudeInicio || !vaga.latitudeInicio) return;

    // Cria elemento HTML do marcador
    const el = document.createElement('div');
    el.className =
      'vaga-marker w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer';

    // Converte coordenadas
    const coordinates = [vaga.longitudeInicio, vaga.latitudeInicio] as [number, number];

    // Cria marcador com popup
    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${vaga.numeroEndereco}</strong><br/>${vaga.endereco.logradouro}, ${vaga.endereco.bairro}`,
        ),
      )
      .addTo(map);

    // Adiciona evento de clique
    if (onClickVaga) {
      el.addEventListener('click', () => onClickVaga(vaga));
    }

    // Armazena marcador para referência
    markersRef.current.push(marker);
  });
}