'use client';

import { useApi } from '@/services/hooks/useApi';

import {
  criarVeiculo,
  atualizarVeiculo,
  deletarVeiculo,
} from '../services/veiculoApi';

import { VeiculoPayload, VeiculoResponse } from '../types/veiculo';

interface UseVeiculoMutationReturn {
  loading: boolean;
  error: string | null;

  criar: (
    usuarioId: string,
    payload: VeiculoPayload,
  ) => Promise<VeiculoResponse | null>;

  atualizar: (
    veiculoId: string,
    usuarioId: string,
    payload: VeiculoPayload,
  ) => Promise<boolean>;

  deletar: (veiculoId: string) => Promise<boolean>;

  limparError: () => void;
}

export function useVeiculoMutation(): UseVeiculoMutationReturn {
  const { loading, error, execute, limparError } = useApi();

  const criar = async (usuarioId: string, payload: VeiculoPayload) => {
    return execute(() => criarVeiculo(usuarioId, payload));
  };

  const atualizar = async (
    veiculoId: string,
    usuarioId: string,
    payload: VeiculoPayload,
  ) => {
    const response = await execute(() =>
      atualizarVeiculo(veiculoId, usuarioId, payload),
    );

    return response !== null;
  };

  const deletar = async (veiculoId: string) => {
    const response = await execute(() => deletarVeiculo(veiculoId));

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
