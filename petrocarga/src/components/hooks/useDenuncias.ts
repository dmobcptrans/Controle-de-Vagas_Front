'use client';

import { useState, useEffect, useCallback } from 'react';
import { DenunciaResponse } from '@/lib/types/denuncia';
import { getDenuncias } from '@/services/api/denunciaApi';
import toast from 'react-hot-toast';

export function useDenuncias() {
  const [paginatedData, setPaginatedData] =
    useState<DenunciaResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchDenuncias = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDenuncias(undefined, page);

      setPaginatedData(result);
      setCurrentPage(result.pagina);
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
  }, []);

  const handlePageChange = (newPage: number) => {
    if (
      newPage !== currentPage &&
      newPage >= 0 &&
      newPage < (paginatedData?.totalPaginas ?? 0)
    ) {
      fetchDenuncias(newPage);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    fetchDenuncias(0);
  }, [fetchDenuncias]);

  return {
    denuncias: paginatedData?.content ?? [],
    loading,
    error,

    currentPage,
    totalPaginas: paginatedData?.totalPaginas ?? 0,
    totalElementos: paginatedData?.totalElementos ?? 0,
    tamanhoPagina: paginatedData?.tamanhoPagina ?? 10,

    refetch: () => fetchDenuncias(currentPage),
    handlePageChange,
  };
}