'use client';

import { useCallback, useEffect, useState } from 'react';

import { getEmpresaPorId } from '../services/empresaApi2';

import { EmpresaResponse } from '../types/empresa2';

import { useApi } from '@/services/hooks/useApi';

interface UseEmpresaOptions {
  empresaId: string;
  buscarAutomaticamente: boolean;
}

interface UseEmpresaReturn {
  empresa: EmpresaResponse | null;
  loading: boolean;
  error: string | null;
  buscar: () => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useEmpresa({
  empresaId,
  buscarAutomaticamente = true,
}: UseEmpresaOptions): UseEmpresaReturn {
  const [empresa, setEmpresa] = useState<EmpresaResponse | null>(null);
  const { loading, error, execute } = useApi();

  const buscar = useCallback(async () => {
    const response = await execute(() => getEmpresaPorId(empresaId));

    if (response) {
      setEmpresa(response);
    }
  }, [empresaId, execute]);

  const recarregar = useCallback(async () => {
    await buscar();
  }, [buscar]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscar();
    }
  }, [buscarAutomaticamente, buscar]);

  return {
    empresa,
    loading,
    error,
    buscar,
    recarregar,
  };
}
