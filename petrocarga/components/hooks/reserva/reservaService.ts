import {
  getReservasBloqueios,
  reservarVaga,
  reservarVagaAgente,
} from '@/lib/api/reservaApi';
import { getDisponibilidadeVagasByVagaId } from '@/lib/api/disponibilidadeVagasApi';
import { ConfirmResult } from '@/lib/types/confirmResult';

/**
 * @module services/reservaService
 * @description Camada de serviço para operações de reserva.
 * Fornece funções para consultar bloqueios, disponibilidade e confirmar reservas.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. fetchReservasBloqueios - Busca bloqueios de horário para uma vaga
 * 2. fetchDisponibilidadeByVagaId - Busca disponibilidades de uma vaga (com cache)
 * 3. confirmarReserva - Confirma reserva para motorista
 * 4. confirmarReservaAgente - Confirma reserva rápida para agente
 */

// ==================== CACHE DE DISPONIBILIDADE ====================
/**
 * Cache de requisições em andamento para evitar chamadas duplicadas
 * Mapeia vagaId → Promise da requisição
 */
const disponibilidadeInFlight = new Map<
  string,
  Promise<Awaited<ReturnType<typeof getDisponibilidadeVagasByVagaId>>>
>();

// ----------------- BUSCAR BLOQUEIOS -----------------

/**
 * @function fetchReservasBloqueios
 * @description Busca reservas que bloqueiam horários em uma data específica.
 * 
 * @param vagaId - ID da vaga
 * @param data - Data no formato YYYY-MM-DD
 * @param tipoVeiculo - Tipo do veículo
 * @returns Promise<Reserva[]> - Lista de reservas bloqueantes
 * 
 * @example
 * ```ts
 * const bloqueios = await fetchReservasBloqueios(
 *   'vaga123',
 *   '2024-01-15',
 *   'AUTOMOVEL'
 * );
 * ```
 */
export const fetchReservasBloqueios = async (
  vagaId: string,
  data: string,
  tipoVeiculo: 'AUTOMOVEL' | 'VUC' | 'CAMINHONETA' | 'CAMINHAO_MEDIO' | 'CAMINHAO_LONGO',
) => {
  try {
    const bloqueios = await getReservasBloqueios(vagaId, data, tipoVeiculo);
    return bloqueios;
  } catch (error) {
    console.error('Erro ao buscar bloqueios:', error);
    throw error; 
  }
};

// ----------------- BUSCAR DISPONIBILIDADE POR VAGA (COM CACHE) -----------------

/**
 * @function fetchDisponibilidadeByVagaId
 * @description Busca disponibilidades de uma vaga com cache de requisições.
 * 
 * Características:
 * - Evita chamadas duplicadas enquanto a primeira requisição está em andamento
 * - Limpa o cache após a conclusão
 * 
 * @param vagaId - ID da vaga
 * @returns Promise<Disponibilidade[]> - Lista de disponibilidades da vaga
 * 
 * @example
 * ```ts
 * // Múltiplas chamadas simultâneas para a mesma vaga
 * // Apenas uma requisição será feita
 * const [disps1, disps2] = await Promise.all([
 *   fetchDisponibilidadeByVagaId('vaga123'),
 *   fetchDisponibilidadeByVagaId('vaga123')
 * ]);
 * ```
 */
export const fetchDisponibilidadeByVagaId = async (vagaId: string) => {
  const inFlight = disponibilidadeInFlight.get(vagaId);
  if (inFlight) {
    return await inFlight;
  }

  const request = (async () => {
    try {
      const disponibilidades = await getDisponibilidadeVagasByVagaId(vagaId);
      return disponibilidades;
    } catch (error) {
      console.error(error);
      return [];
    }
  })();

  disponibilidadeInFlight.set(vagaId, request);
  try {
    return await request;
  } finally {
    disponibilidadeInFlight.delete(vagaId);
  }
};

// ----------------- CONFIRMAR RESERVA MOTORISTA -----------------

/**
 * @function confirmarReserva
 * @description Confirma uma reserva para motorista.
 * 
 * @param formData - FormData com dados da reserva
 * @returns Promise<ConfirmResult> - Resultado da operação
 * 
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('vagaId', 'vaga123');
 * formData.append('motoristaId', 'user456');
 * // ... outros campos
 * 
 * const result = await confirmarReserva(formData);
 * if (result.success) {
 *   toast.success('Reserva confirmada!');
 * }
 * ```
 */
export const confirmarReserva = async (
  formData: FormData,
): Promise<ConfirmResult> => {
  const result = await reservarVaga(formData);

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  return { success: true };
};

// ----------------- CONFIRMAR RESERVA AGENTE -----------------

/**
 * @function confirmarReservaAgente
 * @description Confirma uma reserva rápida para agente.
 * 
 * @param formData - FormData com dados da reserva rápida
 * @returns Promise<ConfirmResult> - Resultado da operação
 * 
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('vagaId', 'vaga123');
 * formData.append('tipoVeiculo', 'AUTOMOVEL');
 * formData.append('placa', 'ABC1234');
 * // ... outros campos
 * 
 * const result = await confirmarReservaAgente(formData);
 * if (result.success) {
 *   toast.success('Reserva rápida confirmada!');
 * }
 * ```
 */
export const confirmarReservaAgente = async (
  formData: FormData,
): Promise<ConfirmResult> => {
  const result = await reservarVagaAgente(formData);

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  return { success: true };
};