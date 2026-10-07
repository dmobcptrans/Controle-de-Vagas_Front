'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ListarMotoristasVinculadosAoVeiculo } from '../services/VeiculoEmpresaMotoristaApi';
import { MotoristasVinculadosAoVeiculo } from '../types/veiculoMotoristaEmpresa';
import { useApi } from '@/services/hooks/useApi';
import { MotoristaEmpresaResponse } from '../../(personas)/empresas/types/empresa2';

interface UseMotoristasOptions {
  params: MotoristasVinculadosAoVeiculo;
  buscarAutomaticamente?: boolean;
}

interface UseMotoristasReturn {
  motoristas: MotoristaEmpresaResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscar: (params?: MotoristasVinculadosAoVeiculo) => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: MotoristasVinculadosAoVeiculo = {};

export function useMotoristasVinculadosAoVeiculo({
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseMotoristasOptions): UseMotoristasReturn {
  const [motoristas, setMotoristas] = useState<MotoristaEmpresaResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  /**
   * Mantém os parâmetros atuais sem fazer o `buscar`
   * mudar de referência a cada render.
   */
  const paramsRef = useRef<MotoristasVinculadosAoVeiculo>(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const buscar = useCallback(
    async (novosParams?: MotoristasVinculadosAoVeiculo) => {
      const parametros = novosParams ?? paramsRef.current;

      const response = await execute(() =>
        ListarMotoristasVinculadosAoVeiculo(parametros),
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
