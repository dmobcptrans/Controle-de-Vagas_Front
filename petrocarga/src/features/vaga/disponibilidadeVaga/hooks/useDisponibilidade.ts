'use client';

import { useCallback, useEffect, useState } from 'react';

import { getDisponibilidadeVagas } from '@/features/vaga/disponibilidadeVaga/services/disponibilidadeVagasApi';

import {
  DisponibildadeVagaResponse,
  DisponibilidadesParam,
} from '@/features/vaga/disponibilidadeVaga/types/disponibilidadeVaga';

import { useApi } from '@/services/hooks/useApi';

interface UseDisponibilidadeOptions {
  params?: DisponibilidadesParam;
  buscarAutomaticamente?: boolean;
}

interface UseDisponibilidadeReturn {
  disponibilidades: DisponibildadeVagaResponse[];
  loading: boolean;
  error: string | null;
  buscar: (params?: DisponibilidadesParam) => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useDisponibilidade({
  params,
  buscarAutomaticamente = true,
}: UseDisponibilidadeOptions): UseDisponibilidadeReturn {
  const [disponibilidades, setDisponibilidades] = useState<
    DisponibildadeVagaResponse[]
  >([]);

  const { loading, error, execute } = useApi();

  // ==================== BUSCAR ====================

  const buscar = useCallback(
    async (novosParams?: DisponibilidadesParam) => {
      const parametros = novosParams ?? params;

      if (!parametros) {
        return;
      }

      const response = await execute(() =>
        getDisponibilidadeVagas(parametros),
      );

      if (response) {
        setDisponibilidades(response);
      }
    },
    [params, execute],
  );

  // ==================== RECARREGAR ====================

  const recarregar = useCallback(async () => {
    if (!params) {
      return;
    }

    await buscar(params);
  }, [buscar, params]);

  // ==================== BUSCA AUTOMÁTICA ====================

  useEffect(() => {
    if (!buscarAutomaticamente || !params) {
      return;
    }

    buscar(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    buscarAutomaticamente,
    params?.ano,
    params?.mes,
  ]);

  return {
    disponibilidades,
    loading,
    error,
    buscar,
    recarregar,
  };
}