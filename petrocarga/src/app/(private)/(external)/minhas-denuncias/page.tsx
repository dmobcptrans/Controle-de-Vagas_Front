'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getDenunciasByUsuario } from '@/services/api/denunciaApi';
import DenunciaLista from '@/components/motorista/cards/denuncia/DenunciaLista';
import { DenunciaResponse } from '@/lib/types/denuncia';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  TriangleAlert,
} from 'lucide-react';
import { ChevronLeft, ChevronRight, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CTA } from '@/components/ui/CTA/CTA';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/ui/Header/Header';

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
        Mostrando {startItem} - {endItem} de {totalElements} denúncias
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
 * @component MinhasDenuncias
 * @version 1.0.0
 *
 * @description Página de visualização de denúncias do motorista.
 * Lista todas as denúncias criadas pelo usuário logado.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Se não houver user.id, não carrega denúncias
 *
 * 2. CARREGAMENTO DE DENÚNCIAS:
 *    - useEffect dispara fetchDenuncias na montagem
 *    - useCallback memoiza função com base no user.id
 *    - Chama API getDenunciasByUsuario com ID do usuário
 *
 * 3. ESTADOS DE UI (4 ESTADOS):
 *
 *    a) LOADING:
 *       - Spinner centralizado
 *       - Mensagem "Carregando denúncias..."
 *
 *    b) ERRO:
 *       - Falha na API
 *       - Toast de erro automático
 *       - Ícone de alerta vermelho
 *       - Botão "Tentar novamente"
 *
 *    c) SEM DENÚNCIAS:
 *       - Mensagem centralizada
 *       - "Você ainda não possui nenhuma denúncia cadastrada."
 *
 *    d) LISTA COM DENÚNCIAS:
 *       - Título "Denúncias"
 *       - Componente DenunciaLista com as denúncias
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - FEEDBACK DUPLO: Toast + UI error
 *   - Toast para notificação imediata
 *   - UI error para contexto visual
 *
 * - useCallback + useEffect: Padrão para busca de dados
 *
 * - LISTA VAZIA: Mensagem amigável em vez de estado de erro
 *
 * - LAYOUT SIMPLES:
 *   - max-w-2xl para legibilidade
 *   - bg-gray-50 para fundo suave
 *   - Centralização consistente
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - DenunciaLista: Lista de denúncias
 * - useAuth: Hook de autenticação
 * - getDenunciasByUsuario: API de busca
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <MinhasDenuncias />
 * ```
 *
 * @see /components/motorista/cards/denuncia/DenunciaLista.tsx - Lista de denúncias
 * @see /lib/api/denunciaApi.ts - Função getDenunciasByUsuario
 */

export default function MinhasDenuncias() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const [paginatedData, setPaginatedData] = useState<DenunciaResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const denuncias = paginatedData?.content ?? [];
  const totalPaginas = paginatedData?.totalPaginas ?? 0;
  const totalElementos = paginatedData?.totalElementos ?? 0;
  const tamanhoPagina = paginatedData?.tamanhoPagina ?? 10;

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------------------------------------

  const fetchDenuncias = useCallback(
    async (page: number = 0) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getDenunciasByUsuario(user.id, page);

        setPaginatedData(response);
        setCurrentPage(response.pagina);
      } catch {
        setError(
          'Erro ao carregar suas denúncias. Por favor, tente novamente mais tarde.',
        );
        toast.error(
          'Erro ao carregar suas denúncias. Por favor, tente novamente mais tarde.',
        );
        setPaginatedData(null);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  const handlePageChange = (newPage: number) => {
    if (
      newPage !== currentPage &&
      newPage >= 0 &&
      newPage < (paginatedData?.totalPaginas ?? 0)
    ) {
      fetchDenuncias(newPage);
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const updateOnlineStatus = (setIsOffline: (v: boolean) => void) => {
    setIsOffline(!navigator.onLine);
  };

  // --------------------------------------------------------------------------
  // EFEITO INICIAL
  // --------------------------------------------------------------------------

  useEffect(() => {
    fetchDenuncias(0);

    const handleOnline = () => {
      fetchDenuncias(currentPage);
      toast.success('Conexão restabelecida!');
    };

    const handleOffline = () => updateOnlineStatus(setIsOffline);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchDenuncias]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}

      <Header
        title={`Suas Denúncias, ${user?.nome?.split(' ')[0] || 'motorista'}`}
        subtitle="Aqui Estão Suas Denúncias Cadastradas"
        pagination={
          totalElementos > 0
            ? {
                totalElementos,
                totalPaginas,
                tamanhoPagina,
                pagina: currentPage,
              }
            : undefined
        }
      />

      <main className="px-3 sm:px-6 md:px-8 pb-12 sm:pb-16 max-w-4xl mx-auto">
        {/* ==================== BANNER OFFLINE ==================== */}
        {isOffline && (
          <div className="w-full mb-4 p-3 sm:p-4 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
            <WifiOff size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" />

            <span>
              Você está offline. Conecte-se para atualizar suas denúncias.
            </span>
          </div>
        )}

        {/* ==================== CTA ==================== */}
        <div className="-mt-4 mb-5">
          <CTA
            title="Nenhuma Denúncia Em Processo"
            description="Veja seu histórico e atualizações sobre elas"
            icon={<TriangleAlert className="h-5 w-5 text-white" />}
          />
        </div>

        {/* ==================== LOADING ==================== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
            <Loader2 className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />

            <span className="text-sm sm:text-base text-gray-600">
              Carregando denúncias...
            </span>
          </div>
        ) : error ? (
          /* ==================== ERRO ==================== */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Erro ao carregar denúncias
            </h3>

            <p className="text-gray-500 text-sm mb-6">{error}</p>

            <Button
              onClick={() => fetchDenuncias(currentPage)}
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        ) : denuncias.length === 0 ? (
          /* ==================== SEM DENÚNCIAS ==================== */
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 border-gray-200 border-dashed border-2 bg-white rounded-2xl">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-3" />
            <p className="text-sm sm:text-base text-gray-500">
              Nenhuma denúncia encontrada.
            </p>
          </div>
        ) : (
          <>
            {/* ==================== LISTA ==================== */}
            <DenunciaLista denuncias={denuncias} />

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
          href="/tutorial#denuncias"
          className="flex items-center gap-3 sm:gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-3 sm:p-4 hover:bg-blue-50/30 transition-colors mt-6 sm:mt-8"
        >
          <div className="bg-blue-50 rounded-xl w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#1351B4]" />
          </div>

          <div>
            <p className="text-sm sm:text-base font-semibold text-[#071D41]">
              Como registrar denúncias?
            </p>

            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Aprenda a registrar e acompanhar suas denúncias
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
