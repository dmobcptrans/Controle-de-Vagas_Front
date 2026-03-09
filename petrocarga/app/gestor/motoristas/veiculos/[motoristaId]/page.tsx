'use client';

import { use, useEffect, useState } from 'react';
import { getVeiculosUsuario } from '@/lib/api/veiculoApi';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';
import VeiculoCard from '@/components/gestor/cards/veiculo-item';
import Link from 'next/link';
interface PageProps {
  params: Promise<{ motoristaId: string }>;
}

export default function GestorVeiculosPage({ params }: PageProps) {
  const { motoristaId } = use(params);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!motoristaId) return;

    const fetchVeiculos = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getVeiculosUsuario(motoristaId);

        if (result.error) {
          setError(result.message);
        } else {
          setVeiculos(result.veiculos);
        }
      } catch {
        setError('Erro ao buscar os veículos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchVeiculos();
  }, [motoristaId]);

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="text-gray-600">Carregando os veículos...</span>
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
        Veículos deste motorista.
      </h1>
      <div className="mb-6">
        <Link
          href="/gestor/motoristas"
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para todos os motoristas
        </Link>
      </div>

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
