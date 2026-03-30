'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getMotoristas } from '@/lib/api/motoristaApi';
import { FiltrosMotorista } from '@/lib/types/motorista';
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
  Menu,
} from 'lucide-react';
import { Motorista } from '@/lib/types/motorista';
import MotoristaCard from '@/components/gestor/cards/motoristas-card';

const ITENS_POR_PAGINA = 9;

type FiltroStatus = 'ativos' | 'inativos' | 'todos';

/**
 * @component MotoristasPage
 * @version 2.0.0
 *
 * @description Página de listagem e gerenciamento de motoristas para gestores.
 *
 * ----------------------------------------------------------------------------
 * 📋 ALTERAÇÕES V2.0.0:
 * ----------------------------------------------------------------------------
 *
 * 1. FILTRO DE STATUS MELHORADO:
 *    - Estado inicial padrão: mostrar apenas motoristas ATIVOS
 *    - Botões separados para filtros: Todos / Ativos / Inativos
 *    - UI mais clara para indicar o filtro atual
 *    - Paginação mantém estado durante mudanças de filtro
 *
 * 2. RESPONSIVIDADE APRIMORADA:
 *    - Layout adaptativo para todos os dispositivos
 *    - Drawer de filtros em mobile
 *    - Grid responsivo: 1 (mobile) / 2 (tablet) / 3 (desktop) colunas
 *    - Paginação adaptativa
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. CARREGAMENTO INICIAL:
 *    - Verifica autenticação (user?.id)
 *    - Busca APENAS motoristas ATIVOS (filtro padrão)
 *    - Estados: loading → erro → sucesso
 *
 * 2. FILTROS:
 *    - Busca textual (nome, email, telefone, CNH)
 *    - Filtro por status com botões separados:
 *      * "Todos" - mostra todos os motoristas
 *      * "Ativos" - mostra apenas motoristas ativos (PADRÃO)
 *      * "Inativos" - mostra apenas motoristas inativos
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
 *    - Vazio (sem filtros): mensagem sem motoristas
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
 * - Campos de busca expandidos: inclui CNH além de nome/email/telefone
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - MotoristaCard: Card individual de motorista
 * - getMotoristas: API de busca com filtros
 * - useAuth: Hook de autenticação
 *
 * @example
 * <MotoristasPage />
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

  // ALTERAÇÃO: Estado inicial como 'ativos' (filtro padrão)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // --------------------------------------------------------------------------
  // BUSCA DE DADOS
  // --------------------------------------------------------------------------

  const fetchMotoristas = useCallback(
    async (status: FiltroStatus) => {
      if (!user?.id) return;

      setIsLoadingMotoristas(true);
      setError(null);

      try {
        const filtros: FiltrosMotorista = {};

        // Aplica o filtro de status baseado na seleção
        if (status === 'ativos') {
          filtros.ativo = true;
        } else if (status === 'inativos') {
          filtros.ativo = false;
        }
        // Se for 'todos', não aplica filtro de status

        const result = await getMotoristas(filtros);
        if (result.error) {
          setError(result.message || 'Erro ao carregar os motoristas');
        } else {
          setMotoristas(result.motoristas || []);
        }
      } catch {
        setError(
          'Erro ao buscar os motoristas cadastrados. Tente novamente mais tarde.',
        );
      } finally {
        setIsLoadingMotoristas(false);
      }
    },
    [user?.id],
  );

  // Carrega dados iniciais (com filtro padrão: ativos)
  useEffect(() => {
    fetchMotoristas(filtroStatus);
  }, [fetchMotoristas, filtroStatus]);

  // ALTERAÇÃO: Reseta página quando muda o filtro de status ou busca
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, busca]);

  // --------------------------------------------------------------------------
  // FILTROS
  // --------------------------------------------------------------------------

  // ALTERAÇÃO: Função para alterar o filtro de status
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

  // Função para limpar apenas a busca textual
  const limparBusca = () => {
    setBusca('');
    setPaginaAtual(1);
  };

  const motoristasFiltrados = useMemo(() => {
    if (!busca.trim()) return motoristas;

    const termoBusca = busca.toLowerCase().trim();
    return motoristas.filter(
      (motorista) =>
        motorista.usuario.nome.toLowerCase().includes(termoBusca) ||
        motorista.usuario.email.toLowerCase().includes(termoBusca) ||
        (motorista.usuario.telefone &&
          motorista.usuario.telefone.includes(termoBusca)) ||
        (motorista.numeroCnh &&
          motorista.numeroCnh.toLowerCase().includes(termoBusca)),
    );
  }, [motoristas, busca]);

  // --------------------------------------------------------------------------
  // PAGINAÇÃO
  // --------------------------------------------------------------------------

  const totalPaginas = Math.ceil(motoristasFiltrados.length / ITENS_POR_PAGINA);

  const motoristasPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return motoristasFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [motoristasFiltrados, paginaAtual]);

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

  if (isLoadingMotoristas && !motoristas.length) {
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
            Carregando motoristas
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Buscando informações dos motoristas...
          </p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* HEADER */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Motoristas Cadastrados
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Gerencie e visualize todos os motoristas do sistema
              </p>
            </div>
            {/* Mobile filter button */}
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

          {/* BARRA DE FILTROS - ALTERADA */}
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
                      placeholder="Buscar por nome, email, telefone ou CNH..."
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

                {/* Controles de filtro - ALTERADOS */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Botões de filtro de status */}
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

                  {/* Botão limpar filtros */}
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

                  {/* Contador de motoristas */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {motoristas.length} motoristas
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumo dos filtros aplicados - ALTERADO */}
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
                            ? 'apenas motoristas ativos'
                            : filtroStatus === 'inativos'
                              ? 'apenas motoristas inativos'
                              : 'todos os motoristas'}
                        </span>
                      </>
                    )}
                  </div>
                  {motoristasFiltrados.length === 0 ? (
                    <button
                      onClick={mostrarTodos}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      Ver todos os motoristas
                    </button>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-500">
                      Mostrando {motoristasFiltrados.length} de{' '}
                      {motoristas.length} motoristas
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
                    placeholder="Buscar motoristas..."
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
                      {motoristas.length} motoristas no total
                    </span>
                  </div>
                  {motoristasFiltrados.length !== motoristas.length && (
                    <span className="text-xs text-blue-600">
                      {motoristasFiltrados.length} filtrados
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading overlay durante filtros */}
        {isLoadingMotoristas && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 animate-spin" />
              <span className="text-xs sm:text-sm text-blue-700">
                Aplicando filtros...
              </span>
            </div>
          </div>
        )}

        {/* LISTA DE MOTORISTAS */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {motoristasFiltrados.length === 0 ? (
            // Estado vazio (com ou sem filtros)
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
                          filtroStatus === 'ativos' ? 'ativos' : 'inativos'
                        }.`}
                  </p>
                  <button
                    onClick={mostrarTodos}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
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
            <>
              {/* Grid de cards responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {motoristasPaginados.map((motorista) => (
                  <div key={motorista.usuario.id} className="h-full">
                    <MotoristaCard motorista={motorista} />
                  </div>
                ))}
              </div>

              {/* Paginação responsiva */}
              {totalPaginas > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4">
                  {/* Informação de itens visíveis */}
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Mostrando{' '}
                    <span className="font-medium text-blue-600">
                      {Math.min(
                        (paginaAtual - 1) * ITENS_POR_PAGINA + 1,
                        motoristasFiltrados.length,
                      )}{' '}
                      -{' '}
                      {Math.min(
                        paginaAtual * ITENS_POR_PAGINA,
                        motoristasFiltrados.length,
                      )}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">
                      {motoristasFiltrados.length}
                    </span>{' '}
                    motorista(s)
                  </div>

                  {/* Controles de página */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    <button
                      onClick={irParaPrimeiraPagina}
                      disabled={paginaAtual === 1}
                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Primeira</span>
                    </button>
                    <button
                      onClick={irParaPaginaAnterior}
                      disabled={paginaAtual === 1}
                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    {/* Números das páginas (escondido em mobile) */}
                    <div className="hidden sm:flex items-center gap-1">
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
                              className={`min-w-7 h-7 sm:min-w-8 sm:h-8 flex items-center justify-center px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
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
                    <span className="text-xs sm:text-sm text-gray-700 px-1 sm:px-2">
                      Página{' '}
                      <select
                        value={paginaAtual}
                        onChange={(e) => irParaPagina(Number(e.target.value))}
                        className="ml-1 px-1.5 sm:px-2 py-1 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
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
                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={irParaUltimaPagina}
                      disabled={paginaAtual === totalPaginas}
                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Última</span>
                      <ChevronsRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
