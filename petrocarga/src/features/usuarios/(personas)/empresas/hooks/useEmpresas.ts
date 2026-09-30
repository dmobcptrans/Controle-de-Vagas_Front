'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getEmpresas } from '../services/empresaApi2';
import { EmpresaParams, EmpresaResponse } from '../types/empresa2';
import { useApi } from '@/services/hooks/useApi';

interface UseEmpresaOptions {
  params?: EmpresaParams;
  buscarAutomaticamente: boolean;
}

interface UseEmpresaReturn {
  empresas: EmpresaResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscar: (params?: EmpresaParams) => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: EmpresaParams = {};

export function UseEmpresas({
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseEmpresaOptions): UseEmpresaReturn {
  const [empresas, setEmpresas] = useState<EmpresaResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  const paramsRef = useRef<EmpresaParams>(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const buscar = useCallback(
    async (novosParams?: EmpresaParams) => {
      const parametros = novosParams ?? paramsRef.current;

      const response = await execute(() => getEmpresas(parametros));

      if (!response) return;

      setEmpresas(response.content);
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
    empresas,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    buscar,
    recarregar,
  };
}
