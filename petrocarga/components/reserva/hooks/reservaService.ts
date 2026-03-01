import {
  getReservasBloqueios,
  reservarVaga,
  reservarVagaAgente,
} from '@/lib/api/reservaApi';
import { getDisponibilidadeVagasByVagaId } from '@/lib/api/disponibilidadeVagasApi';
import { ConfirmResult } from '@/lib/types/confirmResult';

// ----------------- RESERVAS -----------------
const disponibilidadeInFlight = new Map<
  string,
  Promise<Awaited<ReturnType<typeof getDisponibilidadeVagasByVagaId>>>
>();

export const fetchReservasBloqueios = async (
  vagaId: string,
  data: string,
  tipoVeiculo:
    | 'AUTOMOVEL'
    | 'VUC'
    | 'CAMINHONETA'
    | 'CAMINHAO_MEDIO'
    | 'CAMINHAO_LONGO',
) => {
  try {
    const bloqueios = await getReservasBloqueios(vagaId, data, tipoVeiculo);
    return bloqueios;
  } catch (error) {
    console.error('Erro ao buscar bloqueios:', error);
    return [];
  }
};

// ----------------- DISPONIBILIDADE POR VAGAID -----------------

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
