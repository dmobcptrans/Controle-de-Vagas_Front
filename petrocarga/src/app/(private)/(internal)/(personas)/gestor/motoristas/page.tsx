'use client';

import { useEffect, useState, useCallback } from 'react';

import { useAuth } from '@/components/hooks/useAuth';
import { getMotoristas } from '@/services/api/motoristaApi';

import {
  Search,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { Motorista } from '@/lib/types/personas/motorista';

import MotoristaCard from '@/components/gestor/cards/motoristas-card';
import { Paginacao } from '@/components/paginacao/paginacao';
import { Button } from '@/components/ui/button';
import { CTASearch } from '@/components/ui/CTA/search/CTASearch';
import { Header } from '@/components/ui/Header/Header';

const ITENS_POR_PAGINA = 9;

type FiltroStatus = 'ativos' | 'inativos' | 'todos';

/**
 * @component MotoristasPage
 *
 * @description
 * Página de listagem e gerenciamento de motoristas para gestores.
 */
export default function MotoristasPage() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();

  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [isLoadingMotoristas, setIsLoadingMotoristas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalItens, setTotalItens] = useState(0);

  // Filtro padrão
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>('ativos');

  // --------------------------------------------------------------------------
  // BUSCA DE DADOS
  // --------------------------------------------------------------------------

  const fetchMotoristas = useCallback(
    async (status: FiltroStatus) => {
      if (!user?.id) return;

      setIsLoadingMotoristas(true);
      setError(null);

      try {
        const result = await getMotoristas({
          nome: busca.trim() || undefined,

          ativo:
            status === 'todos'
              ? undefined
              : status === 'ativos',

          pagina: paginaAtual - 1,
          tamanhoPagina: ITENS_POR_PAGINA,
          ordem: 'ASC',
        });

        if (result.error) {
          setError(result.message);
          return;
        }

        setMotoristas(result.motoristas.content);
        setTotalPaginas(result.motoristas.totalPaginas);
        setTotalItens(result.motoristas.totalElementos);
      } catch {
        setError(
          'Erro ao buscar os motoristas cadastrados. Tente novamente mais tarde.',
        );
      } finally {
        setIsLoadingMotoristas(false);
      }
    },
    [user?.id, paginaAtual, busca],
  );

  useEffect(() => {
    fetchMotoristas(filtroStatus);
  }, [fetchMotoristas, filtroStatus]);

  // --------------------------------------------------------------------------
  // RESET DE PAGINAÇÃO
  // --------------------------------------------------------------------------

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, busca]);

  // --------------------------------------------------------------------------
  // FILTROS
  // --------------------------------------------------------------------------

  const handleFiltroStatus = (status: FiltroStatus) => {
    setFiltroStatus(status);
  };

  const mostrarTodos = () => {
    setFiltroStatus('todos');
    setBusca('');
    setPaginaAtual(1);
  };

  const limparBusca = () => {
    setBusca('');
    setPaginaAtual(1);
  };

  const hasActiveFilters =
    Boolean(busca.trim()) || filtroStatus !== 'todos';

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (error && !motoristas.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-600" />
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3">
              Erro ao carregar motoristas
            </h2>

            <p className="text-gray-600 mb-6 text-xs sm:text-sm md:text-base">
              {error}
            </p>

            <button
              onClick={() => fetchMotoristas(filtroStatus)}
              className="
                inline-flex
                items-center
                justify-center
                px-4
                py-2
                sm:px-5
                sm:py-2.5
                bg-blue-600
                hover:bg-blue-700
                text-white
                rounded-lg
                transition
                font-medium
                text-sm
              "
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* -------------------------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------------------------- */}

      <Header
        title="Motoristas Cadastrados"
        subtitle="Gerencie e visualize todos os motoristas do sistema"
      />

      {/* -------------------------------------------------------------------- */}
      {/* CONTEÚDO */}
      {/* -------------------------------------------------------------------- */}

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* ------------------------------------------------------------------ */}
        {/* CTA: BUSCA + FILTROS */}
        {/* ------------------------------------------------------------------ */}

        <CTASearch
          value={busca}
          onChange={(value) => {
            setBusca(value);
            setPaginaAtual(1);
          }}
          placeholder="Buscar por nome do motorista..."
          hasActiveFilters={hasActiveFilters}
          onClearFilters={mostrarTodos}
          filters={
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50 mb-3">
                Status
              </p>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={
                    filtroStatus === 'todos'
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() =>
                    handleFiltroStatus('todos')
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  Todos
                </Button>

                <Button
                  type="button"
                  variant={
                    filtroStatus === 'ativos'
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() =>
                    handleFiltroStatus('ativos')
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Ativos
                </Button>

                <Button
                  type="button"
                  variant={
                    filtroStatus === 'inativos'
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() =>
                    handleFiltroStatus('inativos')
                  }
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Inativos
                </Button>
              </div>
            </div>
          }
          filterSummary={
            <>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#FFCD07]" />

                <span className="text-sm text-white/80">
                  {motoristas.length} de {totalItens} motoristas
                </span>
              </div>

              {hasActiveFilters && (
                <span
                  className="
                    ml-3
                    flex-shrink-0
                    text-xs
                    rounded-full
                    bg-[#FFCD07]
                    px-2
                    py-1
                    text-[#071D41]
                    font-semibold
                  "
                >
                  Filtros ativos
                </span>
              )}
            </>
          }
        />

        {/* ------------------------------------------------------------------ */}
        {/* PAGINAÇÃO */}
        {/* ------------------------------------------------------------------ */}

        <div className="mb-4">
          <Paginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalItens={totalItens}
            itensPorPagina={ITENS_POR_PAGINA}
            itemLabel="motorista"
            itemLabelPlural="motoristas"
            onPageChange={setPaginaAtual}
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* LISTA DE MOTORISTAS */}
        {/* ------------------------------------------------------------------ */}

        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {motoristas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 md:p-12 text-center">
              {busca || filtroStatus !== 'todos' ? (
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>

                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum motorista encontrado
                  </h3>

                  <p className="text-gray-600 mb-5 sm:mb-6 text-xs sm:text-sm md:text-base">
                    {busca
                      ? `Não encontramos motoristas para "${busca}".`
                      : `Não encontramos motoristas ${
                          filtroStatus === 'ativos'
                            ? 'ativos'
                            : 'inativos'
                        }.`}
                  </p>

                  <button
                    onClick={mostrarTodos}
                    className="
                      px-4
                      py-2
                      sm:px-5
                      sm:py-2.5
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      rounded-lg
                      transition-colors
                      font-medium
                      text-sm
                    "
                  >
                    Ver todos os motoristas
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>

                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum motorista cadastrado
                  </h3>

                  <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                    Não há motoristas cadastrados no sistema no momento.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {motoristas.map((motorista) => (
                <MotoristaCard
                  key={motorista.usuario.id}
                  motorista={motorista}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}