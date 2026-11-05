import mapboxgl from 'mapbox-gl';
import { ClusterMapa, VagasMapa } from '@/features/vaga/vagas/types/vaga';

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
  vagas: VagasMapa[],
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  onClickVaga?: (vaga: VagasMapa) => void,
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
    const coordinates = [vaga.longitudeInicio, vaga.latitudeInicio] as [
      number,
      number,
    ];

    // Cria marcador com popup
    const marker = new mapboxgl.Marker(el).setLngLat(coordinates).addTo(map);

    // Apenas vagas disponíveis são clicáveis
    if (isDisponivel && onClickVaga) {
      el.addEventListener('click', () => onClickVaga(vaga));
    }

    // Armazena marcador para referência
    markersRef.current.push(marker);
  });
}
export function addClusterMarkerReserva(
  map: mapboxgl.Map,
  clusters: ClusterMapa[],
  clusterMarkersRef: React.MutableRefObject<mapboxgl.Marker[]>,
) {
  clusters.forEach((cluster) => {
    const el = document.createElement('div');

    el.className =
      'flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm border-2 border-white shadow-md cursor-pointer';

    el.textContent = cluster.quantidade.toString();

    const marker = new mapboxgl.Marker({
      element: el,
    })
      .setLngLat([cluster.longitude, cluster.latitude])
      .addTo(map);

    clusterMarkersRef.current.push(marker);
  });
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DISPONIVEL: { label: 'Disponível', className: 'bg-green-100 text-green-700' },
  INDISPONIVEL: { label: 'Indisponível', className: 'bg-red-100 text-red-700' },
  MANUTENCAO: {
    label: 'Em manutenção',
    className: 'bg-yellow-100 text-yellow-700',
  },
};

const AREA_CONFIG: Record<string, { label: string; dot: string }> = {
  AMARELA: { label: 'Amarela', dot: 'bg-yellow-400' },
  AZUL: { label: 'Azul', dot: 'bg-blue-500' },
  VERDE: { label: 'Verde', dot: 'bg-green-500' },
  VERMELHA: { label: 'Vermelha', dot: 'bg-red-500' },
};

const COLOR_BY_STATUS: Record<string, string> = {
  DISPONIVEL: 'bg-blue-500',
  INDISPONIVEL: 'bg-red-500',
  MANUTENCAO: 'bg-yellow-500',
};

function criarConteudoPopupVaga(
  vaga: VagasMapa,
  onVerMais: (vaga: VagasMapa) => void,
): HTMLElement {
  const status = STATUS_CONFIG[vaga.status] ?? {
    label: vaga.status,
    className: 'bg-gray-100 text-gray-600',
  };

  const area = AREA_CONFIG[vaga.area] ?? {
    label: vaga.area,
    dot: 'bg-gray-400',
  };

  const root = document.createElement('div');
  root.className = 'w-48 rounded-xl bg-white p-3 text-sm';






  const indicador = document.createElement('span');
  indicador.className = `mt-1 h-2.5 w-2.5 shrink-0${
    COLOR_BY_STATUS[vaga.status] ?? 'bg-gray-400'
  }`;



  // Informações
  const informacoes = document.createElement('div');
  informacoes.className = 'mb-3 space-y-2 pt-3';

  // Status
  const linhaStatus = document.createElement('div');
  linhaStatus.className = 'flex items-center justify-between gap-2';

  const labelStatus = document.createElement('span');
  labelStatus.className = 'text-xs text-gray-500';
  labelStatus.textContent = 'Status';

  const badgeStatus = document.createElement('span');
  badgeStatus.className = `rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`;
  badgeStatus.textContent = status.label;

  linhaStatus.append(labelStatus, badgeStatus);

  // Área
  const linhaArea = document.createElement('div');
  linhaArea.className = 'flex items-center justify-between gap-2';

  const labelArea = document.createElement('span');
  labelArea.className = 'text-xs text-gray-500';
  labelArea.textContent = 'Área';

  const valorArea = document.createElement('span');
  valorArea.className =
    'flex items-center gap-1.5 text-xs font-semibold text-gray-800';

  const pontoArea = document.createElement('span');
  pontoArea.className = `h-2 w-2 rounded-full ${area.dot}`;

  const textoArea = document.createElement('span');
  textoArea.textContent = area.label;

  valorArea.append(pontoArea, textoArea);
  linhaArea.append(labelArea, valorArea);

  informacoes.append(linhaStatus, linhaArea);
  root.appendChild(informacoes);

  // Botão
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = 'Ver detalhes';
  botao.className = `
    flex w-full items-center justify-center gap-1.5
    rounded-lg bg-blue-600 px-3 py-2
    text-xs font-semibold text-white
    transition-colors duration-200
    hover:bg-blue-700 active:bg-blue-800
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  botao.addEventListener('click', () => onVerMais(vaga));

  root.appendChild(botao);

  return root;
}

export function addVagaMarkersGestor(
  map: mapboxgl.Map,
  vagas: VagasMapa[],
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  onVerMais: (vaga: VagasMapa) => void,
) {
  vagas.forEach((vaga) => {
    if (!vaga.longitudeInicio || !vaga.latitudeInicio) return;

    const el = document.createElement('div');
    el.className = `vaga-marker w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer ${
      COLOR_BY_STATUS[vaga.status] ?? 'bg-gray-500'
    }`;

    // Popup ancorado no marker (abre acima da vaga)

    const popup = new mapboxgl.Popup({
      offset: 12,
      closeButton: true,
      closeOnClick: true,
      maxWidth: '220px',
      className: 'vaga-popup',
    }).setDOMContent(criarConteudoPopupVaga(vaga, onVerMais));

    const marker = new mapboxgl.Marker(el)
      .setLngLat([vaga.longitudeInicio, vaga.latitudeInicio])
      .setPopup(popup) // clicar no marker abre/fecha o popup
      .addTo(map);

    markersRef.current.push(marker);
  });
}
