'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getAgentes } from '@/lib/api/agenteApi';
import { FiltrosAgente } from '@/lib/types/agente';
import {
  Loader2,
  Search,
  X,
  Users,
  CheckCircle,
  XCircle,
  Menu,
} from 'lucide-react';
import { Agente } from '@/lib/types/agente';
import AgenteCard from '@/components/gestor/cards/agentes-card';
import { Paginacao } from '@/components/paginacao/paginacao';

const ITENS_POR_PAGINA = 9;

type FiltroStatus = 'ativos' | 'inativos' | 'todos';

/**
 * @component AgentesPage
 * @version 1.0.0
 *
 * @description Página de listagem e gerenciamento de agentes para gestores.
 * Permite filtrar por status (ativos/inativos/todos), busca textual e paginação.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. CARREGAMENTO INICIAL:
 *    - Verifica autenticação (user?.id)
 *    - Busca agentes via getAgentes() com filtro de status
 *    - Estados: loading → erro → sucesso
 *
 * 2. FILTROS:
 *    - Status: Todos | Ativos | Inativos (botões com cores)
 *    - Busca textual: nome, email, matrícula, telefone
 *    - Botão "Limpar Filtros" quando ativos
 *    - Resumo dos filtros aplicados
 *    - Menu mobile com drawer de filtros
 *
 * 3. PAGINAÇÃO:
 *    - 9 itens por página (ITENS_POR_PAGINA)
 *    - Controles: primeira, anterior, próxima, última
 *    - Seletor de página dropdown
 *    - Indicador de itens visíveis
 *
 * 4. RESPONSIVIDADE:
 *    - Desktop: filtros em linha, números de página visíveis
 *    - Mobile: menu de filtros colapsável (drawer)
 *    - Paginação simplificada em mobile
 *
 * 5. ESTADOS DE UI:
 *    - Loading: spinner animado com ícone Users
 *    - Erro: card vermelho com botão de retry
 *    - Vazio (sem filtros): mensagem sem agentes
 *    - Vazio (com filtros): mensagem com opção "Ver todos"
 *    - Sucesso: grid de cards + paginação
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - FILTRO POR STATUS: useCallback + useEffect com dependência
 * - FILTRO TEXTUAL: useMemo para busca em memória
 * - PAGINAÇÃO: useMemo para slice otimizado
 * - MENU MOBILE: useState com drawer de filtros
 * - CORES: Verde (ativos), Vermelho (inativos), Azul (todos)
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES DOS BOTÕES:
 * ----------------------------------------------------------------------------
 *
 * | Status   | Cor Desktop (ativo) | Cor Mobile (ativo) |
 * |----------|---------------------|--------------------|
 * | Todos    | 🔵 Azul             | 🔵 Azul            |
 * | Ativos   | 🟢 Verde            | 🟢 Verde           |
 * | Inativos | 🔴 Vermelho         | 🔴 Vermelho        |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - AgenteCard: Card individual de agente
 * - getAgentes: API de busca com filtro por ativo
 * - useAuth: Hook de autenticação
 *
 * @example
 * ```tsx
 * // Uso em rota de gestor
 * <AgentesPage />
 * ```
 *
 * @see /src/components/gestor/cards/agentes-card.tsx - Card de agente
 * @see /src/lib/api/agenteApi.ts - API de agentes
 */

export default function AgentesPage() {
  // ==================== ESTADOS ====================
  const { user } = useAuth();
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [isLoadingAgentes, setIsLoadingAgentes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ==================== BUSCA DE DADOS ====================
  /**
   * @function fetchAgentes
   * @description Busca agentes com base no filtro de status
   * @param status - 'todos', 'ativos' ou 'inativos'
   */
  const fetchAgentes = useCallback(
    async (status: FiltroStatus) => {
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

        const result = await getAgentes(filtros);
        if (result.error) {
          setError(result.message || 'Erro ao buscar agentes');
        } else {
          setAgentes(result.agentes || []);
        }
      } catch {
        setError(
          'Erro ao buscar os agentes cadastrados. Tente novamente mais tarde.',
        );
      } finally {
        setIsLoadingAgentes(false);
      }
    },
    [user?.id],
  );

  // Carrega dados quando filtro de status muda
  useEffect(() => {
    fetchAgentes(filtroStatus);
  }, [fetchAgentes, filtroStatus]);

  // Reseta página quando filtros mudam
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, busca]);

  // ==================== HANDLERS DE FILTRO ====================
  const handleFiltroStatus = (status: FiltroStatus) => {
    setFiltroStatus(status);
    setMobileFiltersOpen(false);
  };

  const mostrarTodos = () => {
    setFiltroStatus('todos');
    setBusca('');
    setPaginaAtual(1);
    setMobileFiltersOpen(false);
  };

  const limparBusca = () => {
    setBusca('');
    setPaginaAtual(1);
  };

  // ==================== FILTRAGEM E PAGINAÇÃO ====================
  const agentesFiltrados = useMemo(() => {
    if (!busca.trim()) return agentes;
    const termoBusca = busca.toLowerCase().trim();
    return agentes.filter(
      (agente) =>
        agente.usuario.nome.toLowerCase().includes(termoBusca) ||
        agente.usuario.email.toLowerCase().includes(termoBusca) ||
        agente.matricula.toLowerCase().includes(termoBusca) ||
        (agente.usuario.telefone &&
          agente.usuario.telefone.includes(termoBusca)),
    );
  }, [agentes, busca]);

  const totalPaginas = Math.ceil(agentesFiltrados.length / ITENS_POR_PAGINA);

  const agentesPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return agentesFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [agentesFiltrados, paginaAtual]);

  // ==================== FUNÇÕES DE NAVEGAÇÃO ====================
  const handlePageChange = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  // ==================== RENDERIZAÇÃO CONDICIONAL ====================

  // ESTADO 1: LOADING INICIAL
  if (isLoadingAgentes && !agentes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="relative mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600 animate-spin" />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-white rounded-full border-4 border-gray-50 flex items-center justify-center">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-blue-600" />
              </div>
            </div>
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">
            Carregando agentes
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Buscando informações dos agentes...
          </p>
        </div>
      </div>
    );
  }

  // ESTADO 2: ERRO
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
              onClick={() => fetchAgentes(filtroStatus)}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO 3: SUCESSO - RENDERIZAÇÃO PRINCIPAL
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* HEADER */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Agentes Cadastrados
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Gerencie e visualize todos os agentes do sistema
              </p>
            </div>

            {/* Botão mobile para abrir filtros */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              <Menu className="h-4 w-4" />
              Filtros
              {(busca || filtroStatus !== 'todos') && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>
          </div>

          {/* BARRA DE FILTROS (Desktop e Mobile) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Desktop filters */}
            <div className="hidden lg:block p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Campo de busca */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={busca}
                      onChange={(e) => {
                        setBusca(e.target.value);
                        setPaginaAtual(1);
                      }}
                      placeholder="Buscar por nome, email, matrícula ou telefone..."
                      className="w-full pl-9 sm:pl-10 md:pl-12 pr-9 sm:pr-10 md:pr-12 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm"
                    />
                    {busca && (
                      <button
                        onClick={limparBusca}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg p-1 transition-colors"
                        title="Limpar busca"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Controles de filtro */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => handleFiltroStatus('todos')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm ${
                        filtroStatus === 'todos'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Todos</span>
                      <span className="sm:hidden">Tds</span>
                    </button>

                    <button
                      onClick={() => handleFiltroStatus('ativos')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm ${
                        filtroStatus === 'ativos'
                          ? 'bg-green-50 shadow-sm text-green-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Ativos</span>
                      <span className="sm:hidden">Atv</span>
                      {filtroStatus === 'ativos' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 hidden sm:inline-block"></span>
                      )}
                    </button>

                    <button
                      onClick={() => handleFiltroStatus('inativos')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm ${
                        filtroStatus === 'inativos'
                          ? 'bg-red-50 shadow-sm text-red-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Inativos</span>
                      <span className="sm:hidden">Inv</span>
                      {filtroStatus === 'inativos' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 hidden sm:inline-block"></span>
                      )}
                    </button>
                  </div>

                  {(busca || filtroStatus !== 'todos') && (
                    <button
                      onClick={mostrarTodos}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Limpar Filtros</span>
                      <span className="sm:hidden">Limpar</span>
                    </button>
                  )}

                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {agentes.length} agentes
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumo dos filtros aplicados */}
              {(busca || filtroStatus !== 'todos') && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {busca ? (
                      <>
                        Resultados para{' '}
                        <span className="font-medium text-blue-600 break-all">
                          {busca}
                        </span>
                        {filtroStatus !== 'todos' && (
                          <>
                            {' '}
                            |{' '}
                            <span className="font-medium">
                              {filtroStatus === 'ativos'
                                ? 'Apenas ativos'
                                : 'Apenas inativos'}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Mostrando{' '}
                        <span className="font-medium text-blue-600">
                          {filtroStatus === 'ativos'
                            ? 'apenas agentes ativos'
                            : filtroStatus === 'inativos'
                              ? 'apenas agentes inativos'
                              : 'todos os agentes'}
                        </span>
                      </>
                    )}
                  </div>
                  {agentesFiltrados.length === 0 ? (
                    <button
                      onClick={mostrarTodos}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      Ver todos os agentes
                    </button>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-500">
                      Mostrando {agentesFiltrados.length} de {agentes.length}{' '}
                      agentes
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile filters drawer */}
            {mobileFiltersOpen && (
              <div className="lg:hidden border-t border-gray-200 p-4 space-y-4">
                {/* Campo de busca mobile */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value);
                      setPaginaAtual(1);
                    }}
                    placeholder="Buscar agentes..."
                    className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {busca && (
                    <button
                      onClick={limparBusca}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Botões de filtro mobile */}
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleFiltroStatus('todos')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'todos'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Todos
                    </button>
                    <button
                      onClick={() => handleFiltroStatus('ativos')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'ativos'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Ativos
                    </button>
                    <button
                      onClick={() => handleFiltroStatus('inativos')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'inativos'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Inativos
                    </button>
                  </div>

                  {(busca || filtroStatus !== 'todos') && (
                    <button
                      onClick={mostrarTodos}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <X className="h-4 w-4" />
                      Limpar todos os filtros
                    </button>
                  )}
                </div>

                {/* Contador mobile */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {agentes.length} agentes no total
                    </span>
                  </div>
                  {agentesFiltrados.length !== agentes.length && (
                    <span className="text-xs text-blue-600">
                      {agentesFiltrados.length} filtrados
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading overlay durante filtros */}
        {isLoadingAgentes && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 animate-spin" />
              <span className="text-xs sm:text-sm text-blue-700">
                Aplicando filtros...
              </span>
            </div>
          </div>
        )}

        {/* LISTA DE AGENTES */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {agentesFiltrados.length === 0 ? (
            // Estado vazio
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 md:p-12 text-center">
              {busca || filtroStatus !== 'todos' ? (
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
              {/* Grid de cards responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {agentesPaginados.map((agente) => (
                  <div key={agente.usuario.id} className="h-full">
                    <AgenteCard agente={agente} />
                  </div>
                ))}
              </div>

              {/* Paginação responsiva */}
              <Paginacao
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                totalItens={agentesFiltrados.length}
                itensPorPagina={ITENS_POR_PAGINA}
                itemLabel="agente"
                itemLabelPlural="agentes"
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
