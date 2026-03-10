import { useState, useEffect } from 'react';
import { getVeiculo } from '@/lib/api/veiculoApi';
import { getVagaById } from '@/lib/api/vagaApi';
import { Veiculo } from '@/lib/types/veiculo';
import { Vaga } from '@/lib/types/vaga';

export function useReservaData(veiculoId: string, vagaId: string) {
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [veiculoRes, vagaRes] = await Promise.all([
          veiculoId ? getVeiculo(veiculoId) : Promise.resolve(null),
          vagaId ? getVagaById(vagaId) : Promise.resolve(null),
        ]);

        if (mounted) {
          if (veiculoRes && !veiculoRes.error) setVeiculo(veiculoRes.veiculo);
          if (vagaRes) setVaga(vagaRes);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError('Falha ao carregar detalhes da reserva.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [veiculoId, vagaId]);

  return { veiculo, vaga, loading, error };
}
