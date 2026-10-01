'use client';

import { useApi } from '@/services/hooks/useApi';
import { gestorResponse } from '../types/gestor2';
import { useCallback, useEffect, useState } from 'react';
import { getGestorPorId } from '../services/gestorApi2';

interface UseGestorOptions {
  gestorId: string;
  buscarAutomaticamente?: boolean;
}

interface UseGestorReturn {
  gestor: gestorResponse | null;
  loading: boolean;
  error: string | null;
  buscar: () => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useGestor({
  gestorId,
  buscarAutomaticamente = true,
}: UseGestorOptions): UseGestorReturn {
  const [gestor, setGestor] = useState<gestorResponse | null>(null);
  const { loading, error, execute } = useApi();

  const buscar = useCallback(async () => {
    const response = await execute(() => getGestorPorId(gestorId));

    if (response) {
      setGestor(response);
    }
  }, [gestorId, execute]);

  const recarregar = useCallback(async () => {
    await buscar();
  }, [buscar]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscar();
    }
  }, [buscarAutomaticamente, buscar]);

  return {
    gestor,
    loading,
    error,
    buscar,
    recarregar,
  };
}
