/**
 * @module types/reservaRapida
 * @description Definições de tipos TypeScript para o módulo de Reservas Rápidas.
 * Reservas rápidas são criadas por agentes para motoristas sem cadastro completo.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. ReservaRapida - Representação de uma reserva rápida
 */

/**
 * @interface ReservaRapida
 * @description Representa uma reserva rápida criada por um agente.
 * Diferente das reservas normais, não requer cadastro completo do motorista
 * ou veículo - apenas informações básicas.
 *
 * ----------------------------------------------------------------------------
 * 🔍 IDENTIFICADORES
 * ----------------------------------------------------------------------------
 * @property {string} id - ID único da reserva rápida
 * @property {string} vagaId - ID da vaga reservada
 * @property {string} agenteId - ID do agente que criou a reserva
 *
 * ----------------------------------------------------------------------------
 * 📍 ENDEREÇO DA VAGA
 * ----------------------------------------------------------------------------
 * @property {string} logradouro - Nome da rua/avenida (desnormalizado para consulta rápida)
 * @property {string} bairro - Bairro da vaga (desnormalizado para consulta rápida)
 *
 * ----------------------------------------------------------------------------
 * 🚗 VEÍCULO
 * ----------------------------------------------------------------------------
 * @property {string} tipoVeiculo - Tipo do veículo (ex: 'AUTOMOVEL', 'CAMINHAO')
 * @property {string} placa - Placa do veículo (único identificador do motorista)
 *
 * ----------------------------------------------------------------------------
 * ⏰ DATAS
 * ----------------------------------------------------------------------------
 * @property {string} inicio - Data/hora de início da reserva (ISO string)
 * @property {string} fim - Data/hora de fim da reserva (ISO string)
 * @property {string} triadoEm - Data/hora de criação da reserva (ISO string)
 *
 * ----------------------------------------------------------------------------
 * 📊 STATUS
 * ----------------------------------------------------------------------------
 * @property {'RESERVADA' | 'CANCELADA' | 'EXPIRADA'} status - Status da reserva
 *   - RESERVADA: Reserva ativa/agendada
 *   - CANCELADA: Reserva cancelada pelo agente
 *   - EXPIRADA: Reserva que passou do prazo sem utilização
 *
 * @example
 * ```ts
 * const reservaRapida: ReservaRapida = {
 *   id: 'rap123',
 *   vagaId: 'vaga456',
 *   agenteId: 'agent789',
 *
 *   logradouro: 'Rua do Imperador',
 *   bairro: 'Centro',
 *
 *   tipoVeiculo: 'AUTOMOVEL',
 *   placa: 'ABC1234',
 *
 *   inicio: '2024-01-15T08:00:00Z',
 *   fim: '2024-01-15T18:00:00Z',
 *   triadoEm: '2024-01-10T14:30:00Z',
 *
 *   status: 'RESERVADA'
 * };
 * ```
 */
export interface ReservaRapida {
  id: string;
  vagaId: string;
  agenteId: string;
  logradouro: string;
  bairro: string;
  tipoVeiculo: string;
  posicaoPerpendicular: number
  cidadeOrigem: string;
  placa: string;
  inicio: string;
  fim: string;
  triadoEm: string;
  status: 'RESERVADA' | 'ATIVA' | 'CONCLUIDA' | 'CANCELADA' | 'REMOVIDA';
}

/**
 * @interface PaginatedReservaRapidaResponse
 * @description Resposta paginada da API de reservas rápidas com os filtros aplicados
 */
export interface PaginatedReservaRapidaResponse {
  // Dados paginados
  content: ReservaRapida[];
  totalElements: number;
  totalPaginas: number;
  tamanhoPagina: number;
  pagina: number;

  // Filtros aplicados na consulta
  vagaId?: string;
  placaVeiculo?: string;
  data?: string;
  listaStatus?: Array<
    'RESERVADA' | 'ATIVA' | 'CONCLUIDA' | 'REMOVIDA' | 'CANCELADA'
  >;
}
