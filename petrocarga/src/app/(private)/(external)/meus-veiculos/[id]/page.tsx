'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';

import VeiculoDetalhes from '@/features/veiculos/components/(motorista)/veiculo-card';

import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CTA } from '@/components/ui/CTA/CTA';
import { Header } from '@/components/ui/Header/Header';

const TAMANHO_PAGINA = 100;

export default function EditarVeiculoPage() {
  const { user } = useAuth();
  const params = useParams();

  const [atualizando, setAtualizando] = useState(false);

  const veiculoId = params.id as string;

  const {
    veiculos,
    loading,
    error,
    buscar,
  } = useVeiculos({
    usuarioId: user?.id,
    params: {
      pagina: 0,
      tamanhoPagina: TAMANHO_PAGINA,
      ativo: true,
    },
    buscarAutomaticamente: true,
  });

  const veiculo = veiculos.find((v) => v.id === veiculoId);

  const recarregar = async () => {
    setAtualizando(true);

    try {
      await buscar({
        pagina: 0,
        tamanhoPagina: TAMANHO_PAGINA,
        ativo: true,
      });
    } finally {
      setAtualizando(false);
    }
  };

  const handleVeiculoAtualizado = () => {
    toast.success('Veículo atualizado com sucesso!');
    recarregar();
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="text-gray-600">
          Carregando veículo...
        </span>
      </div>
    );
  }

  if (error || !veiculo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {error || 'Veículo não encontrado'}
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button onClick={recarregar} variant="outline">
            Tentar novamente
          </Button>

          <Link href="/meus-veiculos">
            <Button variant="ghost">
              Voltar para todos os veículos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header
        title="Veículo Detalhes"
        subtitle="Aqui Estão Os Detalhes Do Seu Veículo"
      />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <div className="-mt-4 mb-5">
          <CTA
            href="/meus-veiculos"
            title="Voltar para meus veículos"
            icon={<ArrowLeft className="h-5 w-5 text-white" />}
          />
        </div>

        <div className="w-full max-w-4xl lg:max-w-6xl">
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Formulário */}
            <div className="lg:col-span-2">
              <VeiculoDetalhes
                veiculo={veiculo}
                onVeiculoAtualizado={handleVeiculoAtualizado}
              />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informações Úteis
                </h3>

                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Placa deve estar sempre atualizada</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Documentos devem estar em dia</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Verifique regularmente os dados</span>
                  </li>
                </ul>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Status do veículo
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Placa:
                      </span>

                      <span className="text-sm font-mono font-medium text-gray-800">
                        {veiculo.placa}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Tipo:
                      </span>

                      <span className="text-sm font-medium text-gray-800">
                        {veiculo.tipo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Atualizar no mobile */}
          <div className="lg:hidden mt-6">
            <button
              onClick={recarregar}
              disabled={atualizando}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  atualizando ? 'animate-spin' : ''
                }`}
              />

              <span>
                {atualizando
                  ? 'Atualizando...'
                  : 'Atualizar dados do veículo'}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}