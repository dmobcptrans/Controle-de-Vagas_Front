'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getGestores } from '../services/gestorApi';
import { gestorParams, gestorResponse } from '../types/gestor';
import { useApi } from '@/services/hooks/useApi';

interface UseGestoresOptions {
  params?: gestorParams;
  buscarAutomaticamente?: boolean;
}

interface UseGestoresReturn {
  gestores: gestorResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscar: (params?: gestorParams) => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: gestorParams = {};

export function useGestores({
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseGestoresOptions): UseGestoresReturn {
  const [gestores, setGestores] = useState<gestorResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  /**
   * Mantém os parâmetros atuais sem fazer o `buscar`
   * mudar de referência a cada render.
   */
  const paramsRef = useRef<gestorParams>(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const buscar = useCallback(
    async (novosParams?: gestorParams) => {
      const parametros = novosParams ?? paramsRef.current;

      const response = await execute(() => getGestores(parametros));

      if (!response) return;

      setGestores(response.content);
      setPagina(response.pagina);
      setTotalPaginas(response.totalPaginas);
      setTotalElementos(response.totalElementos);
    },
    [execute],
  );

  const recarregar = useCallback(async () => {
    await buscar(paramsRef.current);
  }, [buscar]);

  /**
   * Busca automática somente quando:
   * - estiver habilitada
   * - existir usuarioId
   *
   * Não depende de `params` nem de `buscar`.
   */
  useEffect(() => {
    if (!buscarAutomaticamente) return;

    buscar();
  }, [buscarAutomaticamente, buscar]);

  return {
    gestores,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    buscar,
    recarregar,
  };
}
