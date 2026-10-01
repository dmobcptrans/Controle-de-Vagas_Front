'use client';

import { useApi } from '@/services/hooks/useApi';

import { CriarGestor, AtualizarGestor, DeleteGestor } from '../services/gestorApi2';

import { gestorPayload, atualizarGestorPayload, gestorResponse } from '../types/gestor2';

interface UseGestorMutationReturn {
  loading: boolean;
  error: string | null;

  criar: (
    payload: gestorPayload,
  ) => Promise<gestorResponse | null>;

  atualizar: (
    gestorId: string,
    payload: atualizarGestorPayload,
  ) => Promise<boolean>;

  deletar: (gestorId: string) => Promise<boolean>;

  limparError: () => void;
}

export function useGestorMutation(): UseGestorMutationReturn {
  const { loading, error, execute, limparError } = useApi();

  const criar = async (payload: gestorPayload) => {
    return execute(() => CriarGestor(payload));
  };

  const atualizar = async (
    gestorId: string,
    payload: atualizarGestorPayload,
  ) => {
    const response = await execute(() =>
      AtualizarGestor(gestorId, payload),
    );

    return response !== null;
  };

  const deletar = async (gestorId: string) => {
    const response = await execute(() => DeleteGestor(gestorId));

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
