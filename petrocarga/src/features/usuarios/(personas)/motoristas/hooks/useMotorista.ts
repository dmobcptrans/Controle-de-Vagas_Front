
'use client';

import { useCallback, useEffect, useState } from 'react';

import { getMotoristaPorId } from '../services/motoristaApi';

import { MotoristaResponse1 } from '../types/motorista';

import { useApi } from '@/services/hooks/useApi';

interface UseMotoristaOptions {
  motoristaId: string;
  buscarAutomaticamente?: boolean;
}

interface UseMotoristaReturn {
  motorista: MotoristaResponse1 | null;
  loading: boolean;
  error: string | null;
  buscar: () => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useMotorista({
  motoristaId,
  buscarAutomaticamente = true,
}: UseMotoristaOptions): UseMotoristaReturn {
  const [motorista, setMotorista] = useState<MotoristaResponse1 | null>(null);
  const { loading, error, execute } = useApi();

  const buscar = useCallback(async () => {
    const response = await execute(() => getMotoristaPorId(motoristaId));

    if (response) {
      setMotorista(response);
    }
  }, [motoristaId, execute]);

  const recarregar = useCallback(async () => {
    await buscar();
  }, [buscar]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscar();
    }
  }, [buscarAutomaticamente, buscar]);

  return {
    motorista,
    loading,
    error,
    buscar,
    recarregar,
  };
}
