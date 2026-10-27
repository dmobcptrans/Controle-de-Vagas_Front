'use client';

import { useApi } from '@/services/hooks/useApi';
import {
  atualizarDisponibilidadeVagas,
  criarMultiplasDisponibilidadesVaga,
  deleteDisponibilidadeVagas,
} from '../services/disponibilidadeVagasApi';
import {
  DisponibilidadeVagasPayload,
  DisponibildadeVagaResponse,
  DisponibilidadeVagasMultiplasPayload,
} from '../types/disponibilidadeVaga';

interface UseDisponibilidadeReturn {
  loading: boolean;
  error: string | null;

  criar: (
    payload: DisponibilidadeVagasMultiplasPayload,
  ) => Promise<DisponibildadeVagaResponse | null>;

  atualizar: (
    disponibilidadeId: string,
    payload: DisponibilidadeVagasPayload,
  ) => Promise<boolean>;

  deletar: (disponibilidadeId: string) => Promise<boolean>;

  limparError: () => void;
}

export function useDisponibiliadadeMutation(): UseDisponibilidadeReturn {
  const { loading, error, execute, limparError } = useApi();

  const criar = async (payload: DisponibilidadeVagasMultiplasPayload) => {
    return execute(() => criarMultiplasDisponibilidadesVaga(payload));
  };

  const atualizar = async (
    disponibilidadeId: string,
    payload: DisponibilidadeVagasPayload,
  ) => {
    const response = await execute(() =>
      atualizarDisponibilidadeVagas(disponibilidadeId, payload),
    );
    return response !== null;
  };

  const deletar = async (disponibilidadeId: string) => {
    const response = await execute(() =>
      deleteDisponibilidadeVagas(disponibilidadeId),
    );
    return response !== null;
  };

  return {
    loading,
    error,
    criar,
    atualizar,
    deletar,
    limparError,
  };
}
