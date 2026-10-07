'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ListarVeiculosAssociadosAoMotorista } from '../services/VeiculoEmpresaMotoristaApi';
import { VeiculosAssociadosAoMotoristaParams } from '../types/veiculoMotoristaEmpresa';
import { VeiculoResponse } from '@/features/veiculos/types/veiculo';
import { useApi } from '@/services/hooks/useApi';

interface UseVeiculoOptions {
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
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseVeiculoOptions = {}): UseVeiculoReturn {
  const [veiculos, setVeiculos] = useState<VeiculoResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [jaBuscou, setJaBuscou] = useState(false);

  const { loading, error, execute } = useApi();

  // Guarda os params mais recentes sem mudar a referência do `buscar`
  const paramsRef = useRef<VeiculosAssociadosAoMotoristaParams>(params);

  const buscar = useCallback(
    async (novosParams?: VeiculosAssociadosAoMotoristaParams) => {
      const parametros = novosParams ?? paramsRef.current;
      paramsRef.current = parametros; // `recarregar` mantém a página atual

      const response = await execute(() =>
        ListarVeiculosAssociadosAoMotorista(parametros),
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

  // Busca automática: refaz quando `params` muda (ex.: trocou de motorista)
  useEffect(() => {
    if (!buscarAutomaticamente) return;
    buscar(params);
  }, [buscarAutomaticamente, buscar, params]);

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