'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getAgentes } from '../services/agenteApi2';
import { agenteParams, agenteResponse } from '../types/agente2';
import { useApi } from '@/services/hooks/useApi';

interface UseAgentesOptions {
  usuarioId?: string;
  params?: agenteParams;
  buscarAutomaticamente?: boolean;
}

interface UseAgenteReturn {
  agentes: agenteResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscar: (params?: agenteParams) => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: agenteParams = {};

export function useAgentes({
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseAgentesOptions): UseAgenteReturn {
  const [agentes, setAgentes] = useState<agenteResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  /**
   * Mantém os parâmetros atuais sem fazer o `buscar`
   * mudar de referência a cada render.
   */
  const paramsRef = useRef<agenteParams>(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const buscar = useCallback(
    async (novosParams?: agenteParams) => {
      const parametros = novosParams ?? paramsRef.current;

      const response = await execute(() =>
        getAgentes(parametros),
      );

      if (!response) return;

      setAgentes(response.content);
      setPagina(response.pagina);
      setTotalPaginas(response.totalPaginas);
      setTotalElementos(response.totalElementos);
    },
    [execute],
  );

  const recarregar = useCallback(async () => {
    await buscar(paramsRef.current);
  }, [buscar]);


  useEffect(() => {
    if (!buscarAutomaticamente) return;

    buscar();
  }, [buscarAutomaticamente, buscar]);

  return {
    agentes,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    buscar,
    recarregar,
  };
}