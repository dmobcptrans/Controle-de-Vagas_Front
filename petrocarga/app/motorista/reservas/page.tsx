'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import {
  deleteReservaByID,
  getReservasPorUsuario,
  checkoutReserva,
  getGerarComprovanteReserva,
} from '@/lib/api/reservaApi';
import {
  AlertCircle,
  Info,
  Loader2,
  WifiOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ReservaLista from '@/components/reserva/minhasReservas/ReservaLista';
import { ReservaGet, PaginatedReservaResponse } from '@/lib/types/reserva';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * @component PaginationControls
 * @description Componente de controles de paginação responsivo.
 * Adapta a quantidade de botões visíveis conforme o tamanho da tela.
 *
 * @param currentPage - Página atual (0-indexed)
 * @param totalPages - Total de páginas
 * @param totalElements - Total de elementos
 * @param currentPageSize - Itens por página
 * @param onPageChange - Callback ao mudar de página
 * @param isLoading - Estado de carregamento
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
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 3; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 3; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

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
                min-w-[32px] sm:min-w-[40px] h-8 sm:h-9 px-2 sm:px-3 
                rounded-md text-xs sm:text-sm transition-colors
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
 * @function updateOnlineStatus
 * @description Atualiza o estado de conexão do usuário
 */
const updateOnlineStatus = (setIsOffline: (v: boolean) => void) => {
  setIsOffline(!navigator.onLine);
};

/**
 * @component MinhasReservas
 * @version 1.0.0
 *
 * @description Página de listagem e gerenciamento de reservas do motorista.
 * Exibe reservas paginadas com ações de checkout, cancelamento e geração de comprovante.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Se não houver user.id, não carrega reservas
 *
 * 2. CARREGAMENTO DE RESERVAS (PAGINADO):
 *    - useEffect dispara fetchReservas na montagem
 *    - useCallback memoiza função com base no user.id
 *    - Chama API getReservasPorUsuario com página
 *    - Resposta inclui dados paginados (content, totalPages, totalElements)
 *
 * 3. PAGINAÇÃO:
 *    - Controles responsivos (mobile/desktop)
 *    - Números de página com reticências
 *    - Scroll suave ao trocar de página
 *
 * 4. DETECÇÃO DE CONEXÃO:
 *    - Monitora eventos online/offline do navegador
 *    - Exibe banner amarelo quando offline
 *    - Bloqueia ações que exigem conexão
 *    - Recarrega dados ao reconectar
 *
 * 5. AÇÕES DISPONÍVEIS:
 *    a) CHECKOUT: Finalizar reserva ativa
 *    b) CANCELAR: Cancelar/excluir reserva
 *    c) COMPROVANTE: Gerar PDF da reserva
 *
 * 6. ESTADOS DE UI:
 *    - Loading: spinner centralizado
 *    - Erro: toast error
 *    - Sem reservas: ícone + mensagem
 *    - Lista com reservas: cards + paginação
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - PAGINAÇÃO NO BACKEND: API retorna objeto paginado (content, totalPages)
 * - PAGINAÇÃO RESPONSIVA: 3 botões no mobile, 5 no desktop
 * - DETECÇÃO DE CONEXÃO: Event listeners 'online' e 'offline'
 * - SCROLL SUAVE: window.scrollTo({ behavior: 'smooth' }) ao trocar página
 * - RECARGA AUTOMÁTICA: Ao voltar online, recarrega página atual
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ReservaLista: Lista de reservas com ações
 * - useAuth: Hook de autenticação
 * - getReservasPorUsuario: API de listagem paginada
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <MinhasReservas />
 * ```
 */

export default function MinhasReservas() {
  const { user } = useAuth();
  const [paginatedData, setPaginatedData] =
    useState<PaginatedReservaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // ==================== BUSCA DE RESERVAS (PAGINADA) ====================
  const fetchReservas = useCallback(
    async (page: number = 0) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await getReservasPorUsuario(user.id, page);
        setPaginatedData(response);
        setCurrentPage(response.pagina);
        setIsOffline(false);
      } catch {
        toast.error('Não foi possível carregar suas reservas atuais.');
        if (!navigator.onLine) setIsOffline(true);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // ==================== EFEITOS (CARREGAMENTO + ONLINE/OFFLINE) ====================
  useEffect(() => {
    fetchReservas(0);

    const handleOnline = () => {
      fetchReservas(currentPage);
      toast.success('Conexão restabelecida!');
    };
    const handleOffline = () => updateOnlineStatus(setIsOffline);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchReservas]);

  // ==================== HANDLER DE PÁGINA ====================
  const handlePageChange = (newPage: number) => {
    if (
      newPage !== currentPage &&
      newPage >= 0 &&
      newPage < (paginatedData?.totalPaginas || 0)
    ) {
      fetchReservas(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==================== HANDLERS DE AÇÕES ====================
  const handleGerarDocumento = async (reservaId: string) => {
    try {
      await getGerarComprovanteReserva(reservaId);
      toast.success('Comprovante gerado com sucesso!');
    } catch {
      toast.error('Erro ao gerar comprovante!');
    }
  };

  const handleExcluirReserva = async (reservaId: string) => {
    if (!navigator.onLine) {
      toast.error(
        'Você está offline. A exclusão de reservas só é permitida com conexão à internet.',
      );
      return;
    }

    try {
      await deleteReservaByID(reservaId, user!.id);
      toast.success('Reserva cancelada com sucesso!');
      fetchReservas(currentPage);
    } catch {
      toast.error('Erro ao cancelar. Verifique sua conexão.');
    }
  };

  const handleCheckoutReserva = async (reserva: ReservaGet) => {
    if (!navigator.onLine) {
      toast.error(
        'Você está offline. O checkout só é permitido com conexão à internet.',
      );
      return;
    }

    try {
      const response = await checkoutReserva(reserva.id);
      if (response.success) {
        toast.success('Checkout realizado com sucesso!');
        fetchReservas(currentPage);
      }
    } catch {
      toast.error('Erro ao realizar checkout da reserva.');
    }
  };

  const reservas = paginatedData?.content || [];
  const totalPaginas = paginatedData?.totalPaginas || 0;
  const totalElementos = paginatedData?.totalElementos || 0;
  const tamanhoPagina = paginatedData?.tamanhoPagina || 10;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}
      <header className="bg-blue-800 px-4 pt-3 pb-6 sm:px-6 md:px-8 sm:pt-4 sm:pb-7">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
            Suas Reservas, {user?.nome?.split(' ')[0] || 'motorista'}
          </h1>
          <div className="text-xs sm:text-sm text-white/70 space-y-0.5">
            {totalElementos > 0 ? (
              <>
                <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span>
                    Página {currentPage + 1} de {totalPaginas}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    Total: {totalElementos} reserva
                    {totalElementos !== 1 ? 's' : ''}
                  </span>
                </p>
              </>
            ) : (
              <p>Nenhuma reserva encontrada</p>
            )}
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 md:px-8 pb-12 sm:pb-16 max-w-4xl mx-auto">
        {/* ==================== BANNER OFFLINE ==================== */}
        {isOffline && (
          <div className="w-full mb-4 p-3 sm:p-4 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
            <WifiOff size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span>
              Você está offline. Conecte-se para atualizar ou modificar
              reservas.
            </span>
          </div>
        )}

        {/* ==================== ESTADO DE LOADING ==================== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
            <Loader2 className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <span className="text-sm sm:text-base text-gray-600">
              Carregando reservas...
            </span>
          </div>
        ) : reservas.length === 0 ? (
          /* ==================== ESTADO SEM RESERVAS ==================== */
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-3" />
            <p className="text-sm sm:text-base text-gray-500">
              Nenhuma reserva encontrada.
            </p>
          </div>
        ) : (
          <>
            {/* ==================== LISTA DE RESERVAS ==================== */}
            <ReservaLista
              reservas={reservas}
              onGerarDocumento={handleGerarDocumento}
              onExcluir={handleExcluirReserva}
              onCheckout={handleCheckoutReserva}
            />

            {/* ==================== CONTROLES DE PAGINAÇÃO ==================== */}
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

        {/* ==================== TUTORIAL LINK ==================== */}
        <Link
          href="/motorista/tutorial#minhasreservas"
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
