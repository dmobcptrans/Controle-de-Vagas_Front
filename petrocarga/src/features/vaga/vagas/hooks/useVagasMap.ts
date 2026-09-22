'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { VagasMapaParams, VagasMapaResponse } from '../types/vaga';

import { useApi } from '@/services/hooks/useApi';
import { getVagasPorMapa } from '../service/vagaApi';

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
  const [vagasMap, setVagasMap] = useState<VagasMapaResponse | null>(null);

  const { loading, error, execute } = useApi();

  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const buscar = useCallback(
    async (novosParams?: VagasMapaParams) => {
      const parametrosBusca = novosParams ?? params;

      if (!parametrosBusca) {
        return;
      }

      const response = await execute(() => getVagasPorMapa(parametrosBusca));

      if (response) {
        setVagasMap(response);
      }
    },
    [params, execute],
  );

  const recarregar = useCallback(async () => {
    await buscar();
  }, [buscar]);

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
