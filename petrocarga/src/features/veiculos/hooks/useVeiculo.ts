'use client';

import { useCallback, useEffect, useState } from 'react';

import { getVeiculoPorId } from '../services/veiculoApi';

import { VeiculoResponse } from '../types/veiculo';

import { useApi } from '@/services/hooks/useApi';

interface UseVeiculoOptions {
  veiculoId: string;
  buscarAutomaticamente?: boolean;
}

interface UseVeiculoReturn {
  veiculo: VeiculoResponse | null;
  loading: boolean;
  error: string | null;
  buscar: () => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useVeiculo({
  veiculoId,
  buscarAutomaticamente = true,
}: UseVeiculoOptions): UseVeiculoReturn {
  const [veiculo, setVeiculo] = useState<VeiculoResponse | null>(null);
  const { loading, error, execute } = useApi();

  const buscar = useCallback(async () => {
    const response = await execute(() => getVeiculoPorId(veiculoId));

    if (response) {
      setVeiculo(response);
    }
  }, [veiculoId, execute]);

  const recarregar = useCallback(async () => {
    await buscar();
  }, [buscar]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscar();
    }
  }, [buscarAutomaticamente, buscar]);

  return {
    veiculo,
    loading,
    error,
    buscar,
    recarregar,
  };
}
