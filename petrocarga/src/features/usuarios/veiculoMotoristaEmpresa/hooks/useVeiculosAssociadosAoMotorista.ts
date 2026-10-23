'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ListarVeiculosAssociadosAoMotorista } from '../services/VeiculoEmpresaMotoristaApi';
import { VeiculosAssociadosAoMotoristaParams } from '../types/veiculoMotoristaEmpresa';
import { VeiculoResponse } from '@/features/veiculos/types/veiculo';
import { useApi } from '@/services/hooks/useApi';

interface UseVeiculoOptions {
  empresaId?: string;
  motoristaId?: string;
  params?: VeiculosAssociadosAoMotoristaParams;
  buscarAutomaticamente?: boolean;
}

interface UseVeiculoReturn {
  veiculos: VeiculoResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  jaBuscou: boolean;
  buscar: (params?: VeiculosAssociadosAoMotoristaParams) => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: VeiculosAssociadosAoMotoristaParams = {};

export function useVeiculosAssociadosAoMotorista({
  empresaId,
  motoristaId,
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseVeiculoOptions = {}): UseVeiculoReturn {
  const [veiculos, setVeiculos] = useState<VeiculoResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [jaBuscou, setJaBuscou] = useState(false);

  const { loading, error, execute } = useApi();

  const paramsRef = useRef<VeiculosAssociadosAoMotoristaParams>(params);

  // Mantém os filtros atuais disponíveis para buscar e recarregar.
  const filtrosRef = useRef({ empresaId, motoristaId });

  useEffect(() => {
    paramsRef.current = params;
    filtrosRef.current = { empresaId, motoristaId };
  }, [params, empresaId, motoristaId]);

  const buscar = useCallback(
    async (novosParams?: VeiculosAssociadosAoMotoristaParams) => {
      const parametros = novosParams ?? paramsRef.current;
      paramsRef.current = parametros;

      const filtros = filtrosRef.current;

      const response = await execute(() =>
        ListarVeiculosAssociadosAoMotorista({
          ...parametros,
          empresaId: filtros.empresaId,
          motoristaId: filtros.motoristaId,
        }),
      );

      setJaBuscou(true);

      if (!response) return;

      setVeiculos(response.content);
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
    if (!motoristaId) return;

    void buscar(params);
  }, [buscarAutomaticamente, buscar, params, empresaId, motoristaId]);

  return {
    veiculos,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    jaBuscou,
    buscar,
    recarregar,
  };
}
