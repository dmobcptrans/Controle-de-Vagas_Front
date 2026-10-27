'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useApi } from '@/services/hooks/useApi';

import { getMotoristaEmpresa } from '../../empresas/services/empresaApi2';

import {
  EmpresaParams,
  MotoristaEmpresaResponse,
  MotoristaEmpresaPaginadoResponse,
} from '../../empresas/types/empresa2';

interface UseMotoristasEmpresaOptions {
  empresaId: string;
  params?: EmpresaParams;
  buscarAutomaticamente?: boolean;
}

interface UseMotoristasEmpresaReturn {
  motoristas: MotoristaEmpresaResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;

  buscar: (
    params?: EmpresaParams,
  ) => Promise<MotoristaEmpresaPaginadoResponse | undefined>;

  recarregar: () => Promise<MotoristaEmpresaPaginadoResponse | undefined>;
}

const DEFAULT_PARAMS: EmpresaParams = {};

export function useMotoristasEmpresa({
  empresaId,
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseMotoristasEmpresaOptions): UseMotoristasEmpresaReturn {
  const [motoristas, setMotoristas] = useState<MotoristaEmpresaResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  /**
   * Mantém os parâmetros atuais sem fazer o `buscar`
   * mudar de referência a cada render.
   */
  const paramsRef = useRef<EmpresaParams>(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const buscar = useCallback(
    async (
      novosParams?: EmpresaParams,
    ): Promise<MotoristaEmpresaPaginadoResponse | undefined> => {
      const parametros = novosParams ?? paramsRef.current;

      const response = await execute(() =>
        getMotoristaEmpresa(empresaId, parametros),
      );

      if (!response) return;

      setMotoristas(response.content);
      setPagina(response.pagina);
      setTotalPaginas(response.totalPaginas);
      setTotalElementos(response.totalElementos);

      return response;
    },
    [execute, empresaId],
  );

  const recarregar = useCallback(async () => {
    return await buscar(paramsRef.current);
  }, [buscar]);

  useEffect(() => {
    if (!buscarAutomaticamente) return;

    buscar();
  }, [buscarAutomaticamente, buscar]);

  return {
    motoristas,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    buscar,
    recarregar,
  };
}
