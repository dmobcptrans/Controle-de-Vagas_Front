import { useEffect, useState, useMemo } from 'react';
import { getVagas } from '@/lib/api/vagaApi';
import { Vaga } from '@/lib/types/vaga';

export function useVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);
  const [errorVagas, setErrorVagas] = useState<Error | null>(null);

  /** Carrega vagas */
  const loadVagas = async () => {
    setLoadingVagas(true);
    setErrorVagas(null);
    try {
      const data = await getVagas();
      setVagas(data ?? []);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      setErrorVagas(
        error instanceof Error ? error : new Error('Erro ao carregar vagas.')
      );
    } finally {
      setLoadingVagas(false);
    }
  };

  useEffect(() => {
    loadVagas();
  }, []);

  /** Agrupar vagas por logradouro para uso no modal de criação (salvar) */
  const vagasPorLogradouro = useMemo(() => {
    return vagas.reduce((acc, vaga) => {
      const log = vaga?.endereco?.logradouro ?? 'Sem Logradouro';
      (acc[log] ??= []).push(vaga);
      return acc;
    }, {} as Record<string, Vaga[]>);
  }, [vagas]);

  return {
    vagas,
    vagasPorLogradouro,
    loadingVagas,
    errorVagas,
    refetchVagas: loadVagas,
  };
}
