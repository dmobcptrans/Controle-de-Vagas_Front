'use client';

import { useCallback, useEffect, useState } from 'react';

import { getVeiculosPorUsuario } from '../services/veiculoApi';

import { VeiculoParams, VeiculoResponse } from '../types/veiculo2';

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

export function useVeiculos({
  usuarioId,
  params = {},
  buscarAutomaticamente = true,
}: UseVeiculoOptions): UseVeiculoReturn {
  const [veiculos, setVeiculos] = useState<VeiculoResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  const buscar = useCallback(
    async (novosParams: VeiculoParams = params) => {
      if (!usuarioId) return;

      const response = await execute(() =>
        getVeiculosPorUsuario(usuarioId, novosParams),
      );

      if (response) {
        setVeiculos(response.content);
        setPagina(response.pagina);
        setTotalPaginas(response.totalPaginas);
        setTotalElementos(response.totalElementos);
      }
    },
    [usuarioId, params, execute],
  );

  const recarregar = useCallback(async () => {
    await buscar(params);
  }, [buscar, params]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscar();
    }
  }, [buscarAutomaticamente, buscar]);

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
