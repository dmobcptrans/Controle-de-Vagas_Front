'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';
import { useVeiculosAssociadosAoMotorista } from '@/features/usuarios/veiculoMotoristaEmpresa/hooks/useVeiculosAssociadosAoMotorista';
import {
  AlertCircle,
  CarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

import VeiculoCard from '@/features/veiculos/components/(motorista)/veiculo-item';
import { Button } from '@/components/ui/button';
import CadastroVeiculoModal from '@/features/veiculos/components/modal/Cadastroveiculomodal';
import { CTA } from '@/components/ui/CTA/CTA';
import { Header } from '@/components/ui/Header/Header';

const TAMANHO_PAGINA = 10;

// Quantidade solicitada a cada hook para montar a lista unificada.
// Se a API tiver limite máximo, será necessário buscar as páginas restantes.
const TAMANHO_CONSULTA = 1000;

export default function VeiculosPage() {
  const { user } = useAuth();

  const [modalAberto, setModalAberto] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const paramsConsulta = useMemo(
    () => ({
      pagina: 0,
      tamanhoPagina: TAMANHO_CONSULTA,
      ativo: true,
      ordem: 'ASC' as const,
    }),
    [],
  );

  const {
    buscar: buscarVeiculos,
    veiculos: vP,
    error,
    loading,
  } = useVeiculos({
    usuarioId: user?.id,
    params: paramsConsulta,
    buscarAutomaticamente: true,
  });

  const {
    veiculos: vA,
    buscar: buscarAssociados,
    error: errorAssociados,
    loading: loadingAssociados,
  } = useVeiculosAssociadosAoMotorista({
    empresaId: user?.dadosExtras?.empresaId,
    motoristaId: user?.id,
    params: paramsConsulta,
    buscarAutomaticamente: true,
  });
  // Une os veículos cadastrados e os associados, eliminando duplicados.
  const veiculos = useMemo(() => {
    const pessoais = (vP ?? []).map((veiculo) => ({
      ...veiculo,
      isEmpresa: false,
    }));

    const empresariais = (vA ?? []).map((veiculo) => ({
      ...veiculo,
      isEmpresa: true,
    }));

    return Array.from(
      new Map(
        [...pessoais, ...empresariais].map((veiculo) => [veiculo.id, veiculo]),
      ).values(),
    );
  }, [vP, vA]);

  const carregando = loading || loadingAssociados;
  const erro = error || errorAssociados;

  // Paginação local da lista unificada.
  const totalElementos = veiculos.length;
  const totalPaginas = Math.ceil(totalElementos / TAMANHO_PAGINA);

  const veiculosPaginados = useMemo(() => {
    const inicio = paginaAtual * TAMANHO_PAGINA;

    return veiculos.slice(inicio, inicio + TAMANHO_PAGINA);
  }, [veiculos, paginaAtual]);

  const irParaPagina = (novaPagina: number) => {
    if (novaPagina < 0 || novaPagina >= totalPaginas) {
      return;
    }

    setPaginaAtual(novaPagina);
  };

  const recarregar = async () => {
    setPaginaAtual(0);

    await Promise.all([
      buscarVeiculos({
        pagina: 0,
        tamanhoPagina: TAMANHO_CONSULTA,
        ativo: true,
        ordem: 'ASC',
      }),
      buscarAssociados({
        empresaId: user?.dadosExtras?.empresaId,
        motoristaId: user?.id,
        pagina: 0,
        tamanhoPagina: TAMANHO_CONSULTA,
        ativo: true,
        ordem: 'ASC',
      }),
    ]);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* HEADER */}
      <Header
        title={`Seus Veículos, ${user?.nome?.split(' ')[0] || 'motorista'}`}
        subtitle="Aqui estão seus veículos cadastrados e associados"
      />

      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-8">
        <div className="-mt-4 mb-5">
          <CTA
            onClick={() => setModalAberto(true)}
            title="Reservar uma vaga"
            description="Encontre e faça uma reserva rápida"
            icon={<CarIcon className="h-5 w-5 text-white" />}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          {/* CARREGAMENTO */}
          {carregando ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Carregando seus veículos...</span>
            </div>
          ) : erro ? (
            /* ERRO */
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-700">
                Erro ao carregar veículos
              </h3>

              <p className="mb-6 text-sm text-gray-500">{erro}</p>

              <Button onClick={recarregar} variant="outline">
                Tentar novamente
              </Button>
            </div>
          ) : veiculos.length === 0 ? (
            /* LISTA VAZIA */
            <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
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
              {/* VEÍCULOS */}
              <div className="mt-4 grid w-full gap-4">
                {veiculosPaginados.map((veiculo) => (
                  <VeiculoCard
                    key={veiculo.id}
                    veiculo={veiculo}
                    isEmpresa={veiculo.isEmpresa}
                  />
                ))}
              </div>

              {/* PAGINAÇÃO */}
              {totalPaginas > 1 && (
                <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <Button
                    onClick={() => irParaPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 0 || carregando}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="text-center text-xs text-gray-500">
                    <p>
                      Página{' '}
                      <span className="font-semibold">{paginaAtual + 1}</span>{' '}
                      de <span className="font-semibold">{totalPaginas}</span>
                    </p>

                    <p className="text-gray-400">
                      {totalElementos} veículo
                      {totalElementos !== 1 ? 's' : ''} no total
                    </p>
                  </div>

                  <Button
                    onClick={() => irParaPagina(paginaAtual + 1)}
                    disabled={paginaAtual >= totalPaginas - 1 || carregando}
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

          {/* TUTORIAL */}
          <Link
            href="/tutorial#meusveiculos"
            className="mt-6 flex items-center gap-4 rounded-xl border border-gray-100 border-l-4 border-l-[#1351B4] bg-white p-4 transition-colors hover:bg-blue-50/30"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Info className="h-5 w-5 text-[#1351B4]" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#071D41]">
                Gerenciando seus veículos?
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                Aprenda a cadastrar e gerenciar seus veículos
              </p>
            </div>
          </Link>
        </div>
      </main>

      {/* MODAL */}
      <CadastroVeiculoModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        onSuccess={recarregar}
      />
    </div>
  );
}
