'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getVeiculosUsuario } from '@/lib/api/veiculoApi';
import { Loader2 } from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';
import VeiculoCard from '@/components/motorista/cards/veiculo-item';

export default function VeiculosPage() {
  const { user } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchVeiculos = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getVeiculosUsuario(user.id);
        setVeiculos(result.veiculos);
      } catch (err) {
        setError('Erro ao buscar seus veículos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchVeiculos();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando seus veículos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center text-red-600 min-h-[60vh] text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center w-full min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Olá, {user?.nome || 'Motorista'}!
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Aqui estão seus veículos cadastrados.
      </p>

      {veiculos.length === 0 ? (
        <p className="text-gray-500 text-center">Nenhum veículo encontrado.</p>
      ) : (
        <div className="grid gap-4 w-full max-w-2xl">
          {veiculos.map((veiculo) => (
            <VeiculoCard key={veiculo.id} veiculo={veiculo} />
          ))}
        </div>
      )}
    </div>
  );
}
