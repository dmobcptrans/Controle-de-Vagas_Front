'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useApi } from '@/services/hooks/useApi';

import { getVagasPorMapa } from '../service/vagaApi';
import {
  VagasMapaParams,
  VagasMapaResponse,
} from '../types/vaga';

interface UseVagasMapOptions {
  params?: VagasMapaParams;
  buscarAutomaticamente?: boolean;
}

interface UseVagasMapReturn {
  vagasMap: VagasMapaResponse | null;
  loading: boolean;
  error: string | null;
  buscar: (params?: VagasMapaParams) => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useVagasMap({
  params,
  buscarAutomaticamente = true,
}: UseVagasMapOptions): UseVagasMapReturn {
  const [vagasMap, setVagasMap] =
    useState<VagasMapaResponse | null>(null);

  const { loading, error, execute } = useApi();

  const paramsRef = useRef<VagasMapaParams | undefined>(params);

  /**
   * Mantém os parâmetros atuais disponíveis
   * sem precisar recriar `buscar`.
   */
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  /**
   * Busca as vagas.
   *
   * A função não depende de `params`.
   * Isso evita que a referência de `buscar`
   * seja alterada simplesmente porque os parâmetros
   * mudaram.
   */
  const buscar = useCallback(
  async (novosParams?: VagasMapaParams) => {
    const parametrosBusca =
      novosParams ?? paramsRef.current;

    if (!parametrosBusca) {
      return;
    }

    const response = await execute(() =>
      getVagasPorMapa(parametrosBusca),
    );

    if (response) {
      setVagasMap(response);
    }
  },
  [execute],
);
  const recarregar = useCallback(async () => {
    await buscar();
  }, [buscar]);

  /**
   * Busca automática somente quando habilitada.
   */
  useEffect(() => {
    if (!buscarAutomaticamente || !params) {
      return;
    }

    buscar(params);
  }, [buscarAutomaticamente, params, buscar]);

  return {
    vagasMap,
    loading,
    error,
    buscar,
    recarregar,
  };
}