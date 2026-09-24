'use client';

import { use } from 'react';

import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';

import VeiculoCard from '@/features/veiculos/components/(motorista)/veiculo-item';

import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ motoristaId: string }>;
}

export default function GestorVeiculosPage({ params }: PageProps) {
  const { motoristaId } = use(params);

  const {
    veiculos,
    loading,
    error,
    buscar,
  } = useVeiculos({
    usuarioId: motoristaId,
    params: {
      pagina: 0,
      tamanhoPagina: 100,
      ativo: true,
    },
    buscarAutomaticamente: true,
  });

  const recarregar = async () => {
    await buscar({
      pagina: 0,
      tamanhoPagina: 100,
      ativo: true,
    });
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />

        <span className="text-gray-600">
          Carregando os veículos...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Erro ao carregar veículos
        </h3>

        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
          {error}
        </p>

        <Button onClick={recarregar} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl mb-4">
        <Link
          href="/gestor/motoristas"
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para todos os motoristas
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">
        Veículos deste motorista
      </h1>

      {veiculos.length === 0 ? (
        <p className="text-gray-500 text-center">
          Nenhum veículo encontrado.
        </p>
      ) : (
        <div className="grid gap-4 w-full max-w-2xl">
          {veiculos.map((veiculo) => (
            <VeiculoCard
              key={veiculo.id}
              veiculo={veiculo}
            />
          ))}
        </div>
      )}
    </div>
  );
}