'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import {
  getVeiculosUsuario,
  FiltrosVeiculosUsuario,
} from '@/features/veiculos/services/veiculoApi';
import {
  AlertCircle,
  CarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Veiculo } from '@/features/veiculos/types/veiculo';
import VeiculoCard from '@/features/usuarios/(personas)/motoristas/components/cards/veiculo-item';
import { Button } from '@/components/ui/button';
import CadastroVeiculoModal from '@/features/veiculos/components/modal/Cadastroveiculomodal';
import { CTA } from '@/components/ui/CTA/CTA';
import { Header } from '@/components/ui/Header/Header';

const TAMANHO_PAGINA = 10;

export default function VeiculosPage() {
  const { user } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de paginação
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  // Controla a abertura do modal a partir daqui, já que o botão
  // que o dispara ("Adicionar novo veículo") não é mais um <Link>.
  const [modalAberto, setModalAberto] = useState(false);

  const fetchVeiculos = useCallback(
    async (paginaAlvo: number = pagina) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const filtros: FiltrosVeiculosUsuario = {
          pagina: paginaAlvo,
          tamanhoPagina: TAMANHO_PAGINA,
          ativo: true,
          ordem: 'ASC',
        };

        const result = await getVeiculosUsuario(user.id, filtros);

        setVeiculos(result.content);
        setTotalPaginas(result.totalPaginas);
        setTotalElementos(result.totalElementos);
        setPagina(result.pagina);
      } catch {
        setError('Erro ao buscar seus veículos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    },
    [user?.id, pagina],
  );

  useEffect(() => {
    fetchVeiculos(0);
  }, [user?.id]);

  const irParaPagina = (novaPagina: number) => {
    if (novaPagina < 0 || novaPagina >= totalPaginas) return;
    fetchVeiculos(novaPagina);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}
      <Header
        title={`Seus Veículos, ${user?.nome?.split(' ')[0] || 'motorista'}`}
        subtitle="Aqui Estão Seus Veículos Cadastrados"
      />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <div className="-mt-4 mb-5">
          <CTA
            onClick={() => setModalAberto(true)}
            title="Reservar uma vaga"
            description="Encontre e faça uma reserva rápida"
            icon={<CarIcon className="h-5 w-5 text-white" />}
          />
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
              <Button onClick={() => fetchVeiculos(pagina)} variant="outline">
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
            <>
              <div className="grid gap-4 w-full mt-4">
                {veiculos.map((veiculo) => (
                  <VeiculoCard key={veiculo.id} veiculo={veiculo} />
                ))}
              </div>

              {/* ==================== PAGINAÇÃO ==================== */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <Button
                    onClick={() => irParaPagina(pagina - 1)}
                    disabled={pagina === 0}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    <p>
                      Página <span className="font-semibold">{pagina + 1}</span>{' '}
                      de <span className="font-semibold">{totalPaginas}</span>
                    </p>
                    <p className="text-gray-400">
                      {totalElementos} veículo
                      {totalElementos !== 1 ? 's' : ''} no total
                    </p>
                  </div>

                  <Button
                    onClick={() => irParaPagina(pagina + 1)}
                    disabled={pagina >= totalPaginas - 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
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
        onSuccess={() => fetchVeiculos(pagina)}
      />
    </div>
  );
}
