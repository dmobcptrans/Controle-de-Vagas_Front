'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/hooksGerais/useAuth';
import { getVeiculosUsuario } from '@/lib/api/veiculoApi';
import { Loader2 } from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';
import VeiculoDetalhes from '@/components/motorista/cards/veiculo-card';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditarVeiculoPage() {
  const { user } = useAuth();
  const params = useParams() as { id: string };

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      toast.error('Usuário não autenticado. Faça login novamente.');
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    const userId = user.id;
    if (!userId) return;

    async function fetchVeiculo() {
      setLoading(true);
      setError('');

      try {
        const result = await getVeiculosUsuario(userId);

        if (result.error) {
          toast.error(result.message || 'Erro ao buscar veículo');
          setError(result.message);
          setVeiculo(null);
        } else {
          const v = result.veiculos.find((v) => v.id === params.id);
          if (!v) {
            toast.error('Veículo não encontrado.');
            setError('Veículo não encontrado.');
          } else {
            setVeiculo(v);
          }
        }
      } catch (err) {
        toast.error('Erro ao carregar os dados do veículo. Tente novamente.');
        setError('Erro ao buscar veículo.');
      } finally {
        setLoading(false);
      }
    }

    fetchVeiculo();
  }, [user?.id, params.id, refetchTrigger]);

  // Função para lidar com a atualização do veículo
  const handleVeiculoAtualizado = (veiculoAtualizado: Veiculo) => {
    setVeiculo(veiculoAtualizado);

    toast.success('Veículo atualizado com sucesso!');

    setTimeout(() => {
      setRefetchTrigger((prev) => prev + 1);
    }, 100);
  };

  // Função para recarregar os dados manualmente
  const handleRecarregarDados = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="text-gray-600">Carregando veículo...</span>
      </div>
    );
  }

  if (error || !veiculo) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-red-600 text-center gap-2">
        <p>{error || 'Veículo não encontrado'}</p>
        <div className="flex gap-2 mt-4">
          <Link
            href="/motorista/veiculos/meus-veiculos"
            className="text-blue-600 underline px-4 py-2 hover:bg-blue-50 rounded-md transition-colors"
          >
            Voltar para todos os veículos
          </Link>
          <button
            onClick={handleRecarregarDados}
            className="text-gray-600 underline px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl lg:max-w-6xl">
        {/* Header responsivo */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/motorista/veiculos/meus-veiculos"
            className="text-muted-foreground hover:text-foreground inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">
              Voltar para meus veículos
            </span>
          </Link>
        </div>

        {/* Container responsivo para o card */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card ocupa 2 colunas em telas grandes */}
          <div className="lg:col-span-2">
            <VeiculoDetalhes
              veiculo={veiculo}
              onVeiculoAtualizado={handleVeiculoAtualizado}
            />
          </div>

          {/* Espaço para informações adicionais em telas grandes */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informações Úteis
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Placa deve estar sempre atualizada</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Documentos devem estar em dia</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Verifique regularmente os dados</span>
                </li>
              </ul>

              {/* Status do veículo */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Status do veículo
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Última atualização:
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Placa:</span>
                    <span className="text-sm font-mono font-medium text-gray-800">
                      {veiculo.placa}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {veiculo.tipo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de recarregar para mobile */}
        <div className="lg:hidden mt-6">
          <button
            onClick={handleRecarregarDados}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <Loader2 className="w-4 h-4" />
            <span>Atualizar dados do veículo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
