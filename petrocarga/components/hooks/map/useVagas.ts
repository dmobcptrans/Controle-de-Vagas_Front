'use client';

import { useEffect, useState } from 'react';
import { Vaga } from '@/lib/types/vaga';
import * as vagaApi from '@/lib/api/vagaApi';

export function useVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVagas = async () => {
      setLoading(true);
      try {
        const data: Vaga[] = await vagaApi.getVagas();
        setVagas(data);
      } catch (err) {
        console.error('Erro ao carregar vagas:', err);
        const message =
          (err as { message?: string }).message || 'Erro desconhecido';
        setError(message);
        setVagas([]); // garante array vazio
      } finally {
        setLoading(false);
      }
    };

    fetchVagas();
  }, []);

  return { vagas, loading, error };
}
