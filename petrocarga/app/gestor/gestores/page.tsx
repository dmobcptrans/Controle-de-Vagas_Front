'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getGestores } from '@/lib/api/gestorApi';
import { FiltrosGestor } from '@/lib/types/gestor';
import {
  Loader2,
  Search,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Gestor } from '@/lib/types/gestor';
import GestorCard from '@/components/gestor/cards/gestores-card';

const ITENS_POR_PAGINA = 9;

type FiltroStatus = 'ativos' | 'inativos' | 'todos';

/**
 * @component GestoresPage
 * @version 2.0.0
 *
 * @description Página de listagem e gerenciamento de gestores para administradores.
 *
 * ----------------------------------------------------------------------------
 * 📋 ALTERAÇÕES V2.0.0:
 * ----------------------------------------------------------------------------
 *
 * 1. FILTRO DE STATUS MELHORADO:
 *    - Estado inicial padrão: mostrar apenas gestores ATIVOS
 *    - Botões separados para filtros: Todos / Ativos / Inativos
 *    - UI mais clara para indicar o filtro atual
 *    - Paginação mantém estado durante mudanças de filtro
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. CARREGAMENTO INICIAL:
 *    - Verifica autenticação (user?.id)
 *    - Busca APENAS gestores ATIVOS (filtro padrão)
 *    - Estados: loading → erro → sucesso
 *
 * 2. FILTROS:
 *    - Busca textual (nome, email, telefone)
 *    - Filtro por status com botões separados:
 *      * "Todos" - mostra todos os gestores
 *      * "Ativos" - mostra apenas gestores ativos (PADRÃO)
 *      * "Inativos" - mostra apenas gestores inativos
 *    - Botão "Limpar Filtros" quando ativos
 *    - Resumo dos filtros aplicados
 *
 * 3. PAGINAÇÃO:
 *    - 9 itens por página (ITENS_POR_PAGINA)
 *    - Controles: primeira, anterior, próxima, última
 *    - Seletor de página dropdown
 *    - Indicador de itens visíveis
 *    - Números de página com reticências para muitas páginas
 *
 * 4. ESTADOS DE UI:
 *    - Loading inicial: spinner com animação
 *    - Loading de filtros: overlay sutil
 *    - Erro: card vermelho com botão de retry
 *    - Vazio (sem filtros): mensagem sem gestores
 *    - Vazio (com filtros): mensagem com opção "Ver todos"
 *    - Sucesso: grid de cards + paginação
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - useCallback + useEffect: Padrão para busca de dados com user?.id
 * - useMemo: Filtragem e paginação otimizadas
 * - Filtro por status com botões separados para melhor UX
 * - Paginação mantém estado durante recarregamentos
 * - Grid responsivo: 1 (mobile) / 2 (tablet) / 3 (desktop) colunas
 * - Diferenciação de tipos: Gestor (diferente de Agente/Motorista)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - GestorCard: Card individual de gestor
 * - getGestores: API de busca com filtros
 * - useAuth: Hook de autenticação
 *
 * @example
 * <GestoresPage />
 */

export default function GestoresPage() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [isLoadingGestores, setIsLoadingGestores] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  // ALTERAÇÃO: Estado inicial como 'ativos' (filtro padrão)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos');

  // --------------------------------------------------------------------------
  // BUSCA DE DADOS
  // --------------------------------------------------------------------------

  const fetchGestores = useCallback(
    async (status: FiltroStatus) => {
      if (!user?.id) return;

      setIsLoadingGestores(true);
      setError(null);

      try {
        const filtros: FiltrosGestor = {};

        // Aplica o filtro de status baseado na seleção
        if (status === 'ativos') {
          filtros.ativo = true;
        } else if (status === 'inativos') {
          filtros.ativo = false;
        }
        // Se for 'todos', não aplica filtro de status

        const result = await getGestores(filtros);
        if (result.error) {
          setError(result.message || 'Erro ao carregar gestores');
        } else {
          setGestores(result.gestores || []);
        }
      } catch {
        setError(
          'Erro ao buscar os gestores cadastrados. Tente novamente mais tarde.',
        );
      } finally {
        setIsLoadingGestores(false);
      }
    },
    [user?.id],
  );

  // Carrega dados iniciais (com filtro padrão: ativos)
  useEffect(() => {
    fetchGestores(filtroStatus);
  }, [fetchGestores, filtroStatus]);

  // ALTERAÇÃO: Reseta página quando muda o filtro de status
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus]);

  // --------------------------------------------------------------------------
  // FILTROS
  // --------------------------------------------------------------------------

  // ALTERAÇÃO: Função para alterar o filtro de status
  const handleFiltroStatus = (status: FiltroStatus) => {
    setFiltroStatus(status);
  };

  const mostrarTodos = () => {
    setFiltroStatus('todos');
    setBusca('');
    setPaginaAtual(1);
  };

  // Função para limpar apenas a busca textual
  const limparBusca = () => {
    setBusca('');
    setPaginaAtual(1);
  };

  const gestoresFiltrados = useMemo(() => {
    if (!busca.trim()) return gestores;

    const termoBusca = busca.toLowerCase().trim();
    return gestores.filter(
      (gestor) =>
        gestor.nome.toLowerCase().includes(termoBusca) ||
        gestor.email.toLowerCase().includes(termoBusca) ||
        (gestor.telefone && gestor.telefone.includes(termoBusca)),
    );
  }, [gestores, busca]);

  // --------------------------------------------------------------------------
  // PAGINAÇÃO
  // --------------------------------------------------------------------------

  const totalPaginas = Math.ceil(gestoresFiltrados.length / ITENS_POR_PAGINA);

  const gestoresPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return gestoresFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [gestoresFiltrados, paginaAtual]);

  const irParaPagina = (pagina: number) => {
    setPaginaAtual(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  const irParaPrimeiraPagina = () => irParaPagina(1);
  const irParaUltimaPagina = () => irParaPagina(totalPaginas);
  const irParaPaginaAnterior = () => irParaPagina(paginaAtual - 1);
  const irParaProximaPagina = () => irParaPagina(paginaAtual + 1);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (isLoadingGestores && !gestores.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="relative mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin" />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full border-4 border-gray-50 flex items-center justify-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Carregando gestores
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Buscando informações dos gestores...
          </p>
        </div>
      </div>
    );
  }

  if (error && !gestores.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
              Erro ao carregar gestores
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => fetchGestores(filtroStatus)}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Gestores Cadastrados
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Gerencie e visualize todos os gestores do sistema
              </p>
            </div>
          </div>

          {/* BARRA DE FILTROS - ALTERADA */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Campo de busca */}
              <div className="flex-1">
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
                    placeholder="Buscar por nome, email ou telefone..."
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm sm:text-base"
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

              {/* Controles de filtro - ALTERADOS */}
              <div className="flex items-center gap-3">
                {/* Botões de filtro de status */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => handleFiltroStatus('todos')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                      filtroStatus === 'todos'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Todos</span>
                  </button>

                  <button
                    onClick={() => handleFiltroStatus('ativos')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                      filtroStatus === 'ativos'
                        ? 'bg-green-50 shadow-sm text-green-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Ativos</span>
                    {filtroStatus === 'ativos' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    )}
                  </button>

                  <button
                    onClick={() => handleFiltroStatus('inativos')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                      filtroStatus === 'inativos'
                        ? 'bg-red-50 shadow-sm text-red-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Inativos</span>
                    {filtroStatus === 'inativos' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    )}
                  </button>
                </div>

                {/* Botão limpar filtros */}
                {(busca || filtroStatus !== 'todos') && (
                  <button
                    onClick={mostrarTodos}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    Limpar Filtros
                  </button>
                )}

                {/* Contador de gestores */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {gestores.length} gestores
                  </span>
                </div>
              </div>
            </div>

            {/* Resumo dos filtros aplicados - ALTERADO */}
            {(busca || filtroStatus !== 'todos') && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-sm text-gray-600">
                  {busca ? (
                    <>
                      Resultados para{' '}
                      <span className="font-medium text-blue-600">{busca}</span>
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
                          ? 'apenas gestores ativos'
                          : filtroStatus === 'inativos'
                            ? 'apenas gestores inativos'
                            : 'todos os gestores'}
                      </span>
                    </>
                  )}
                </div>
                {gestoresFiltrados.length === 0 ? (
                  <button
                    onClick={mostrarTodos}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Ver todos os gestores
                  </button>
                ) : (
                  <div className="text-sm text-gray-500">
                    Mostrando {gestoresFiltrados.length} de {gestores.length}{' '}
                    gestores
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading overlay durante filtros */}
        {isLoadingGestores && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">
                Aplicando filtros...
              </span>
            </div>
          </div>
        )}

        {/* LISTA DE GESTORES */}
        <div className="space-y-4 sm:space-y-6">
          {gestoresFiltrados.length === 0 ? (
            // Estado vazio (com ou sem filtros)
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
              {busca || filtroStatus !== 'todos' ? (
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum gestor encontrado
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    {busca
                      ? `Não encontramos gestores para "${busca}".`
                      : `Não encontramos gestores ${
                          filtroStatus === 'ativos' ? 'ativos' : 'inativos'
                        }.`}
                  </p>
                  <button
                    onClick={mostrarTodos}
                    className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    Ver todos os gestores
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum gestor cadastrado
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Não há gestores cadastrados no sistema no momento.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Grid de cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {gestoresPaginados.map((gestor) => (
                  <div key={gestor.id} className="h-full">
                    <GestorCard gestor={gestor} />
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  {/* Informação de itens visíveis */}
                  <div className="text-sm text-gray-600">
                    Mostrando{' '}
                    <span className="font-medium text-blue-600">
                      {Math.min(
                        (paginaAtual - 1) * ITENS_POR_PAGINA + 1,
                        gestoresFiltrados.length,
                      )}{' '}
                      -{' '}
                      {Math.min(
                        paginaAtual * ITENS_POR_PAGINA,
                        gestoresFiltrados.length,
                      )}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">
                      {gestoresFiltrados.length}
                    </span>{' '}
                    gestor(es)
                    {busca && ' encontrados'}
                    {filtroStatus !== 'todos' && !busca && (
                      <>
                        {' '}
                        ({filtroStatus === 'ativos' ? 'ativos' : 'inativos'})
                      </>
                    )}
                  </div>

                  {/* Controles de página */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={irParaPrimeiraPagina}
                      disabled={paginaAtual === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Primeira</span>
                    </button>
                    <button
                      onClick={irParaPaginaAnterior}
                      disabled={paginaAtual === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    {/* Números das páginas (com reticências) */}
                    <div className="flex items-center gap-1">
                      {[...Array(totalPaginas)].map((_, i) => {
                        const paginaNumero = i + 1;
                        if (
                          paginaNumero === 1 ||
                          paginaNumero === totalPaginas ||
                          (paginaNumero >= paginaAtual - 1 &&
                            paginaNumero <= paginaAtual + 1)
                        ) {
                          return (
                            <button
                              key={paginaNumero}
                              onClick={() => irParaPagina(paginaNumero)}
                              className={`min-w-8 h-8 flex items-center justify-center px-2 rounded-lg text-sm font-medium transition-colors ${
                                paginaAtual === paginaNumero
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {paginaNumero}
                            </button>
                          );
                        } else if (
                          paginaNumero === paginaAtual - 2 ||
                          paginaNumero === paginaAtual + 2
                        ) {
                          return (
                            <span
                              key={paginaNumero}
                              className="px-1 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Seletor de página dropdown */}
                    <span className="text-sm text-gray-700 px-2">
                      Página{' '}
                      <select
                        value={paginaAtual}
                        onChange={(e) => irParaPagina(Number(e.target.value))}
                        className="ml-1 px-2 py-1 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[...Array(totalPaginas)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>{' '}
                      de {totalPaginas}
                    </span>

                    <button
                      onClick={irParaProximaPagina}
                      disabled={paginaAtual === totalPaginas}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={irParaUltimaPagina}
                      disabled={paginaAtual === totalPaginas}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Última</span>
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
