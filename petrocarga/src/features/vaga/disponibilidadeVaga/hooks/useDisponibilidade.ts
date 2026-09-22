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

interface UseVeiculoReturn {
  disponibilidades: DisponibildadeVagaResponse[];
  loading: boolean;
  error: string | null;
  buscar: (params?: DisponibilidadesParam) => Promise<void>;
  recarregar: () => Promise<void>;
}
export function useDisponibilidade({
  params,
  buscarAutomaticamente = true,
}: UseDisponibilidadeOptions): UseVeiculoReturn {
  const [disponibilidades, setDisponibilidades] = useState<
    DisponibildadeVagaResponse[]
  >([]);
  const { loading, error, execute } = useApi();

  const buscar = useCallback(
    async (novosParams?: DisponibilidadesParam) => {
      const parametros = novosParams ?? params;

      if (!parametros) {
        return;
      }

      const response = await execute(() => getDisponibilidadeVagas(parametros));

      if (response) {
        setDisponibilidades(response);
      }
    },
    [params, execute],
  );

  const recarregar = useCallback(async () => {
    await buscar(params);
  }, [buscar, params]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscar();
    }
  }, [buscarAutomaticamente, buscar]);

  return {
    disponibilidades,
    loading,
    error,
    buscar,
    recarregar,
  };
}
