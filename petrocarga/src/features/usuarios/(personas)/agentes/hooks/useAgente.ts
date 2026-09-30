'use client';

import { useCallback, useEffect, useState } from 'react';

import { useApi } from '@/services/hooks/useApi';

import { agenteResponse } from '../types/agente2';
import { getAgentePorId } from '../services/agenteApi2';

interface UseAgenteOptions {
  agenteId: string;
  buscarAutomaticamente?: boolean;
}

interface UseAgenteReturn {
  agente: agenteResponse | null;
  loading: boolean;
  error: string | null;
  buscar: () => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useAgente({
  agenteId,
  buscarAutomaticamente = true,
}: UseAgenteOptions): UseAgenteReturn {
  const [agente, setAgente] = useState<agenteResponse | null>(null);
  const { loading, error, execute } = useApi();

  const buscar = useCallback(async () => {
    const response = await execute(() => getAgentePorId(agenteId));

    if (response) {
      setAgente(response);
    }
  }, [agenteId, execute]);

  const recarregar = useCallback(async () => {
    await buscar();
  }, [buscar]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscar();
    }
  }, [buscarAutomaticamente, buscar]);

  return {
    agente,
    loading,
    error,
    buscar,
    recarregar,
  };
}
