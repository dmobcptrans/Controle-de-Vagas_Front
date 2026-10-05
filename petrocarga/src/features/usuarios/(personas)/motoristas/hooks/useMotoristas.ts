'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getMotoristas } from '../services/motoristaApi2';
import { MotoristaParams, MotoristaResumidoResponse } from '../types/motorista2';
import { useApi } from '@/services/hooks/useApi';

interface UseMotoristasOptions {
  params?: MotoristaParams;
  buscarAutomaticamente?: boolean;
}

interface UseMotoristasReturn {
  motoristas: MotoristaResumidoResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscar: (params?: MotoristaParams) => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: MotoristaParams = {};

export function useMotoristas({
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseMotoristasOptions): UseMotoristasReturn {
  const [motoristas, setMotoristas] = useState<MotoristaResumidoResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  /**
   * Mantém os parâmetros atuais sem fazer o `buscar`
   * mudar de referência a cada render.
   */
  const paramsRef = useRef<MotoristaParams>(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const buscar = useCallback(
    async (novosParams?: MotoristaParams) => {

      const parametros = novosParams ?? paramsRef.current;

      const response = await execute(() =>
        getMotoristas(parametros),
      );

      if (!response) return;

      setMotoristas(response.content);
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