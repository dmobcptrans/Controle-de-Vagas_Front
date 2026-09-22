import { useState, useEffect } from 'react';

import { getVeiculoPorId } from '@/features/veiculos/services/veiculoApi';
import { getVagaById } from '@/features/vaga/vagas/service/vagaApi';

import { VeiculoResponse } from '@/features/veiculos/types/veiculo';
import { VagaResponse } from '@/features/vaga/vagas/types/vaga';

/**
 * @hook useReservaData
 * @version 1.0.0
 *
 * @description
 * Hook customizado para carregar os dados relacionados a uma reserva.
 * Busca veículo e vaga em paralelo diretamente através das APIs.
 */
export function useReservaData(
  veiculoId: string,
  vagaId: string,
) {
  const [veiculo, setVeiculo] = useState<VeiculoResponse | null>(null);
  const [vaga, setVaga] = useState<VagaResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Busca veículo e vaga em paralelo diretamente pela API
        const [veiculoRes, vagaRes] = await Promise.all([
          veiculoId
            ? getVeiculoPorId(veiculoId)
            : Promise.resolve(null),

          vagaId
            ? getVagaById(vagaId)
            : Promise.resolve(null),
        ]);

        if (!mounted) return;
        
        if (veiculoRes) {
          setVeiculo(veiculoRes);
        }

        if (vagaRes) {
          setVaga(vagaRes);
        }
      } catch (err: unknown) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Falha ao carregar detalhes da reserva.',
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [veiculoId, vagaId]);

  return {
    veiculo,
    vaga,
    loading,
    error,
  };
}