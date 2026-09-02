'use client';

import { useCallback, useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useAuth } from '@/components/hooks/useAuth';

import FloatingButton from '@/components/ui/floatingButton';

import {
  Info,
  Loader2,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  User2,
  UsersIcon,
  CheckCircle2,
  MailPlus,
  Clock,
  X,
} from 'lucide-react';

import { MotoristaEmpresaResponse } from '@/lib/types/personas/motorista';

import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';

import Link from 'next/link';

import {
  desvincularMotoristaEmpresa,
  getMotoristaEmpresaByUsuarioId,
} from '@/services/api/empresaApi';

import { MotoristaCard } from '@/components/empresa/cards/MotoristaCard';

import { CTASplit } from '@/components/ui/CTA/CTAsplit';

import GerarConviteMotoristaModal from '@/components/empresa/modal/GerarConviteMotoristaModal';

import {
  listarConvitesMotoristaEmpresaPorEmpresa,
  cancelarConviteMotoristaEmpresa,
} from '@/services/api/conviteMotoristaApi';
import { ConviteMotoristaEmpresaListaItem } from '@/lib/types/conviteMotoristaEmpresa';

// ==================== CARD DE CONVITE PENDENTE ====================

function ConvitePendenteCard({
  convite,
  onCancelar,
}: {
  convite: ConviteMotoristaEmpresaListaItem;
  onCancelar: (convite: ConviteMotoristaEmpresaListaItem) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
          <Clock className="h-5 w-5 text-amber-500" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#071D41] sm:text-base">
            {convite.motoristaNome ||
              convite.motoristaEmail ||
              'Convite pendente'}
          </p>

          <p className="truncate text-xs text-gray-400 sm:text-sm">
            {convite.motoristaEmail && convite.motoristaNome
              ? `${convite.motoristaEmail} • `
              : ''}

            {convite.criadoEm
              ? `Enviado em ${convite.criadoEm}`
              : 'Aguardando aceite'}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="shrink-0 border-red-200 text-xs text-red-600 hover:bg-red-50 sm:text-sm cursor-pointer"
        onClick={() => onCancelar(convite)}
      >
        <X className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
        Cancelar
      </Button>
    </div>
  );
}

// ==================== PAGINAÇÃO ====================

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

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-3 px-2">
      <div className="text-center text-xs text-gray-600 sm:text-sm">
        Mostrando {startItem} - {endItem} de {totalElements} motoristas
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="px-2 text-xs sm:px-3 sm:text-sm"
        >
          <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />

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
                h-8 min-w-[32px] rounded-md px-2 text-xs transition-colors
                sm:h-9 sm:min-w-[40px] sm:px-3 sm:text-sm
                ${
                  typeof page !== 'number'
                    ? 'cursor-default'
                    : currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                }
                ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
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
          className="px-2 text-xs sm:px-3 sm:text-sm"
        >
          <span className="hidden sm:inline">Próxima</span>
          <span className="sm:hidden">Próx</span>

          <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}

// ==================== ONLINE / OFFLINE ====================

const updateOnlineStatus = (setIsOffline: (value: boolean) => void) => {
  setIsOffline(!navigator.onLine);
};

// ==================== PÁGINA ====================

export default function MotoristasEmpresa() {
  const { user } = useAuth();

  const searchParams = useSearchParams();

  // ==================== ABA ATIVA ====================

  const aba =
    searchParams.get('aba') === 'pendencias' ? 'pendencias' : 'motoristas';

  // ==================== MOTORISTAS ====================

  const [paginatedData, setPaginatedData] =
    useState<MotoristaEmpresaResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [isOffline, setIsOffline] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  // ==================== MODAL ====================

  const [modalAberto, setModalAberto] = useState(false);

  // ==================== PENDÊNCIAS ====================

  const [pendencias, setPendencias] = useState<
    ConviteMotoristaEmpresaListaItem[]
  >([]);

  const [pendenciasCount, setPendenciasCount] = useState(0);

  const [loadingPendencias, setLoadingPendencias] = useState(true);

  // ==================== BUSCAR MOTORISTAS ====================

  const fetchMotoristas = useCallback(
    async (page: number = 0) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await getMotoristaEmpresaByUsuarioId(user.id, page);

        setPaginatedData(response);
        setCurrentPage(response.pagina);
        setIsOffline(false);
      } catch {
        toast.error('Não foi possível carregar os motoristas atuais.');

        if (!navigator.onLine) {
          setIsOffline(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // ==================== BUSCAR PENDÊNCIAS ====================

  const fetchPendencias = useCallback(async () => {
    if (!user?.id) {
      setLoadingPendencias(false);
      return;
    }

    setLoadingPendencias(true);

    try {
      const response = await listarConvitesMotoristaEmpresaPorEmpresa(user.id, {
        listaStatus: ['PENDENTE'],
        pagina: 0,
        tamanhoPagina: 10,
        ordem: 'DESC',
      });

      setPendencias(response.content ?? []);
      setPendenciasCount(response.totalElementos ?? 0);
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);

      setPendencias([]);
      setPendenciasCount(0);

      if (!navigator.onLine) {
        setIsOffline(true);
      }
    } finally {
      setLoadingPendencias(false);
    }
  }, [user?.id]);

  // ==================== EFEITOS ====================

  useEffect(() => {
    fetchMotoristas(0);
    fetchPendencias();

    const handleOnline = () => {
      fetchMotoristas(currentPage);
      fetchPendencias();

      toast.success('Conexão restabelecida!');
    };

    const handleOffline = () => {
      updateOnlineStatus(setIsOffline);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMotoristas, fetchPendencias]);

  // ==================== PAGINAÇÃO ====================

  const handlePageChange = (newPage: number) => {
    if (
      newPage !== currentPage &&
      newPage >= 0 &&
      newPage < (paginatedData?.totalPaginas || 0)
    ) {
      fetchMotoristas(newPage);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // ==================== DESVINCULAR MOTORISTA ====================

  const handleDesvincularMotorista = async (motoristaId: string) => {
    if (!navigator.onLine) {
      toast.error(
        'Você está offline. A exclusão de motorista só é permitida com conexão à internet.',
      );
      return;
    }

    try {
      await desvincularMotoristaEmpresa(user?.id, motoristaId);

      toast.success('Motorista desvinculado com sucesso!');
      fetchMotoristas(currentPage);
    } catch (err: unknown) {
      console.error('Erro ao desvincular motorista:', err);

      toast.error(
        err instanceof Error ? err.message : 'Erro ao desvincular motorista.',
      );
    }
  };
  // ==================== CANCELAR CONVITE ====================

  const handleCancelarConvite = async (
  convite: ConviteMotoristaEmpresaListaItem,
) => {
  if (!navigator.onLine) {
    toast.error(
      'Você está offline. O cancelamento de convite só é permitido com conexão à internet.',
    );
    return;
  }

  if (!user) {
    toast.error('Não foi possível identificar a empresa.');
    return;
  }

  try {
    await cancelarConviteMotoristaEmpresa(
      user.id,
      convite.id,
    );

    toast.success('Convite cancelado com sucesso!');

    await fetchPendencias();
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : 'Erro ao cancelar convite.',
    );
  }
};
  // ==================== DADOS ====================

  const motoristas = paginatedData?.content ?? [];

  const totalPaginas = paginatedData?.totalPaginas ?? 0;

  const totalElementos = paginatedData?.totalElementos ?? 0;

  const tamanhoPagina = paginatedData?.tamanhoPagina ?? 10;

  // ==================== HEADER ====================

  const headerContent =
    aba === 'pendencias'
      ? {
          titulo: 'Pendências',

          subtitulo: pendenciasCount
            ? `${pendenciasCount} pendência${
                pendenciasCount !== 1 ? 's' : ''
              } aguardando sua ação`
            : 'Nenhuma pendência no momento',
        }
      : {
          titulo: `Gerenciar Motoristas, ${
            user?.nome?.split(' ')[0] || 'motorista'
          }`,

          subtitulo: null,
        };

  const isLoadingAba = aba === 'pendencias' ? loadingPendencias : loading;

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}

      <header className="bg-blue-800 px-4 pb-6 pt-3 sm:px-6 sm:pb-7 sm:pt-4 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {headerContent.titulo}
          </h1>

          <div className="space-y-0.5 text-xs text-white/70 sm:text-sm">
            {aba === 'pendencias' ? (
              <p>{headerContent.subtitulo}</p>
            ) : totalElementos > 0 ? (
              <p className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span>
                  Página {currentPage + 1} de {totalPaginas}
                </span>

                <span className="hidden sm:inline">•</span>

                <span>
                  Total: {totalElementos} motorista
                  {totalElementos !== 1 ? 's' : ''}
                </span>
              </p>
            ) : (
              <p>Nenhum motorista encontrado</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 pb-12 sm:px-6 sm:pb-16 md:px-8">
        {/* ==================== CTA ==================== */}

        <div className="-mt-4 mb-5">
          <CTASplit
            paramName="aba"
            left={{
              title: 'Motoristas conectados',
              mobileTitle: 'Motorista',
              description: 'Veja quem já está na sua frota',
              icon: <UsersIcon className="h-5 w-5 text-white" />,
              value: 'motoristas',
            }}
            right={{
              title: 'Gerenciar convites e pendências',
              mobileTitle: 'Gerenciar',
              description: 'visualize e convide motoristas',
              icon: <MailPlus className="h-5 w-5 text-white" />,
              value: 'pendencias',
              badge: pendenciasCount,
            }}
          />
        </div>

        {/* ==================== OFFLINE ==================== */}

        {isOffline && (
          <div className="mb-4 flex w-full items-center gap-2 rounded-lg border border-amber-300 bg-amber-100 p-3 text-xs text-amber-800 sm:p-4 sm:text-sm">
            <WifiOff size={16} className="shrink-0 sm:h-[18px] sm:w-[18px]" />

            <span>
              Você está offline. Conecte-se para atualizar ou editar os
              motoristas.
            </span>
          </div>
        )}

        {/* ==================== LOADING ==================== */}

        {isLoadingAba ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 sm:h-8 sm:w-8" />

            <span className="text-sm text-gray-600 sm:text-base">
              {aba === 'pendencias'
                ? 'Carregando pendências...'
                : 'Carregando motoristas...'}
            </span>
          </div>
        ) : aba === 'pendencias' ? (
          /* ==================== PENDÊNCIAS ==================== */

          pendencias.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 text-center">
              <CheckCircle2 className="mb-3 h-8 w-8 text-green-500 sm:h-10 sm:w-10" />

              <p className="text-sm text-gray-500 sm:text-base">
                Tudo certo por aqui. Nenhuma pendência encontrada.
              </p>
            </div>
          ) : (
            <section className="flex animate-in flex-col gap-4 fade-in duration-200">
              {pendencias.map((convite) => (
                <ConvitePendenteCard
                  key={`${convite.motoristaEmail}-${convite.criadoEm}`}
                  convite={convite}
                  onCancelar={handleCancelarConvite}
                />
              ))}
            </section>
          )
        ) : motoristas.length === 0 ? (
          /* ==================== SEM MOTORISTAS ==================== */

          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 text-center">
            <User2 className="mb-3 h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />

            <p className="text-sm text-gray-500 sm:text-base">
              Nenhum motorista encontrado.
            </p>
          </div>
        ) : (
          <>
            {/* ==================== LISTA DE MOTORISTAS ==================== */}

            <section className="flex animate-in flex-col gap-4 fade-in duration-200">
              {motoristas.map((motorista) => (
                <MotoristaCard
                  key={motorista.id}
                  motorista={motorista}
                  onDesvincular={() => handleDesvincularMotorista(motorista.id)}
                />
              ))}
            </section>

            {/* ==================== PAGINAÇÃO ==================== */}

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

        {/* ==================== TUTORIAL ==================== */}

        <Link
          href="/tutorial#minhasMOTORISTA"
          className="mt-6 flex items-center gap-3 rounded-xl border border-gray-100 border-l-4 border-l-[#1351B4] bg-white p-3 transition-colors hover:bg-blue-50/30 sm:mt-8 sm:gap-4 sm:p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 sm:h-11 sm:w-11">
            <Info className="h-4 w-4 text-[#1351B4] sm:h-5 sm:w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#071D41] sm:text-base">
              Novo por aqui?
            </p>

            <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">
              Veja como usar o sistema em 3 passos simples
            </p>
          </div>
        </Link>
      </main>

      {/* ==================== MODAL DE CONVITE ==================== */}

      <GerarConviteMotoristaModal
        open={modalAberto}
        empresaId={user?.id || ''}
        onOpenChange={setModalAberto}
        onSuccess={() => {
          fetchMotoristas(currentPage);
          fetchPendencias();
        }}
      />

      {/* ==================== BOTÃO FLUTUANTE ==================== */}

      {aba === 'pendencias' && !modalAberto && (
        <FloatingButton
          label="Convidar motorista"
          onClick={() => setModalAberto(true)}
        />
      )}
    </div>
  );
}
