'use client';

import { useDenuncias } from '@/components/hooks/useDenuncias';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertCircle,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
} from 'lucide-react';
import DenunciaLista from '@/components/gestor/denuncia/DenunciaLista';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CTA } from '@/components/ui/CTA/CTA';
import { Header } from '@/components/ui/Header/Header';

export default function DenunciasAgente() {
  const {
    denuncias,
    loading,
    error,
    refetch,
    currentPage,
    handlePageChange,
    tamanhoPagina,
    totalElementos,
    totalPaginas,
  } = useDenuncias();

  // TODO: substitua pelo hook/contexto real de usuário (ex: useAuth())
  const { user } = useAuth();

  // --------------------------------------------------------------------------
  // ESTADO 2: ERRO
  // --------------------------------------------------------------------------
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-6 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
          Erro ao carregar denúncias
        </h3>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-6">
          {error}
        </p>
        <Button
          onClick={refetch}
          variant="outline"
          aria-label="Tentar carregar denúncias novamente"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ESTADO 3: LISTA VAZIA
  // --------------------------------------------------------------------------
  if (!denuncias.length) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        {/* ==================== HEADER ==================== */}
        <Header
          title={`Suas Denúncias, ${user?.nome?.split(' ')[0] || 'usuario'}`}
          pagination={{
            totalElementos,
            totalPaginas,
            tamanhoPagina,
            pagina: currentPage,
          }}
        />
        <main className="px-3 sm:px-6 md:px-8 pb-12 sm:pb-16 max-w-4xl mx-auto">
          <div className="-mt-4 mb-5">
            <CTA
              title="Nenhuma Denúncia Em Processo"
              description="Veja o histórico e atualizações sobre elas"
              icon={<TriangleAlert className="h-5 w-5 text-white" />}
            />
          </div>

          <div className="w-full mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-6">
            {/* ==================== ESTADO VAZIO ==================== */}
            <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              </div>

              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                Nenhuma denúncia encontrada
              </h3>

              <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                O sistema não possui denúncias registradas. Quando houver uma
                denúncia, ela aparecerá aqui.
              </p>
            </div>

            {/* Tutorial Link */}
            <div className="mt-0">
              <Link
                href="/agente/tutorial#denuncias"
                className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors group w-full"
              >
                <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Info className="h-5 w-5 text-[#1351B4]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    Novo por aqui?
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Aprenda a acompanhar e responder às denúncias dos motoristas
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ESTADO 4: LISTA COM DADOS + PAGINAÇÃO
  // --------------------------------------------------------------------------
  const startItem = currentPage * tamanhoPagina + 1;
  const endItem = Math.min((currentPage + 1) * tamanhoPagina, totalElementos);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPaginas - 1;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}
      <Header
        title={`Suas Denúncias, ${user?.nome?.split(' ')[0] || 'usuario'}`}
        pagination={{
          totalElementos,
          totalPaginas,
          tamanhoPagina,
          pagina: currentPage,
        }}
      />

      <main className="px-3 sm:px-6 md:px-8 pb-12 sm:pb-16 max-w-4xl mx-auto">
        <div className="-mt-4 mb-5">
          <CTA
            title="Nenhuma Denúncia Em Processo"
            description="Veja o histórico e atualizações sobre elas"
            icon={<TriangleAlert className="h-5 w-5 text-white" />}
          />
        </div>

        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-6">
          <DenunciaLista denuncias={denuncias} onRefresh={refetch} />

          {/* ==================== PAGINAÇÃO ==================== */}
          {totalPaginas > 1 && (
            <nav
              className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-gray-100 rounded-xl p-4"
              aria-label="Navegação de páginas"
            >
              <p className="text-sm text-gray-500 order-2 sm:order-1">
                Mostrando {startItem} - {endItem} de {totalElementos} denúncias
              </p>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={isFirstPage}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Anterior</span>
                </Button>

                <span className="text-sm font-medium text-gray-700 px-2 tabular-nums">
                  {currentPage + 1} / {totalPaginas}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={isLastPage}
                  aria-label="Próxima página"
                >
                  <span className="hidden sm:inline mr-1">Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </nav>
          )}

          {/* Tutorial Link */}
          <div className="mt-6">
            <Link
              href="/agente/tutorial#denuncias"
              className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors group w-full"
            >
              <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <Info className="h-5 w-5 text-[#1351B4]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Novo por aqui?
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Aprenda a acompanhar e responder às denúncias dos motoristas
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
