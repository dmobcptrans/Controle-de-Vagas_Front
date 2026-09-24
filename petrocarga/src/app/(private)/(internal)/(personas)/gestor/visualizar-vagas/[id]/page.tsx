'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import VagaDetalhes from '@/features/vaga/vagas/components/cards/vaga-card';

import { useVaga } from '@/features/vaga/vagas/hooks/useVaga';

export default function VagaPosting() {
  const params = useParams();

  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const { vaga, loading, error, recarregar } = useVaga({
    vagaId: id,
    buscarAutomaticamente: true,
  });

  // --------------------------------------------------------------------------
  // LOADING
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />

        <span className="text-gray-600">Carregando vaga...</span>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ERRO
  // --------------------------------------------------------------------------

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Erro ao carregar vaga
        </h3>

        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">{error}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={recarregar} variant="outline">
            Tentar novamente
          </Button>

          <Link href="/gestor/visualizar-vagas">
            <Button variant="ghost">Voltar para todas as vagas</Button>
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VAGA NÃO ENCONTRADA
  // --------------------------------------------------------------------------

  if (!vaga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Vaga não encontrada
        </h3>

        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
          A vaga solicitada não foi encontrada.
        </p>

        <Link href="/gestor/visualizar-vagas">
          <Button variant="ghost">Voltar para todas as vagas</Button>
        </Link>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SUCESSO
  // --------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link
          href="/gestor/visualizar-vagas"
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Todas as Vagas
        </Link>
      </div>

      <VagaDetalhes vaga={vaga} />
    </div>
  );
}
