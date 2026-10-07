'use client';

import { useCallback, useEffect, useState } from 'react';

import { VagaResponse } from '../types/vaga';
import { useApi } from '@/services/hooks/useApi';
import { getVagaById } from '../service/vagaApi';

interface UseVagaOptions {
  vagaId?: string;
  buscarAutomaticamente?: boolean;
}

interface UseVagaReturn {
  vaga: VagaResponse | null;
  loading: boolean;
  error: string | null;
  buscar: (vagaId: string) => Promise<VagaResponse | null>;
  recarregar: (vagaId: string) => Promise<VagaResponse | null>;
}

export function useVaga({
  vagaId,
  buscarAutomaticamente = false,
}: UseVagaOptions = {}): UseVagaReturn {
  const [vaga, setVaga] = useState<VagaResponse | null>(null);

  const { loading, error, execute } = useApi();

  const buscar = useCallback(
    async (id: string): Promise<VagaResponse | null> => {
      if (!id) return null;

      const response = await execute(() => getVagaById(id));

      if (response) {
        setVaga(response);
      }

      return response ?? null;
    },
    [execute],
  );

  const recarregar = useCallback(
    async (id: string): Promise<VagaResponse | null> => {
      return buscar(id);
    },
    [buscar],
  );

  useEffect(() => {
    if (!buscarAutomaticamente || !vagaId) return;

    buscar(vagaId);
  }, [buscarAutomaticamente, vagaId, buscar]);

  return {
    vaga,
    loading,
    error,
    buscar,
    recarregar,
  };
}