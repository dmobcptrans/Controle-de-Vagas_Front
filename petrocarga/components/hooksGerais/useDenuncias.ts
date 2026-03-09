'use client';

import { useState, useEffect, useCallback } from 'react';
import { Denuncia } from '@/lib/types/denuncias';
import { getDenuncias } from '@/lib/api/denunciaApi';
import toast from 'react-hot-toast';

export function useDenuncias() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDenuncias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDenuncias();
      setDenuncias(result ?? []);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao carregar denúncias. Por favor, tente novamente.';
      setError(msg);
      toast.error(msg);
      setDenuncias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDenuncias();
  }, [fetchDenuncias]);

  return { denuncias, loading, error, refetch: fetchDenuncias };
}
