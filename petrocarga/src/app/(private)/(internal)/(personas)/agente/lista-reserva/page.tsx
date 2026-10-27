'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { finalizarForcado } from '@/features/reserva/reservas/services/reservaApi';
import { useReservas } from '@/features/reserva/reservas/hooks/useReservas';

import { Info, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';

import toast from 'react-hot-toast';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/Header/Header';
import ReservaLista from '@/features/reserva/reservas/components/ReservaLista';
import { ReservaResponse } from '@/features/reserva/reservas/types/reservas';

const TAMANHO_PAGINA = 10;

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
        Mostrando {startItem} - {endItem} de {totalElements} reservas
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

const updateOnlineStatus = (setIsOffline: (value: boolean) => void) => {
  setIsOffline(!navigator.onLine);
};

/**
 * @component ReservaRapidaPage
 * @version 2.0.0
 *
 * Busca e paginação delegadas ao useReservas (buscarReservasRapidas).
 * Checkout continua via chamada direta a finalizarForcado: useReservaInteraction
 * fixa um reservaId na criação do hook, e essa página trata cliques em
 * reservaId dinâmico dentro de uma lista — não dá pra instanciar o hook
 * aqui no nível da página. Se quiser, dá pra mover essa ação pra dentro
 * do item de ReservaLista, onde cada card teria seu próprio reservaId fixo.
 */
export default function ReservaRapidaPage() {
  const { user } = useAuth();

  const [isOffline, setIsOffline] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // ==================== PARÂMETROS DE BUSCA (PAGINAÇÃO) ====================
  const params = useMemo(
    () => ({ numeroPagina: currentPage, tamanhoPagina: TAMANHO_PAGINA }),
    [currentPage],
  );

  // ==================== BUSCA DE RESERVAS RÁPIDAS (VIA HOOK) ====================
  const {
    reservasRapidas,
    loading,
    error: erroReservas,
    pagina,
    totalPaginas,
    totalElementos,
    buscarReservasRapidas,
  } = useReservas<ReservaResponse>({
    usuarioId: user?.id,
    params,
    // recarregar() do hook não cobre reservas rápidas automaticamente,
    // então disparamos manualmente no useEffect abaixo
    buscarAutomaticamente: false,
  });

  // ==================== DISPARO DA BUSCA (MONTAGEM + MUDANÇA DE PÁGINA) ====================
  useEffect(() => {
    if (!user?.id) return;
    buscarReservasRapidas();
  }, [user?.id, buscarReservasRapidas]);

  // ==================== FEEDBACK DE ERRO DA BUSCA ====================
  useEffect(() => {
    if (erroReservas) {
      toast.error('Não foi possível carregar as reservas atuais.');
      if (!navigator.onLine) setIsOffline(true);
    }
  }, [erroReservas]);

  // ==================== DETECÇÃO DE CONEXÃO ====================
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      buscarReservasRapidas();
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
  }, [buscarReservasRapidas]);

  // ==================== HANDLER DE PÁGINA ====================
  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage && newPage >= 0 && newPage < totalPaginas) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==================== HANDLER DE CHECKOUT ====================
  const handleCheckoutReserva = useCallback(
    async (reservaId: string) => {
      try {
        await finalizarForcado(reservaId);
        toast.success('Checkout realizado com sucesso!');
        await buscarReservasRapidas();
      } catch {
        toast.error('Erro ao realizar checkout da reserva.');
      }
    },
    [buscarReservasRapidas],
  );

  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Agente';

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header
        title={`Suas Reservas, ${primeiroNome}`}
        pagination={{
          totalElementos,
          totalPaginas,
          tamanhoPagina: TAMANHO_PAGINA,
          pagina,
        }}
      />

      <main className="px-3 sm:px-6 md:px-8 pb-12 sm:pb-16 max-w-4xl mx-auto">
        {isOffline && (
          <div className="w-full mb-4 p-3 sm:p-4 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
            <WifiOff size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span>
              Você está offline. Conecte-se para atualizar ou modificar
              reservas.
            </span>
          </div>
        )}

        {/* ==================== LISTA ==================== */}
        <ReservaLista
          permissao="AGENTE"
          reservasRapidas={reservasRapidas}
          onCheckoutRapido={handleCheckoutReserva}
        />

        {/* ==================== PAGINAÇÃO ==================== */}
        {totalPaginas > 1 && (
          <PaginationControls
            currentPage={pagina}
            totalPages={totalPaginas}
            totalElements={totalElementos}
            currentPageSize={TAMANHO_PAGINA}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}

        {/* ==================== TUTORIAL ==================== */}
        <Link
          href="/tutorial#minhasreservas"
          className="flex items-center gap-3 sm:gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-3 sm:p-4 hover:bg-blue-50/30 transition-colors mt-6 sm:mt-8"
        >
          <div className="bg-blue-50 rounded-xl w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#1351B4]" />
          </div>

          <div>
            <p className="text-sm sm:text-base font-semibold text-[#071D41]">
              Novo por aqui?
            </p>

            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Veja como usar o sistema em 3 passos simples
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
