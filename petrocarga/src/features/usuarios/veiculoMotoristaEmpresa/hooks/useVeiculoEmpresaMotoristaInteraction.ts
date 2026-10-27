'use client';

import { useState } from 'react';

import {
  VincularMotoristaAoVeiculo,
  DesvincularMotoristaAoVeiculo,
} from '../services/VeiculoEmpresaMotoristaApi';

import {
  MotoristaAoVeiculoPayload,
  VincularMotoristaAoVeiculoResponse,
} from '../types/veiculoMotoristaEmpresa';

import { useApi } from '@/services/hooks/useApi';

interface UseInteractionOptions {
  params?: MotoristaAoVeiculoPayload;
}

interface UseInteractionReturn {
  resposta: VincularMotoristaAoVeiculoResponse | null;
  loading: boolean;
  error: string | null;
  vincular: (
    payload?: MotoristaAoVeiculoPayload,
  ) => Promise<VincularMotoristaAoVeiculoResponse | null>;
  desvincular: (
    payload?: MotoristaAoVeiculoPayload,
  ) => Promise<VincularMotoristaAoVeiculoResponse | null>;
}

export function useVeiculoEmpresaMotoristaInteraction({
  params,
}: UseInteractionOptions = {}): UseInteractionReturn {
  const [resposta, setResposta] =
    useState<VincularMotoristaAoVeiculoResponse | null>(null);

  const { loading, error, execute } = useApi();

  const vincular = async (
    payload: MotoristaAoVeiculoPayload | undefined = params,
  ): Promise<VincularMotoristaAoVeiculoResponse | null> => {
    if (!payload) return null;

    const response = await execute(() => VincularMotoristaAoVeiculo(payload));
    if (response) setResposta(response);
    return response;
  };

  const desvincular = async (
    payload: MotoristaAoVeiculoPayload | undefined = params,
  ): Promise<VincularMotoristaAoVeiculoResponse | null> => {
    if (!payload) return null;

    const response = await execute(() => DesvincularMotoristaAoVeiculo(payload));
    if (response) setResposta(response);
    return response;
  };

  return {
    resposta,
    loading,
    error,
    vincular,
    desvincular,
  };
}