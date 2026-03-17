import { Veiculo } from './veiculo';

/**
 * @module types/reservaState
 * @description Definições de tipos TypeScript para o gerenciamento de estado
 * do fluxo de reserva em múltiplas etapas.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. ReservaState - Estado completo do fluxo de reserva
 */

/**
 * @interface ReservaState
 * @description Gerencia o estado do fluxo de reserva em múltiplas etapas.
 * Suporta tanto reservas de motoristas (com veículo selecionado) quanto
 * reservas rápidas de agentes (com placa e tipo de veículo).
 *
 * ----------------------------------------------------------------------------
 * 📊 CONTROLE DE FLUXO
 * ----------------------------------------------------------------------------
 * @property {number} step - Etapa atual do fluxo (0: seleção de data, 1: dados, 2: confirmação)
 *
 * ----------------------------------------------------------------------------
 * 📅 SELEÇÃO DE DATA/HORA
 * ----------------------------------------------------------------------------
 * @property {Date} [selectedDay] - Dia selecionado para a reserva
 * @property {string[]} availableTimes - Horários disponíveis para reserva
 * @property {string[]} reservedTimesStart - Horários de início já reservados
 * @property {string[]} reservedTimesEnd - Horários de fim já reservados
 * @property {string | null} startHour - Hora de início selecionada
 * @property {string | null} endHour - Hora de fim selecionada
 *
 * ----------------------------------------------------------------------------
 * 📍 ORIGEM
 * ----------------------------------------------------------------------------
 * @property {string} origin - Cidade/local de origem do veículo
 * @property {string | null} entryCity - Ponto de entrada na cidade (opcional)
 *
 * ----------------------------------------------------------------------------
 * 👤 DADOS DO MOTORISTA (reserva normal)
 * ----------------------------------------------------------------------------
 * @property {string} [selectedVehicleId] - ID do veículo selecionado pelo motorista
 *
 * ----------------------------------------------------------------------------
 * 🚗 DADOS DO AGENTE (reserva rápida)
 * ----------------------------------------------------------------------------
 * @property {Veiculo['tipo']} [tipoVeiculoAgente] - Tipo do veículo para reserva rápida
 * @property {string} placaAgente - Placa do veículo para reserva rápida
 *
 * @example
 * ```ts
 * // Estado inicial
 * const initialState: ReservaState = {
 *   step: 0,
 *   availableTimes: [],
 *   reservedTimesStart: [],
 *   reservedTimesEnd: [],
 *   startHour: null,
 *   endHour: null,
 *   origin: '',
 *   entryCity: null,
 *   placaAgente: ''
 * };
 *
 * // Estado durante reserva de motorista
 * const motoristaState: ReservaState = {
 *   ...initialState,
 *   step: 1,
 *   selectedDay: new Date('2024-01-15'),
 *   startHour: '08:00',
 *   endHour: '18:00',
 *   origin: 'Petrópolis',
 *   selectedVehicleId: 'veic123'
 * };
 *
 * // Estado durante reserva de agente
 * const agenteState: ReservaState = {
 *   ...initialState,
 *   step: 2,
 *   selectedDay: new Date('2024-01-15'),
 *   startHour: '08:00',
 *   endHour: '18:00',
 *   origin: 'Petrópolis',
 *   tipoVeiculoAgente: 'AUTOMOVEL',
 *   placaAgente: 'ABC1234'
 * };
 * ```
 */
export interface ReservaState {
  // Controle de fluxo
  step: number;

  // Seleção de data/hora
  selectedDay?: Date;
  availableTimes: string[];
  reservedTimesStart: string[];
  reservedTimesEnd: string[];
  startHour: string | null;
  endHour: string | null;

  // Origem
  origin: string;
  entryCity: string | null;

  // Dados do motorista (reserva normal)
  selectedVehicleId?: string;

  // Dados do agente (reserva rápida)
  tipoVeiculoAgente?: Veiculo['tipo'];
  placaAgente: string;
}
