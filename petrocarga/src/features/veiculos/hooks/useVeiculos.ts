'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getVeiculosPorUsuario } from '../services/veiculoApi';
import { VeiculoParams, VeiculoResponse } from '../types/veiculo';
import { useApi } from '@/services/hooks/useApi';

interface UseVeiculoOptions {
  usuarioId?: string;
  params?: VeiculoParams;
  buscarAutomaticamente?: boolean;
}

interface UseVeiculoReturn {
  veiculos: VeiculoResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscar: (params?: VeiculoParams) => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: VeiculoParams = {};

export function useVeiculos({
  usuarioId,
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseVeiculoOptions): UseVeiculoReturn {
  const [veiculos, setVeiculos] = useState<VeiculoResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  /**
   * Mantém os parâmetros atuais sem fazer o `buscar`
   * mudar de referência a cada render.
   */
  const paramsRef = useRef<VeiculoParams>(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const buscar = useCallback(
    async (novosParams?: VeiculoParams) => {
      if (!usuarioId) return;

      const parametros = novosParams ?? paramsRef.current;

      const response = await execute(() =>
        getVeiculosPorUsuario(usuarioId, parametros),
      );

      if (!response) return;

      setVeiculos(response.content);
      setPagina(response.pagina);
      setTotalPaginas(response.totalPaginas);
      setTotalElementos(response.totalElementos);
    },
    [usuarioId, execute],
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
    if (!buscarAutomaticamente || !usuarioId) return;

    buscar();
  }, [buscarAutomaticamente, usuarioId, buscar]);

  return {
    veiculos,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    buscar,
    recarregar,
  };
}