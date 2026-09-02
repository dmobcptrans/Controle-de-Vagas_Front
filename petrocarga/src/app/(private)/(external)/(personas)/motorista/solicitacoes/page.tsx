'use client';

import { useAuth } from '@/contexts/AuthContext';

import {
  cancelarConviteMotoristaEmpresa,
  listarConvitesMotoristaEmpresaPorMotorista,
  responderConviteMotoristaExistenteEmpresa,
} from '@/services/api/conviteMotoristaApi';

import type {
  ConviteMotoristaEmpresaListaItem,
  ConvitesMotoristaEmpresaResponse,
} from '@/lib/types/conviteMotoristaEmpresa';

import {
  AlertCircle,
  Building2,
  Check,
  Clock3,
  Info,
  Loader2,
  Mail,
  RefreshCw,
  WifiOff,
  X,
} from 'lucide-react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import ModalConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';

/**
 * --------------------------------------------------------------------------
 * PAGINAÇÃO
 * --------------------------------------------------------------------------
 */

function PaginationControls({
  currentPage,
  totalPages,
  totalElements,
  currentPageSize,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  currentPageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) {
  const startItem = currentPage * currentPageSize + 1;
  const endItem = Math.min((currentPage + 1) * currentPageSize, totalElements);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    const maxVisiblePages =
      typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 3; i++) {
          pages.push(i);
        }

        pages.push('...');
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        pages.push('...');

        for (let i = totalPages - 3; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        pages.push('...');

        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }

        pages.push('...');
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-8 px-2">
      <div className="text-xs sm:text-sm text-gray-600 text-center">
        Mostrando {startItem} - {endItem} de {totalElements} solicitações
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="px-2 sm:px-3 text-xs sm:text-sm"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />

          <span className="hidden sm:inline">Anterior</span>
          <span className="sm:hidden">Ant</span>
        </Button>

        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page !== 'number' || isLoading}
              className={`
                min-w-[32px] sm:min-w-[40px]
                h-8 sm:h-9
                px-2 sm:px-3
                rounded-md
                text-xs sm:text-sm
                transition-colors

                ${
                  typeof page !== 'number'
                    ? 'cursor-default'
                    : currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                }

                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {typeof page === 'number' ? page + 1 : page}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || isLoading}
          className="px-2 sm:px-3 text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Próxima</span>
          <span className="sm:hidden">Próx</span>

          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/**
 * --------------------------------------------------------------------------
 * CARD DO CONVITE
 * --------------------------------------------------------------------------
 */

function ConviteCard({
  convite,
  responding,
  onResponder,
  onDesvincular,
}: {
  convite: ConviteMotoristaEmpresaListaItem;
  responding: boolean;
  onResponder: (
    convite: ConviteMotoristaEmpresaListaItem,
    status: 'ACEITO' | 'RECUSADO',
  ) => void;
  onDesvincular: (convite: ConviteMotoristaEmpresaListaItem) => void;
}) {
  const isPendente = convite.status === 'PENDENTE';

  /**
   * Converte:
   * "28/08/2026 12:44:29"
   * para um objeto Date.
   */
  const parseData = (data: string) => {
    try {
      const [dataParte, horaParte] = data.split(' ');

      const [dia, mes, ano] = dataParte.split('/').map(Number);

      const [hora = 0, minuto = 0, segundo = 0] = (horaParte ?? '')
        .split(':')
        .map(Number);

      return new Date(ano, mes - 1, dia, hora, minuto, segundo);
    } catch {
      return null;
    }
  };

  /**
   * Mostra somente a data:
   * 28/08/2026
   */
  const formatarData = (data: string) => {
    const date = parseData(data);

    if (!date) {
      return data;
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Calcula a expiração do convite.
   *
   * O convite expira 7 dias após a criação.
   */
  const calcularDataExpiracao = (data: string) => {
    const dataCriacao = parseData(data);

    if (!dataCriacao) {
      return null;
    }

    const dataExpiracao = new Date(dataCriacao);

    dataExpiracao.setDate(dataExpiracao.getDate() + 7);

    return dataExpiracao;
  };

  /**
   * Retorna somente a quantidade de DIAS restantes.
   *
   * Exemplo:
   * - Criado hoje       -> 7 dias
   * - Amanhã            -> 6 dias
   * - Faltam 2 dias     -> 2 dias
   * - Data de expiração -> expirado
   */
  const calcularDiasRestantes = (data: string) => {
    const expiracao = calcularDataExpiracao(data);

    if (!expiracao) {
      return null;
    }

    const agora = new Date();

    // Zera o horário para comparar somente as datas
    const hoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );

    const dataExpiracao = new Date(
      expiracao.getFullYear(),
      expiracao.getMonth(),
      expiracao.getDate(),
    );

    const diferenca = dataExpiracao.getTime() - hoje.getTime();

    const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

    return {
      expirado: dias <= 0,
      dias: Math.max(0, dias),
    };
  };

  const tempoRestante = calcularDiasRestantes(convite.criadoEm);

  const getStatus = () => {
    switch (convite.status) {
      case 'ACEITO':
        return {
          label: 'Aceito',
          className: 'bg-green-100 text-green-700 border-green-200',
          icon: <Check className="w-3.5 h-3.5" />,
        };

      case 'RECUSADO':
        return {
          label: 'Recusado',
          className: 'bg-red-100 text-red-700 border-red-200',
          icon: <X className="w-3.5 h-3.5" />,
        };

      default:
        return {
          label: 'Pendente',
          className: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: <Clock3 className="w-3.5 h-3.5" />,
        };
    }
  };

  const status = getStatus();

  return (
    <article
      className="
        bg-white
        rounded-2xl
        border border-gray-100
        shadow-sm
        overflow-hidden
        transition-all
        hover:shadow-md
      "
    >
      {/* CABEÇALHO */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="
                w-11 h-11
                sm:w-12 sm:h-12
                rounded-xl
                bg-blue-50
                flex items-center justify-center
                shrink-0
              "
            >
              <Building2
                className="
                  w-5 h-5
                  sm:w-6 sm:h-6
                  text-blue-700
                "
              />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  font-semibold
                  text-gray-900
                  text-sm
                  sm:text-base
                  truncate
                "
              >
                {convite.razaoSocial ?? 'Empresa'}
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Solicitação de vínculo
              </p>
            </div>
          </div>

          {/* STATUS */}
          <span
            className={`
              shrink-0
              inline-flex
              items-center
              gap-1
              px-2.5
              py-1
              rounded-full
              border
              text-[11px]
              sm:text-xs
              font-medium
              ${status.className}
            `}
          >
            {status.icon}
            {status.label}
          </span>
        </div>

        {/* INFORMAÇÕES */}
        <div className="mt-5 space-y-3">
          {/* E-MAIL */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />

            <span className="truncate">
              {convite.motoristaEmail || 'E-mail não informado'}
            </span>
          </div>

          {/* DATA DE CRIAÇÃO */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock3 className="w-4 h-4 text-gray-400 shrink-0" />

            <span>Recebido em {formatarData(convite.criadoEm)}</span>
          </div>

          {/* EXPIRAÇÃO */}
          {isPendente && tempoRestante && (
            <div
              className={`
                flex items-center justify-between gap-3
                rounded-xl
                px-3 py-2.5
                border
                ${
                  tempoRestante.expirado
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : tempoRestante.dias <= 1
                      ? 'bg-orange-50 border-orange-200 text-orange-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 shrink-0" />

                <span className="text-sm">
                  {tempoRestante.expirado ? (
                    <strong>Convite expirado</strong>
                  ) : (
                    <>
                      Expira em{' '}
                      <strong>
                        {tempoRestante.dias}{' '}
                        {tempoRestante.dias === 1 ? 'dia' : 'dias'}
                      </strong>
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* AÇÕES */}
        {isPendente && !tempoRestante?.expirado && (
          <div
            className="
              grid
              grid-cols-2
              gap-2
              mt-5
              pt-4
              border-t
              border-gray-100
            "
          >
            {/* RECUSAR */}
            <Button
              type="button"
              variant="outline"
              disabled={responding}
              onClick={() => onResponder(convite, 'RECUSADO')}
              className="
                h-10
                border-red-200
                text-red-600
                hover:bg-red-50
                hover:text-red-700
              "
            >
              {responding ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Recusar
            </Button>

            {/* ACEITAR */}
            <Button
              type="button"
              disabled={responding}
              onClick={() => onResponder(convite, 'ACEITO')}
              className="
                h-10
                bg-green-600
                hover:bg-green-700
                text-white
              "
            >
              {responding ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Aceitar
            </Button>
          </div>
        )}

        {/* DESVINCULAR DA EMPRESA */}
        {convite.status === 'ACEITO' && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              disabled={responding}
              onClick={() => onDesvincular(convite)}
              className="
        w-full
        h-10
        border-red-200
        text-red-600
        hover:bg-red-50
        hover:text-red-700
      "
            >
              {responding ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Desvincular da empresa
            </Button>
          </div>
        )}

        {/* CONVITE EXPIRADO */}
        {isPendente && tempoRestante?.expirado && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-red-600">
              Este convite não pode mais ser respondido porque ultrapassou o
              prazo de 7 dias.
            </p>
          </div>
        )}

        {/* RESPONDIDO */}
        {!isPendente && convite.respondidoEm && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Respondido em {formatarData(convite.respondidoEm)}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * --------------------------------------------------------------------------
 * PÁGINA
 * --------------------------------------------------------------------------
 */

export default function SolicitacoesConvite() {
  const { user } = useAuth();

  const [paginatedData, setPaginatedData] =
    useState<ConvitesMotoristaEmpresaResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isOffline, setIsOffline] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [modalDesvincularAberto, setModalDesvincularAberto] = useState(false);

  const [conviteParaDesvincular, setConviteParaDesvincular] =
    useState<ConviteMotoristaEmpresaListaItem | null>(null);

  const convites = paginatedData?.content ?? [];

  const totalPaginas = paginatedData?.totalPaginas ?? 0;
  const totalElementos = paginatedData?.totalElementos ?? 0;
  const tamanhoPagina = paginatedData?.tamanhoPagina ?? 10;

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

      await fetchConvites(currentPage);
    } catch {
      toast.error('Erro ao responder o convite.');
    } finally {
      setRespondingId(null);
    }
  };

const handleDesvincular = (
  convite: ConviteMotoristaEmpresaListaItem,
) => {
  setConviteParaDesvincular(convite);
  setModalDesvincularAberto(true);
};

const confirmarDesvinculamento = async () => {
  if (!user || !conviteParaDesvincular) {
    toast.error('Não foi possível identificar o motorista.');
    return;
  }

  setRespondingId(conviteParaDesvincular.id);

  try {
    await cancelarConviteMotoristaEmpresa(
      user.id,
      conviteParaDesvincular.id,
    );

    toast.success('Convite cancelado com sucesso.');

    setModalDesvincularAberto(false);
    setConviteParaDesvincular(null);

    await fetchConvites(currentPage);
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : 'Erro ao cancelar o convite.',
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

        {/* CTA */}

        <div className="-mt-4 mb-5">
          <div
            className="
              bg-white
              border border-gray-100
              rounded-2xl
              p-4
              sm:p-5
              shadow-sm
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-10 h-10
                rounded-xl
                bg-blue-800
                flex items-center justify-center
                shrink-0
              "
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
                Convites para conexão
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Empresas podem solicitar um vínculo com você.
              </p>
            </div>
          </div>
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
        ) : convites.length === 0 ? (
          /* VAZIO */

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              min-h-[40vh]
              text-center
              px-4
              border-gray-200
              border-dashed
              border-2
              bg-white
              rounded-2xl
            "
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-gray-700">
              Nenhuma solicitação encontrada
            </h3>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Você não possui convites de empresas para conexão no momento.
            </p>
          </div>
        ) : (
          /* LISTA */

          <>
            <div className="space-y-3 sm:space-y-4">
              {convites.map((convite) => (
                <ConviteCard
                  key={convite.id}
                  convite={convite}
                  responding={respondingId === convite.id}
                  onResponder={handleResponder}
                  onDesvincular={handleDesvincular}
                />
              ))}
            </div>

            {/* PAGINAÇÃO */}

            {totalPaginas > 1 && (
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
  onClose={() => {
    setModalDesvincularAberto(false);
    setConviteParaDesvincular(null);
  }}
  onConfirm={confirmarDesvinculamento}
  titulo="Desvincular da empresa"
  mensagem={`Tem certeza que deseja se desvincular da empresa "${
    conviteParaDesvincular?.razaoSocial ?? 'empresa'
  }"?`}
/>
    </div>
  );
}
