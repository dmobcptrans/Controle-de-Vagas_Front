'use client';

import { useCallback, useEffect, useState } from 'react';

import { useApi } from '@/services/hooks/useApi';

import { DenunciaParams, DenunciaResponse } from '../types/denuncia2';

import {
  getDenunciasByUsuario,
  getDenuncias,
} from '@/features/denuncias/services/denunciaApi';

interface UseDenunciasOptions {
  params?: DenunciaParams;
  buscarAutomaticamente?: boolean;
}

interface UseDenunciasReturn {
  denuncias: DenunciaResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscar: (params?: DenunciaParams) => Promise<void>;
  buscarPorUsuario: (id: string, params?: DenunciaParams) => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useDenuncias({
  params = {},
  buscarAutomaticamente = true,
}: UseDenunciasOptions): UseDenunciasReturn {
  const [denuncias, setDenuncias] = useState<DenunciaResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  const buscar = useCallback(
    async (novosParams: DenunciaParams = params) => {
      const response = await execute(() => getDenuncias(novosParams));

      if (response) {
        setDenuncias(response.content);
        setPagina(response.pagina);
        setTotalPaginas(response.totalPaginas);
        setTotalElementos(response.totalElementos);
      }
    },
    [params, execute],
  );

  const buscarPorUsuario = useCallback(
    async (id: string, novosParams: DenunciaParams = params) => {
      const response = await execute(() =>
        getDenunciasByUsuario(id, novosParams),
      );
      if (response) {
        setDenuncias(response.content);
        setPagina(response.pagina);
        setTotalPaginas(response.totalPaginas);
        setTotalElementos(response.totalElementos);
      }
    },
    [params, execute],
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
    denuncias,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    buscar,
    buscarPorUsuario,
    recarregar,
  };
}
