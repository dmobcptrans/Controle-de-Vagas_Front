'use client';

import { useApi } from '@/services/hooks/useApi';

import { criarVaga, atualizarVaga, deleteVaga } from '../service/vagaApi';

import { VagaPayload, VagaResponse } from '../types/vaga';

interface UseVagaMutationReturn {
  loading: boolean;
  error: string | null;

  criar: (payload: VagaPayload) => Promise<VagaResponse | null>;

  atualizar: (vagaId: string, payload: VagaPayload) => Promise<boolean>;

  deletar: (vagaId: string) => Promise<boolean>;

  limparError: () => void;
}

export function useVagaMutation(): UseVagaMutationReturn {
  const { loading, error, execute, limparError } = useApi();

  const criar = async (payload: VagaPayload) => {
    return execute(() => criarVaga(payload));
  };

  const atualizar = async (vagaId: string, payload: VagaPayload) => {
    const response = await execute(() => atualizarVaga(vagaId, payload));
    return response !== null;
  };

  const deletar = async (vagaid: string) => {
    const response = await execute(() => deleteVaga(vagaid));
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
