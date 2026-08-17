'use client';

import { useCallback, useEffect, useState } from 'react';
import { Veiculo } from '@/lib/types/veiculo';
import VeiculoCard from '@/components/motorista/cards/veiculo-item';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getVeiculosVinculadosMotoristaEmpresa,
  desvincularVeiculoMotoristaEmpresa,
} from '@/services/api/empresaApi';
import { CTA } from '@/components/ui/CTA/CTA';
import { Info, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import VincularVeiculoMotoristaModal from '@/components/empresa/modal/VincularVeiculoMotoristaModal';
import ModalConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';

export default function MotoristaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Controle da desvinculação
  const [veiculoParaDesvincular, setVeiculoParaDesvincular] =
    useState<Veiculo | null>(null);
  const [desvinculando, setDesvinculando] = useState(false);

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const carregarVeiculos = useCallback(async () => {
    if (!user?.id || !id) return;

    try {
      const response = await getVeiculosVinculadosMotoristaEmpresa(user.id, id);

      setVeiculos(response.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    carregarVeiculos();
  }, [carregarVeiculos]);

  function abrirConfirmacaoDesvincular(veiculo: Veiculo) {
    setVeiculoParaDesvincular(veiculo);
  }

  function fecharConfirmacaoDesvincular() {
    if (desvinculando) return;
    setVeiculoParaDesvincular(null);
  }

  async function handleDesvincular() {
    if (!user?.id || !id || !veiculoParaDesvincular) return;

    setDesvinculando(true);
    try {
      const result = await desvincularVeiculoMotoristaEmpresa(
        user.id,
        veiculoParaDesvincular.id,
        id,
      );

      if (result?.error) {
        toast.error(result.message || 'Erro ao desvincular veículo');
        return;
      }

      toast.success(result?.message || 'Veículo desvinculado com sucesso!');
      setVeiculoParaDesvincular(null);
      carregarVeiculos();
    } catch (error) {
      console.error(error);
      toast.error('Erro inesperado ao desvincular veículo.');
    } finally {
      setDesvinculando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Veículos do motorista
          </h1>
          <p className="text-xs text-white/50 capitalize">{hoje}</p>
        </div>
      </header>

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <div className="-mt-4 mb-5">
          <CTA
            title="Vincular veículo"
            description="Associe um veículo da empresa a este motorista."
            icon={<Plus className="h-5 w-5 text-white" />}
            onClick={() => setModalAberto(true)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2 text-center">
              <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
              <span className="text-gray-600">Carregando seus veículos...</span>
            </div>
          ) : veiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 border-gray-200 border-dashed border-2 bg-white rounded-2xl">
              <p className="text-sm sm:text-base text-gray-500">Nenhum veículo encontrado.</p>
              <Button
                onClick={() => setModalAberto(true)}
                className="mt-4 cursor-pointer"
                variant="outline"
                size="sm"
              >
                Vincular o primeiro veículo
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 w-full mt-4">
              {veiculos.map((veiculo) => (
                <VeiculoCard
                  key={veiculo.id}
                  veiculo={veiculo}
                  type="empresa"
                  onDesvincular={() => abrirConfirmacaoDesvincular(veiculo)}
                />
              ))}
            </div>
          )}
        </div>

        <Link
          href="/tutorial#dashboard"
          className="mt-6 flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors"
        >
          <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-[#1351B4]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#071D41]">
              Novo por aqui?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Veja como usar o sistema em 3 passos simples
            </p>
          </div>
        </Link>
      </main>

      {user?.id && id && (
        <VincularVeiculoMotoristaModal
          empresaId={user.id}
          motoristaId={id}
          open={modalAberto}
          onOpenChange={setModalAberto}
          onSuccess={carregarVeiculos}
        />
      )}

      <ModalConfirmacaoExclusao
        isOpen={Boolean(veiculoParaDesvincular)}
        onClose={fecharConfirmacaoDesvincular}
        onConfirm={handleDesvincular}
        mensagem="Deseja mesmo desvincular este veículo? Essa ação não poderá ser desfeita."
      />
    </div>
  );
}
