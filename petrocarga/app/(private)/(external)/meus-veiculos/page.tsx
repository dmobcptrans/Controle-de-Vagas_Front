'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getVeiculosUsuario } from '@/lib/api/veiculoApi';
import { AlertCircle, CarIcon, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Veiculo } from '@/lib/types/veiculo';
import VeiculoCard from '@/components/motorista/cards/veiculo-item';
import { Button } from '@/components/ui/button';
import CadastroVeiculoModal from '@/components/modal/cadastroVeiculo/Cadastroveiculomodal';

export default function VeiculosPage() {
  const { user } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controla a abertura do modal a partir daqui, já que o botão
  // que o dispara ("Adicionar novo veículo") não é mais um <Link>.
  const [modalAberto, setModalAberto] = useState(false);

  const fetchVeiculos = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getVeiculosUsuario(user.id);
      setVeiculos(result.veiculos);
    } catch {
      setError('Erro ao buscar seus veículos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchVeiculos();
  }, [fetchVeiculos]);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Seus Veículos, {user?.nome?.split(' ')[0] || 'motorista'}
          </h1>
          <p className="text-xs text-white/50">
            Aqui Estão Seus Veículos Cadastrados
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">

        <div className="-mt-4 mb-5">
          <button
            onClick={() => setModalAberto(true)}
            className="w-full flex items-center justify-between cursor-pointer bg-[#071D41] hover:bg-[#0C3D8A] transition-colors rounded-2xl px-5 py-4 border-l-4 border-[#FFCD07]"
          >
            <div className="text-left">
              <p className="text-white font-semibold text-[15px] mb-0.5">
                Adicionar novo veículo
              </p>
              <p className="text-white/70 text-xs">Cadastre um veículo</p>
            </div>

            <div className="bg-white/15 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
              <CarIcon className="h-5 w-5 text-white" />
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2 text-center">
              <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
              <span className="text-gray-600">Carregando seus veículos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Erro ao carregar veículos
              </h3>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
              <Button onClick={fetchVeiculos} variant="outline">
                Tentar novamente
              </Button>
            </div>
          ) : veiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-10 gap-3">
              <p className="text-gray-500">Nenhum veículo encontrado.</p>
              <Button
                onClick={() => setModalAberto(true)}
                variant="outline"
                size="sm"
              >
                Cadastrar meu primeiro veículo
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 w-full mt-4">
              {veiculos.map((veiculo) => (
                <VeiculoCard key={veiculo.id} veiculo={veiculo} />
              ))}
            </div>
          )}

          {/* Tutorial */}
          <Link
            href="/tutorial#meusveiculos"
            className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors mt-6"
          >
            <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
              <Info className="h-5 w-5 text-[#1351B4]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#071D41]">
                Gerenciando seus veículos?
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Aprenda a cadastrar e gerenciar seus veículos
              </p>
            </div>
          </Link>
        </div>
      </main>
      <CadastroVeiculoModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        onSuccess={fetchVeiculos}
      />
    </div>
  );
}
