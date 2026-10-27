/**
 * @module types/dashboard
 * @description Definições de tipos TypeScript para o módulo de Dashboard e Relatórios.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. KPIs e Métricas Principais
 * 2. Estatísticas de Localização
 * 3. Métricas Avançadas
 * 4. Rotas de Veículos
 * 5. Filtros e Utilitários
 */

// ============================================================================
// 1. KPIs E MÉTRICAS PRINCIPAIS
// ============================================================================

/**
 * @interface DashboardKPIs
 * @description Indicadores-chave de performance do dashboard.
 * Métricas quantitativas principais do sistema.
 *
 * @property {number} totalSlots - Total de vagas disponíveis
 * @property {number} activeReservations - Reservas ativas no momento
 * @property {number} pendingReservations - Reservas pendentes
 * @property {number} occupancyRate - Taxa de ocupação atual (%)
 * @property {number} completedReservations - Reservas concluídas
 * @property {number} canceledReservations - Reservas canceladas
 * @property {number} removedReservations - Reservas removidas
 * @property {number} totalReservations - Total de reservas no período
 * @property {number} multipleSlotReservations - Reservas que usam múltiplas vagas
 * @property {string} startDate - Data inicial do período (ISO)
 * @property {string} endDate - Data final do período (ISO)
 *
 * @example
 * ```ts
 * const kpis: DashboardKPIs = {
 *   totalSlots: 100,
 *   occupancyRate: 75.5,
 *   activeReservations: 45,
 *   completedReservations: 300,
 *   startDate: '2024-01-01T00:00:00.000Z',
 *   endDate: '2024-01-31T23:59:59.999Z'
 * };
 * ```
 */
export interface DashboardKPIs {
  totalSlots: number;
  activeReservations: number;
  pendingReservations: number;
  occupancyRate: number;
  completedReservations: number;
  canceledReservations: number;
  removedReservations: number;
  totalReservations: number;
  multipleSlotReservations: number;
  startDate: string;
  endDate: string;
}

/**
 * @interface VehicleType
 * @description Estatísticas por tipo de veículo.
 *
 * @property {string} type - Tipo do veículo (ex: 'AUTOMOVEL', 'CAMINHAO')
 * @property {number} count - Número total de reservas deste tipo
 * @property {number} uniqueVehicles - Número de veículos únicos deste tipo
 *
 * @example
 * ```ts
 * const vehicleType: VehicleType = {
 *   type: 'AUTOMOVEL',
 *   count: 150,
 *   uniqueVehicles: 45
 * };
 * ```
 */
export interface VehicleType {
  type: string;
  count: number;
  uniqueVehicles: number;
}

// ============================================================================
// 2. ESTATÍSTICAS DE LOCALIZAÇÃO
// ============================================================================

/**
 * @type LocationStatType
 * @description Tipos de estatísticas de localização disponíveis.
 *
 * - 'district': Estatísticas por bairro
 * - 'origin': Locais de origem dos veículos
 * - 'entry-origin': Pontos de entrada na cidade
 * - 'most-used': Vagas mais utilizadas
 */
export type LocationStatType =
  | 'district'
  | 'origin'
  | 'entry-origin'
  | 'most-used';

/**
 * @interface LocationStat
 * @description Estatística de uma localização específica.
 *
 * @property {string} name - Nome da localização
 * @property {LocationStatType} type - Tipo da estatística
 * @property {number} reservationCount - Número de reservas nesta localização
 *
 * @example
 * ```ts
 * const district: LocationStat = {
 *   name: 'Centro',
 *   type: 'district',
 *   reservationCount: 120
 * };
 * ```
 */
export interface LocationStat {
  name: string;
  type: LocationStatType;
  reservationCount: number;
}

// ============================================================================
// 3. MÉTRICAS AVANÇADAS
// ============================================================================

/**
 * @interface StayDurationStats
 * @description Estatísticas de tempo de permanência nas vagas.
 *
 * @property {number} avgMinutes - Tempo médio em minutos
 * @property {number | null} minMinutes - Tempo mínimo (null se não houver dados)
 * @property {number | null} maxMinutes - Tempo máximo (null se não houver dados)
 */
export interface StayDurationStats {
  avgMinutes: number;
  minMinutes: number | null;
  maxMinutes: number | null;
}

/**
 * @interface ActiveDuringPeriodStats
 * @description Usuários ativos durante o período.
 *
 * @property {number} total - Total de usuários ativos
 * @property {number} reserva - Usuários com reserva normal
 * @property {number} reservaRapida - Usuários com reserva rápida
 */
export interface ActiveDuringPeriodStats {
  total: number;
  reserva: number;
  reservaRapida: number;
}

/**
 * @interface LengthOccupancyStats
 * @description Estatísticas de ocupação por comprimento de vaga.
 *
 * @property {number} availableLengthMeters - Comprimento total disponível (metros)
 * @property {number} occupiedLengthMeters - Comprimento ocupado (metros)
 * @property {number} occupancyRatePercent - Taxa de ocupação por comprimento (%)
 */
export interface LengthOccupancyStats {
  availableLengthMeters: number;
  occupiedLengthMeters: number;
  occupancyRatePercent: number;
}

// ============================================================================
// 4. ROTAS DE VEÍCULOS
// ============================================================================

/**
 * @interface VehicleRouteStop
 * @description Parada na rota de um veículo.
 *
 * @property {'RESERVA' | 'RESERVA_RAPIDA'} source - Tipo de reserva
 * @property {string} inicio - Data/hora de início (ISO)
 * @property {string} fim - Data/hora de fim (ISO)
 * @property {string | null} cidadeOrigem - Cidade de origem do veículo
 * @property {string | null} entradaCidade - Ponto de entrada na cidade
 * @property {string} vagaId - ID da vaga utilizada
 * @property {string} vagaLabel - Identificação da vaga (ex: 'Md-1234')
 */
export interface VehicleRouteStop {
  source: 'RESERVA' | 'RESERVA_RAPIDA';
  inicio: string;
  fim: string;
  cidadeOrigem: string | null;
  entradaCidade: string | null;
  vagaId: string;
  vagaLabel: string;
}

/**
 * @interface VehicleRouteReport
 * @description Relatório completo de rota de um veículo.
 *
 * @property {string} placa - Placa do veículo
 * @property {string} periodStart - Início do período analisado (ISO)
 * @property {string} periodEnd - Fim do período analisado (ISO)
 * @property {VehicleRouteStop[]} stops - Paradas realizadas no período
 */
export interface VehicleRouteReport {
  placa: string;
  periodStart: string;
  periodEnd: string;
  stops: VehicleRouteStop[];
}

// ============================================================================
// 5. INTERFACE PRINCIPAL DO DASHBOARD
// ============================================================================

/**
 * @interface DashboardSummary
 * @description Resumo completo do dashboard com todas as métricas.
 *
 * @property {DashboardKPIs} kpis - Indicadores principais
 * @property {VehicleType[]} vehicleTypes - Distribuição por tipo de veículo
 * @property {LocationStat[]} districts - Estatísticas por bairro
 * @property {LocationStat[]} origins - Locais de origem
 * @property {LocationStat[]} entryOrigins - Pontos de entrada
 * @property {LocationStat[]} mostUsedVagas - Vagas mais utilizadas
 * @property {StayDurationStats} [stayDurationStats] - Tempo de permanência
 * @property {ActiveDuringPeriodStats} [activeDuringPeriodStats] - Usuários ativos
 * @property {LengthOccupancyStats} [lengthOccupancyStats] - Ocupação por comprimento
 * @property {VehicleRouteReport[]} [vehicleRoutes] - Rotas de veículos
 */
export interface DashboardSummary {
  kpis: DashboardKPIs;
  vehicleTypes: VehicleType[];
  districts: LocationStat[];
  origins: LocationStat[];
  entryOrigins: LocationStat[];
  mostUsedVagas: LocationStat[];
  stayDurationStats?: StayDurationStats;
  activeDuringPeriodStats?: ActiveDuringPeriodStats;
  lengthOccupancyStats?: LengthOccupancyStats;
  vehicleRoutes?: VehicleRouteReport[];
}

// ============================================================================
// 6. FILTROS E UTILITÁRIOS
// ============================================================================

/**
 * @interface DateRange
 * @description Intervalo de datas para filtros.
 *
 * @property {string} startDate - Data inicial (ISO)
 * @property {string} endDate - Data final (ISO)
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * @interface DashboardFilters
 * @description Filtros aplicáveis ao dashboard.
 *
 * @property {string} [startDate] - Data inicial opcional
 * @property {string} [endDate] - Data final opcional
 */
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
}

/**
 * @interface AdvancedMetricCard
 * @description Configuração para cards de métricas avançadas.
 *
 * @property {string} title - Título do card
 * @property {string | number} value - Valor principal
 * @property {string} description - Descrição do valor
 * @property {string} icon - Nome do ícone Lucide
 * @property {'blue' | 'green' | 'purple' | 'orange' | 'red'} color - Cor temática
 * @property {Array<{label: string; value: string | number}>} [subItems] - Subitens
 */
export interface AdvancedMetricCard {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  subItems?: Array<{
    label: string;
    value: string | number;
  }>;
}

/**
 * @interface RouteTimelineItem
 * @description Item para timeline de rota de veículo.
 *
 * @property {string} id - Identificador único
 * @property {string} time - Horário formatado
 * @property {string} title - Título do evento
 * @property {string} description - Descrição detalhada
 * @property {'parking' | 'origin' | 'entry' | 'destination'} icon - Tipo de ícone
 * @property {'blue' | 'green' | 'purple' | 'gray'} color - Cor do ícone
 */
export interface RouteTimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: 'parking' | 'origin' | 'entry' | 'destination';
  color: 'blue' | 'green' | 'purple' | 'gray';
}

/**
 * @interface LengthOccupancyChartData
 * @description Dados formatados para gráfico de ocupação por comprimento.
 *
 * @property {string} label - Rótulo do item
 * @property {number} available - Comprimento disponível (metros)
 * @property {number} occupied - Comprimento ocupado (metros)
 * @property {number} percentage - Percentual de ocupação
 */
export interface LengthOccupancyChartData {
  label: string;
  available: number;
  occupied: number;
  percentage: number;
}

/**
 * @interface DurationStatsDisplay
 * @description Estatísticas de tempo formatadas para exibição.
 *
 * @property {string} avg - Tempo médio formatado (ex: "2h 30min")
 * @property {string | null} min - Tempo mínimo formatado (ex: "30min")
 * @property {string | null} max - Tempo máximo formatado (ex: "8h 15min")
 */
export interface DurationStatsDisplay {
  avg: string;
  min: string | null;
  max: string | null;
}
