'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

import {
  DenunciaPaginadaResponse,
  DenunciaParams,
} from '../types/denuncia2';

import { getDenuncias } from '@/features/denuncias/services/denunciaApi';

export function useDenuncias() {
  const [paginatedData, setPaginatedData] =
    useState<DenunciaPaginadaResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState<DenunciaParams>({
    pagina: 0,
    tamanhoPagina: 10,
    ordem: 'DESC',
  });

  const fetchDenuncias = useCallback(
    async (newParams?: DenunciaParams) => {
      setLoading(true);
      setError(null);

      try {
        const currentParams = newParams ?? params;

        const result = await getDenuncias(currentParams);

        setPaginatedData(result);

        setParams(currentParams);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar denúncias. Por favor, tente novamente.';

        setError(msg);
        toast.error(msg);
        setPaginatedData(null);
      } finally {
        setLoading(false);
      }
    },
    [params],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (
        newPage !== params.pagina &&
        newPage >= 0 &&
        newPage < (paginatedData?.totalPaginas ?? 0)
      ) {
        fetchDenuncias({
          ...params,
          pagina: newPage,
        });

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    },
    [params, paginatedData?.totalPaginas, fetchDenuncias],
  );

  const handleFilterChange = useCallback(
    (newParams: DenunciaParams) => {
      fetchDenuncias({
        ...params,
        ...newParams,
        pagina: 0,
      });
    },
    [params, fetchDenuncias],
  );

  useEffect(() => {
    fetchDenuncias();
  }, []);

  return {
    denuncias: paginatedData?.content ?? [],

    loading,
    error,

    currentPage: paginatedData?.pagina ?? 0,

    totalPaginas: paginatedData?.totalPaginas ?? 0,
    totalElementos: paginatedData?.totalElementos ?? 0,
    tamanhoPagina: paginatedData?.tamanhoPagina ?? 10,

    params,

    refetch: () => fetchDenuncias(),

    handlePageChange,
    handleFilterChange,
  };
}

