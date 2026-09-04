'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getAgentes } from '@/services/api/agenteApi';
import { FiltrosAgente } from '@/lib/types/personas/agente';
import { Search, Users, CheckCircle, XCircle } from 'lucide-react';
import { Agente } from '@/lib/types/personas/agente';
import AgenteCard from '@/components/gestor/cards/agentes-card';
import { Paginacao } from '@/components/paginacao/paginacao';
import { Button } from '@/components/ui/button';
import FloatingButton from '@/components/ui/floatingButton';
import { CTASearch } from '@/components/ui/CTA/search/CTASearch';
import { useRouter } from 'next/navigation';

const ITENS_POR_PAGINA = 9;

type FiltroStatus = 'ativos' | 'inativos' | 'todos';

/**
 * @function useDebounce
 * @description
 */
function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * @component AgentesPage
 * @version 3.0.0
 *
 * @description Página de listagem e gerenciamento de agentes para gestores.
 * Segue o mesmo padrão visual/estrutural da página de Motoristas: header azul,
 * cartão de busca + filtros escuro com drawer interno, grid de cards e
 * paginação. A lógica de dados (debounce, paginação server-side, recarregar
 * após alteração de status, botão flutuante de adicionar) foi preservada.
 *
 * @example
 * <AgentesPage />
 */
export default function AgentesPage() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const router = useRouter();

  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [isLoadingAgentes, setIsLoadingAgentes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  // Estado inicial como 'ativos' (filtro padrão)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos');

  const buscaDebounced = useDebounce(busca, 400);

  const hasActiveFilters = Boolean(busca.trim()) || filtroStatus !== 'todos';

  // --------------------------------------------------------------------------
  // BUSCA DE DADOS
  // --------------------------------------------------------------------------

  const fetchAgentes = useCallback(
    async (status: FiltroStatus, nome: string, pagina: number) => {
      if (!user?.id) return;

      setIsLoadingAgentes(true);
      setError(null);

      try {
        const filtros: FiltrosAgente = {};

        if (status === 'ativos') {
          filtros.ativo = true;
        } else if (status === 'inativos') {
          filtros.ativo = false;
        }

        if (nome.trim()) {
          filtros.nome = nome.trim();
        }

        // numeroPagina é 0-indexed no backend; paginaAtual (UI) é 1-indexed
        const resultado = await getAgentes(
          filtros,
          pagina - 1,
          ITENS_POR_PAGINA,
        );

        setAgentes(resultado.content ?? []);
        setTotalPaginas(resultado.totalPaginas ?? 0);
        setTotalElementos(resultado.totalElementos ?? 0);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao buscar os agentes cadastrados. Tente novamente mais tarde.',
        );
        setAgentes([]);
      } finally {
        setIsLoadingAgentes(false);
      }
    },
    [user?.id],
  );

  const recarregarAgentes = useCallback(async () => {
    await fetchAgentes(filtroStatus, buscaDebounced, paginaAtual);
  }, [fetchAgentes, filtroStatus, buscaDebounced, paginaAtual]);

  useEffect(() => {
    fetchAgentes(filtroStatus, buscaDebounced, paginaAtual);
  }, [fetchAgentes, filtroStatus, buscaDebounced, paginaAtual]);

  // Sempre volta para a primeira página quando muda um filtro
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, buscaDebounced]);

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


  const handlePageChange = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  const filtrosAtivos = Boolean(busca) || filtroStatus !== 'todos';

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (error && !agentes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3">
              Erro ao carregar agentes
            </h2>
            <p className="text-gray-600 mb-6 text-xs sm:text-sm md:text-base">
              {error}
            </p>
            <button
              onClick={() =>
                fetchAgentes(filtroStatus, buscaDebounced, paginaAtual)
              }
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Agentes Cadastrados
          </h1>
          <p className="text-xs text-white/50">
            Gerencie e visualize todos os agentes do sistema
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* CTA: busca + filtros */}
        <CTASearch
          value={busca}
          onChange={(value) => {
            setBusca(value);
            setPaginaAtual(1);
          }}
          placeholder="Buscar por nome do agente..."
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
                  variant={filtroStatus === 'todos' ? 'default' : 'outline'}
                  onClick={() => handleFiltroStatus('todos')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Todos
                </Button>

                <Button
                  type="button"
                  variant={filtroStatus === 'ativos' ? 'default' : 'outline'}
                  onClick={() => handleFiltroStatus('ativos')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Ativos
                </Button>

                <Button
                  type="button"
                  variant={filtroStatus === 'inativos' ? 'default' : 'outline'}
                  onClick={() => handleFiltroStatus('inativos')}
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
                  {agentes.length} de {totalItens} agentes
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

        {/* Indicador de carregamento durante filtros/paginação */}
        {isLoadingAgentes && agentes.length > 0 && (
          <div className="mb-4 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              <span className="text-xs sm:text-sm text-blue-700">
                Aplicando filtros...
              </span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <Paginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalItens={totalElementos}
            itensPorPagina={ITENS_POR_PAGINA}
            itemLabel="agente"
            itemLabelPlural="agentes"
            onPageChange={handlePageChange}
          />
        </div>

        {/* LISTA DE AGENTES */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {agentes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 md:p-12 text-center">
              {filtrosAtivos ? (
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum agente encontrado
                  </h3>
                  <p className="text-gray-600 mb-5 sm:mb-6 text-xs sm:text-sm md:text-base">
                    {busca
                      ? `Não encontramos agentes para "${busca}".`
                      : `Não encontramos agentes ${
                          filtroStatus === 'ativos' ? 'ativos' : 'inativos'
                        }.`}
                  </p>
                  <button
                    onClick={mostrarTodos}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    Ver todos os agentes
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum agente cadastrado
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                    Não há agentes cadastrados no sistema no momento.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {agentes.map((agente) => (
                  <div key={agente.usuario.id} className="h-full">
                    <AgenteCard
                      agente={agente}
                      onStatusChange={recarregarAgentes}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <FloatingButton
        label="Adicionar Agente"
        onClick={() => router.push('/gestor/adicionar-agente')}
      />
    </div>
  );
}
