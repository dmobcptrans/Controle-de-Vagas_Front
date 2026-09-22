'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  FiltrosVaga,
  VagaResponse,
  VagasFiltradasParams,
} from '../types/vaga';

import { useApi } from '@/services/hooks/useApi';
import { getVagas, getVagasFiltradas } from '../service/vagaApi';

interface UseVagasOptions {
  params?: VagasFiltradasParams;
  buscarAutomaticamente?: boolean;
}

interface UseVagasReturn {
  vagas: VagaResponse[];

  pagina: number;
  totalPaginas: number;
  totalElementos: number;

  loading: boolean;
  error: string | null;

  buscaPaginada: (params?: VagasFiltradasParams) => Promise<void>;

  buscarTodas: (params?: FiltrosVaga) => Promise<void>;

  recarregar: () => Promise<void>;
}

export function useVagas({
  params,
  buscarAutomaticamente = true,
}: UseVagasOptions): UseVagasReturn {
  const [vagas, setVagas] = useState<VagaResponse[]>([]);

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  /**
   * Busca paginada
   */
  const buscaPaginada = useCallback(
    async (novosParams?: VagasFiltradasParams) => {
      const parametrosBusca = novosParams ?? params;

      const response = await execute(() => getVagasFiltradas(parametrosBusca));

      if (response) {
        setVagas(response.content);
        setPagina(response.pagina);
        setTotalPaginas(response.totalPaginas);
        setTotalElementos(response.totalElementos);
      }
    },
    [params, execute],
  );

  /**
   * Busca todas as vagas
   */
  const buscarTodas = useCallback(
    async (filtros?: FiltrosVaga) => {
      const response = await execute(() => getVagas(filtros ?? {}));

      if (response) {
        setVagas(response);
        setPagina(0);
        setTotalPaginas(1);
        setTotalElementos(response.length);
      }
    },
    [execute],
  );

  /**
   * Recarrega a busca paginada atual
   */
  const recarregar = useCallback(async () => {
    await buscaPaginada(params);
  }, [buscaPaginada, params]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscaPaginada();
    }
  }, [buscarAutomaticamente, buscaPaginada]);

  return {
    vagas,
    pagina,
    totalPaginas,
    totalElementos,
    loading,
    error,
    buscaPaginada,
    buscarTodas,
    recarregar,
  };
}
