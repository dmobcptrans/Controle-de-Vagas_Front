import { useEffect, useState } from 'react';
import { Disponibilidade } from '@/lib/types/disponibilidadeVagas';
import { fetchDisponibilidades } from '../services/disponibilidadeService';

/* -------------------------------------------------------
  HOOK PRINCIPAL (Foco em Gerenciamento de Estado)
-------------------------------------------------------- */
export function useDisponibilidade() {
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Função interna para carregar os dados
  const loadDisponibilidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDisponibilidades();
      setDisponibilidades(data);
    } catch (err) {
      console.error('Erro ao carregar disponibilidades:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisponibilidades();
  }, []);

  return {
    disponibilidades,
    setDisponibilidades,
    loading,
    error,
    refetchDisponibilidades: loadDisponibilidades,
  };
}
