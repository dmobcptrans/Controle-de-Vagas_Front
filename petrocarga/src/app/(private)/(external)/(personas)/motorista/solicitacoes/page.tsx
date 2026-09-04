'use client';

import { useAuth } from '@/contexts/AuthContext';

import {
  listarConvitesMotoristaEmpresaPorMotorista,
  responderConviteMotoristaExistenteEmpresa,
} from '@/services/api/conviteMotoristaApi';
import { desvincularMotoristaEmpresa } from '@/services/api/empresaApi';
import type {
  ConviteMotoristaEmpresaListaItem,
  ConvitesMotoristaEmpresaResponse,
} from '@/lib/types/conviteMotoristaEmpresa';

import {
  AlertCircle,
  Building2,
  Info,
  Loader2,
  RefreshCw,
  WifiOff,
  X,
} from 'lucide-react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import ModalConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';
import { calcularDiasRestantes } from '@/components/motorista/solicitacoes-convite/utils/convite-motorista-empresa-datas';
import ConvitePendenteCTA from '@/components/motorista/solicitacoes-convite/ConvitePendenteCTA';
import SemVinculoCard from '@/components/motorista/solicitacoes-convite/SemVinculoCard';
import PaginationControls from '@/components/motorista/solicitacoes-convite/PaginationControls';
import ConviteCard from '@/components/motorista/solicitacoes-convite/ConviteCard';

export default function SolicitacoesConvite() {
  const { user, refreshUser } = useAuth();

  const [paginatedData, setPaginatedData] =
    useState<ConvitesMotoristaEmpresaResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isOffline, setIsOffline] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [modalDesvincularAberto, setModalDesvincularAberto] = useState(false);

  const convites = paginatedData?.content ?? [];

  const totalPaginas = paginatedData?.totalPaginas ?? 0;
  const totalElementos = paginatedData?.totalElementos ?? 0;
  const tamanhoPagina = paginatedData?.tamanhoPagina ?? 10;

  /**
   * Empresa já vinculada? Essa informação vem direto do `user`,
   * não da lista de convites.
   */
  const empresaVinculada = Boolean(user?.dadosExtras?.empresaId);

  /**
   * Primeiro convite pendente e ainda não expirado, usado no CTA do topo.
   */
  const convitePendenteDestaque = useMemo(() => {
    if (empresaVinculada) return null;

    return (
      convites.find((c) => {
        if (c.status !== 'PENDENTE') return false;

        const tempoRestante = calcularDiasRestantes(c.criadoEm);

        return !tempoRestante?.expirado;
      }) ?? null
    );
  }, [convites, empresaVinculada]);

  const convitePendenteValido = useMemo(() => {
    return convites.some((convite) => {
      if (convite.status !== 'PENDENTE') return false;

      const tempoRestante = calcularDiasRestantes(convite.criadoEm);

      return !tempoRestante?.expirado;
    });
  }, [convites]);

  /**
   * ------------------------------------------------------------------------
   * BUSCAR CONVITES
   * ------------------------------------------------------------------------
   */

  const fetchConvites = useCallback(
    async (page: number = 0) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await listarConvitesMotoristaEmpresaPorMotorista(
          user.id,
          {
            pagina: page,
            tamanhoPagina: 10,
            ordem: 'DESC',
          },
        );

        setPaginatedData(response);
        setCurrentPage(response.pagina);
      } catch {
        const message =
          'Erro ao carregar suas solicitações. Por favor, tente novamente mais tarde.';

        setError(message);
        setPaginatedData(null);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  /**
   * ------------------------------------------------------------------------
   * RESPONDER CONVITE
   * ------------------------------------------------------------------------
   */

  const handleResponder = async (
    convite: ConviteMotoristaEmpresaListaItem,
    status: 'ACEITO' | 'RECUSADO',
  ) => {
    if (!user) {
      toast.error('Não foi possível identificar o motorista.');
      return;
    }

    setRespondingId(convite.id);

    try {
      const response = await responderConviteMotoristaExistenteEmpresa(
        user.id,
        {
          conviteId: convite.id,
          status,
        },
      );

      if (response.error) {
        toast.error(response.message);
        return;
      }

      toast.success(
        status === 'ACEITO'
          ? 'Convite aceito com sucesso!'
          : 'Convite recusado com sucesso!',
      );

      await refreshUser();

      await fetchConvites(currentPage);
    } catch {
      toast.error('Erro ao responder o convite.');
    } finally {
      setRespondingId(null);
    }
  };

  /**
   * ------------------------------------------------------------------------
   * DESVINCULAR DA EMPRESA (usa os dados do `user`, não do convite)
   * ------------------------------------------------------------------------
   */

  const confirmarDesvinculamento = async () => {
    if (!user?.dadosExtras?.empresaId) {
      toast.error('Não foi possível identificar a empresa vinculada.');
      return;
    }

    const empresaId = user.dadosExtras.empresaId;

    setRespondingId(empresaId);

    try {
      await desvincularMotoristaEmpresa(empresaId, user.id);

      toast.success('Motorista desvinculado com sucesso.');

      setModalDesvincularAberto(false);

      // Atualiza o /me para remover o empresaId
      await refreshUser();

      // Atualiza a lista de convites
      await fetchConvites(currentPage);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao desvincular o motorista.',
      );
    } finally {
      setRespondingId(null);
    }
  };

  /**
   * ------------------------------------------------------------------------
   * PAGINAÇÃO
   * ------------------------------------------------------------------------
   */

  const handlePageChange = (newPage: number) => {
    if (
      newPage !== currentPage &&
      newPage >= 0 &&
      newPage < (paginatedData?.totalPaginas ?? 0)
    ) {
      fetchConvites(newPage);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  /**
   * ------------------------------------------------------------------------
   * CONEXÃO
   * ------------------------------------------------------------------------
   */

  useEffect(() => {
    fetchConvites(0);

    const handleOnline = () => {
      setIsOffline(false);
      fetchConvites(currentPage);
      toast.success('Conexão restabelecida!');
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchConvites]);

  /**
   * ------------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* HEADER */}

      <header className="bg-blue-800 px-4 pt-3 pb-6 sm:px-6 md:px-8 sm:pt-4 sm:pb-7">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
            Solicitações de conexão
          </h1>

          <div className="text-xs sm:text-sm text-white/70 space-y-0.5">
            {totalElementos > 0 ? (
              <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span>
                  Página {currentPage + 1} de {totalPaginas}
                </span>

                <span className="hidden sm:inline">•</span>

                <span>
                  {totalElementos} solicitação
                  {totalElementos !== 1 ? 's' : ''}
                </span>
              </p>
            ) : (
              <p>Nenhuma solicitação encontrada</p>
            )}
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 md:px-8 pb-12 sm:pb-16 max-w-4xl mx-auto">
        {/* OFFLINE */}

        {isOffline && (
          <div className="w-full mb-4 p-3 sm:p-4 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
            <WifiOff size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" />

            <span>
              Você está offline. Conecte-se para atualizar suas solicitações.
            </span>
          </div>
        )}

        {/* CTA DINÂMICO: empresa vinculada > convite pendente > estado padrão */}

        <div className="-mt-4 mb-5">
          {convitePendenteDestaque ? (
            <ConvitePendenteCTA
              convite={convitePendenteDestaque}
              responding={respondingId === convitePendenteDestaque.id}
              onResponder={handleResponder}
            />
          ) : (
            <SemVinculoCard />
          )}
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
            <Loader2 className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />

            <span className="text-sm sm:text-base text-gray-600">
              Carregando solicitações...
            </span>
          </div>
        ) : error ? (
          /* ERRO */

          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Erro ao carregar solicitações
            </h3>

            <p className="text-gray-500 text-sm mb-6 max-w-md">{error}</p>

            <Button
              onClick={() => fetchConvites(currentPage)}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            {/* EMPRESA VINCULADA */}
            {empresaVinculada && (
              <div className="space-y-3 sm:space-y-4">
                <ConviteCard
                  razaoSocial={user?.dadosExtras?.empresaRazaoSocial}
                  cnpj={user?.dadosExtras?.empresaCnpj}
                  onDesvincular={() => setModalDesvincularAberto(true)}
                  disabled={respondingId !== null}
                />
              </div>
            )}

            {/* SEM EMPRESA E SEM CONVITES */}
            {!empresaVinculada && !convitePendenteValido && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 border-gray-200 border-dashed border-2 bg-white rounded-2xl">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-3" />

                <p className="text-sm sm:text-base text-gray-500">
                  Nenhuma solicitação encontrada.
                </p>
              </div>
            )}

            {/* PAGINAÇÃO DOS CONVITES */}
            {convites.length > 0 && totalPaginas > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPaginas}
                totalElements={totalElementos}
                currentPageSize={tamanhoPagina}
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            )}
          </>
        )}

        {/* TUTORIAL */}

        <div
          className="
            flex
            items-center
            gap-3
            sm:gap-4
            bg-white
            border
            border-gray-100
            border-l-4
            border-l-[#1351B4]
            rounded-xl
            p-3
            sm:p-4
            mt-6
            sm:mt-8
          "
        >
          <div
            className="
              bg-blue-50
              rounded-xl
              w-9 h-9
              sm:w-11 sm:h-11
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#1351B4]" />
          </div>

          <div>
            <p className="text-sm sm:text-base font-semibold text-[#071D41]">
              Sobre as solicitações
            </p>

            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Aceite uma solicitação para criar um vínculo com a empresa.
            </p>
          </div>
        </div>
      </main>

      <ModalConfirmacaoExclusao
        isOpen={modalDesvincularAberto}
        onClose={() => setModalDesvincularAberto(false)}
        onConfirm={confirmarDesvinculamento}
        titulo="Desvincular da empresa"
        mensagem={`Tem certeza que deseja se desvincular da empresa "${
          user?.dadosExtras?.empresaRazaoSocial ?? 'empresa'
        }"?`}
      />
    </div>
  );
}
