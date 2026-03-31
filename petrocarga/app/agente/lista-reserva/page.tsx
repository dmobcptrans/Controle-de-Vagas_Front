'use client';

import ReservaRapidaCard from '@/components/agente/cards/reservaRapida-card';
import { useAuth } from '@/components/hooks/useAuth';
import { getReservasRapidas } from '@/lib/api/reservaApi';
import { ReservaRapida } from '@/lib/types/reservaRapida';
import {
  AlertCircle,
  ClipboardList,
  Loader2,
  Search,
  X,
  CheckCircle2,
  Menu,
  CalendarClock,
  CalendarCheck,
  Ban,
  Trash2,
  Clock,
} from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { Paginacao } from '@/components/paginacao/paginacao';

const ITENS_POR_PAGINA = 12;

type FiltroStatusReserva =
  | 'todas'
  | 'ativas'
  | 'reservada'
  | 'ativa'
  | 'concluida'
  | 'cancelada'
  | 'removida';

/**
 * @component ReservaRapidaPage
 * @version 4.0.0
 *
 * @description Página de listagem de reservas rápidas criadas pelo agente.
 * Gerencia busca, loading, erro, filtros por todos os status, paginação e exibição em grid responsivo.
 *
 * ----------------------------------------------------------------------------
 * 📋 ALTERAÇÕES V4.0.0:
 * ----------------------------------------------------------------------------
 *
 * 1. FILTROS POR TODOS OS STATUS:
 *    - Todas: mostra todas as reservas
 *    - Ativas (padrão): mostra reservas com status 'RESERVADA' ou 'ATIVA'
 *    - Reservada: mostra apenas status 'RESERVADA'
 *    - Ativa: mostra apenas status 'ATIVA'
 *    - Concluída: mostra apenas status 'CONCLUIDA'
 *    - Cancelada: mostra apenas status 'CANCELADA'
 *    - Removida: mostra apenas status 'REMOVIDA'
 *
 * 2. UI OTIMIZADA:
 *    - Layout responsivo com scroll horizontal em desktop para muitos botões
 *    - Dropdown no mobile para economizar espaço
 *    - Cores distintas para cada status
 *    - Ícones específicos para cada status
 *
 * ----------------------------------------------------------------------------
 * 📊 STATUS DE RESERVAS:
 * ----------------------------------------------------------------------------
 *
 * | Status      | Ícone          | Cor        | Descrição                          |
 * |-------------|----------------|------------|------------------------------------|
 * | RESERVADA   | Clock          | Amarelo    | Reserva agendada, ainda não ativa  |
 * | ATIVA       | CheckCircle2   | Verde      | Reserva em andamento               |
 * | CONCLUIDA   | CalendarCheck  | Roxo       | Reserva finalizada                 |
 * | CANCELADA   | Ban            | Vermelho   | Reserva cancelada pelo agente      |
 * | REMOVIDA    | Trash2         | Cinza      | Reserva removida pelo sistema      |
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES DOS BOTÕES:
 * ----------------------------------------------------------------------------
 *
 * | Status      | Desktop (ativo)      | Mobile (ativo)       |
 * |-------------|----------------------|----------------------|
 * | Todas       | 🔵 Azul              | 🔵 Azul              |
 * | Ativas      | 🟢 Verde             | 🟢 Verde             |
 * | Reservada   | 🟡 Amarelo           | 🟡 Amarelo           |
 * | Ativa       | 🟢 Verde escuro      | 🟢 Verde escuro      |
 * | Concluída   | 🟣 Roxo              | 🟣 Roxo              |
 * | Cancelada   | 🔴 Vermelho          | 🔴 Vermelho          |
 * | Removida    | ⚫ Cinza             | ⚫ Cinza             |
 *
 * @example
 * <ReservaRapidaPage />
 */

export default function ReservaRapidaPage() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();

  const [reservas, setReservas] = useState<ReservaRapida[]>([]);
  const [isLoadingReservas, setIsLoadingReservas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatusReserva>('ativas'); // Padrão: mostrar ativas (RESERVADA + ATIVA)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // --------------------------------------------------------------------------
  // BUSCA DE DADOS
  // --------------------------------------------------------------------------

  const fetchReservas = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingReservas(false);
      return;
    }

    setIsLoadingReservas(true);
    setError(null);

    try {
      const result = await getReservasRapidas(user.id);
      setReservas(result);
    } catch {
      setError('Erro ao buscar as reservas. Tente novamente mais tarde.');
    } finally {
      setIsLoadingReservas(false);
    }
  }, [user?.id]);

  // Carrega dados iniciais
  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  // Reseta página quando filtros mudam
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, busca]);

  // --------------------------------------------------------------------------
  // HANDLERS DE FILTRO
  // --------------------------------------------------------------------------

  const handleFiltroStatus = (status: FiltroStatusReserva) => {
    setFiltroStatus(status);
    setMobileFiltersOpen(false);
  };

  const mostrarTodas = () => {
    setFiltroStatus('todas');
    setBusca('');
    setPaginaAtual(1);
    setMobileFiltersOpen(false);
  };

  const limparBusca = () => {
    setBusca('');
    setPaginaAtual(1);
  };

  // --------------------------------------------------------------------------
  // FILTRAGEM E PAGINAÇÃO
  // --------------------------------------------------------------------------

  /**
   * Filtra reservas por status e busca textual
   */
  const reservasFiltradas = useMemo(() => {
    let filtradas = [...reservas];

    // Filtro por status
    switch (filtroStatus) {
      case 'ativas':
        // Reservas ativas: status 'RESERVADA' ou 'ATIVA'
        filtradas = filtradas.filter(
          (reserva) =>
            reserva.status === 'RESERVADA' || reserva.status === 'ATIVA',
        );
        break;
      case 'reservada':
        filtradas = filtradas.filter(
          (reserva) => reserva.status === 'RESERVADA',
        );
        break;
      case 'ativa':
        filtradas = filtradas.filter((reserva) => reserva.status === 'ATIVA');
        break;
      case 'concluida':
        filtradas = filtradas.filter(
          (reserva) => reserva.status === 'CONCLUIDA',
        );
        break;
      case 'cancelada':
        filtradas = filtradas.filter(
          (reserva) => reserva.status === 'CANCELADA',
        );
        break;
      case 'removida':
        filtradas = filtradas.filter(
          (reserva) => reserva.status === 'REMOVIDA',
        );
        break;
      case 'todas':
      default:
        // Mostra todas as reservas, incluindo canceladas e removidas
        break;
    }

    // Filtro por busca textual
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase().trim();
      filtradas = filtradas.filter(
        (reserva) =>
          reserva.placa?.toLowerCase().includes(termoBusca) ||
          reserva.logradouro?.toLowerCase().includes(termoBusca) ||
          reserva.bairro?.toLowerCase().includes(termoBusca) ||
          reserva.tipoVeiculo?.toLowerCase().includes(termoBusca),
      );
    }

    return filtradas;
  }, [reservas, filtroStatus, busca]);

  const totalPaginas = Math.ceil(reservasFiltradas.length / ITENS_POR_PAGINA);

  const reservasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return reservasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [reservasFiltradas, paginaAtual]);

  const handlePageChange = (pagina: number) => {
    setPaginaAtual(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // FUNÇÕES AUXILIARES PARA ESTATÍSTICAS
  // --------------------------------------------------------------------------

  const contarPorStatus = (status: string) => {
    return reservas.filter((reserva) => reserva.status === status).length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESERVADA':
        return <Clock className="h-3.5 w-3.5" />;
      case 'ATIVA':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'CONCLUIDA':
        return <CalendarCheck className="h-3.5 w-3.5" />;
      case 'CANCELADA':
        return <Ban className="h-3.5 w-3.5" />;
      case 'REMOVIDA':
        return <Trash2 className="h-3.5 w-3.5" />;
      default:
        return <CalendarClock className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'text-gray-600 hover:text-gray-900';

    switch (status) {
      case 'RESERVADA':
        return 'bg-yellow-50 shadow-sm text-yellow-700';
      case 'ATIVA':
        return 'bg-green-50 shadow-sm text-green-700';
      case 'CONCLUIDA':
        return 'bg-purple-50 shadow-sm text-purple-700';
      case 'CANCELADA':
        return 'bg-red-50 shadow-sm text-red-700';
      case 'REMOVIDA':
        return 'bg-gray-50 shadow-sm text-gray-700';
      default:
        return 'bg-white shadow-sm text-gray-900';
    }
  };

  const getMobileStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-700';

    switch (status) {
      case 'RESERVADA':
        return 'bg-yellow-600 text-white';
      case 'ATIVA':
        return 'bg-green-600 text-white';
      case 'CONCLUIDA':
        return 'bg-purple-600 text-white';
      case 'CANCELADA':
        return 'bg-red-600 text-white';
      case 'REMOVIDA':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  // ESTADO 1: LOADING INICIAL
  if (isLoadingReservas && !reservas.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="relative mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600 animate-spin" />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-white rounded-full border-4 border-gray-50 flex items-center justify-center">
                <CalendarClock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-blue-600" />
              </div>
            </div>
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">
            Carregando reservas
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Buscando informações das reservas rápidas...
          </p>
        </div>
      </div>
    );
  }

  // ESTADO 2: ERRO
  if (error && !reservas.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3">
              Erro ao carregar reservas
            </h2>
            <p className="text-gray-600 mb-6 text-xs sm:text-sm md:text-base">
              {error}
            </p>
            <button
              onClick={fetchReservas}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* HEADER */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Reservas Rápidas
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Gerencie e visualize todas as suas reservas rápidas
              </p>
            </div>

            {/* Botão mobile para abrir filtros */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              <Menu className="h-4 w-4" />
              Filtros
              {(busca || filtroStatus !== 'todas') && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>
          </div>

          {/* BARRA DE FILTROS */}
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
                      placeholder="Buscar por placa, logradouro ou bairro..."
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

                {/* Controles de filtro - Todos os status */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto max-w-full">
                    <button
                      onClick={() => handleFiltroStatus('todas')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm whitespace-nowrap ${
                        filtroStatus === 'todas'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <CalendarClock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Todas</span>
                      <span className="sm:hidden">Tds</span>
                    </button>

                    <button
                      onClick={() => handleFiltroStatus('ativas')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm whitespace-nowrap ${
                        filtroStatus === 'ativas'
                          ? 'bg-green-50 shadow-sm text-green-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Ativas</span>
                      <span className="sm:hidden">Atv</span>
                      {filtroStatus === 'ativas' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 hidden sm:inline-block"></span>
                      )}
                    </button>

                    <button
                      onClick={() => handleFiltroStatus('reservada')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm whitespace-nowrap ${
                        filtroStatus === 'reservada'
                          ? 'bg-yellow-50 shadow-sm text-yellow-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Reservada</span>
                      <span className="sm:hidden">Res</span>
                    </button>

                    <button
                      onClick={() => handleFiltroStatus('ativa')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm whitespace-nowrap ${
                        filtroStatus === 'ativa'
                          ? 'bg-green-100 shadow-sm text-green-800'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Ativa</span>
                      <span className="sm:hidden">Atv</span>
                    </button>

                    <button
                      onClick={() => handleFiltroStatus('concluida')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm whitespace-nowrap ${
                        filtroStatus === 'concluida'
                          ? 'bg-purple-50 shadow-sm text-purple-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <CalendarCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Concluída</span>
                      <span className="sm:hidden">Conc</span>
                    </button>

                    <button
                      onClick={() => handleFiltroStatus('cancelada')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm whitespace-nowrap ${
                        filtroStatus === 'cancelada'
                          ? 'bg-red-50 shadow-sm text-red-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Cancelada</span>
                      <span className="sm:hidden">Canc</span>
                    </button>

                    <button
                      onClick={() => handleFiltroStatus('removida')}
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md transition-all text-xs sm:text-sm whitespace-nowrap ${
                        filtroStatus === 'removida'
                          ? 'bg-gray-50 shadow-sm text-gray-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Removida</span>
                      <span className="sm:hidden">Rem</span>
                    </button>
                  </div>

                  {(busca || filtroStatus !== 'todas') && (
                    <button
                      onClick={mostrarTodas}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Limpar Filtros</span>
                      <span className="sm:hidden">Limpar</span>
                    </button>
                  )}

                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                    <CalendarClock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {reservas.length} reservas
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumo dos filtros aplicados e estatísticas rápidas */}
              {(busca || filtroStatus !== 'todas') && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {busca ? (
                      <>
                        Resultados para{' '}
                        <span className="font-medium text-blue-600 break-all">
                          {busca}
                        </span>
                        {filtroStatus !== 'todas' && (
                          <>
                            {' '}
                            |{' '}
                            <span className="font-medium">
                              {filtroStatus === 'ativas'
                                ? 'Reservas ativas (Reservada + Ativa)'
                                : filtroStatus === 'reservada'
                                  ? 'Apenas reservadas'
                                  : filtroStatus === 'ativa'
                                    ? 'Apenas ativas'
                                    : filtroStatus === 'concluida'
                                      ? 'Apenas concluídas'
                                      : filtroStatus === 'cancelada'
                                        ? 'Apenas canceladas'
                                        : 'Apenas removidas'}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Mostrando{' '}
                        <span className="font-medium text-blue-600">
                          {filtroStatus === 'ativas'
                            ? 'reservas ativas (Reservada + Ativa)'
                            : filtroStatus === 'reservada'
                              ? 'apenas reservas com status "Reservada"'
                              : filtroStatus === 'ativa'
                                ? 'apenas reservas com status "Ativa"'
                                : filtroStatus === 'concluida'
                                  ? 'apenas reservas concluídas'
                                  : filtroStatus === 'cancelada'
                                    ? 'apenas reservas canceladas'
                                    : filtroStatus === 'removida'
                                      ? 'apenas reservas removidas'
                                      : 'todas as reservas'}
                        </span>
                      </>
                    )}
                  </div>
                  {reservasFiltradas.length === 0 ? (
                    <button
                      onClick={mostrarTodas}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      Ver todas as reservas
                    </button>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-500">
                      Mostrando {reservasFiltradas.length} de {reservas.length}{' '}
                      reservas
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
                    placeholder="Buscar reservas..."
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

                {/* Botões de filtro mobile - Scroll vertical */}
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleFiltroStatus('todas')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'todas'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <CalendarClock className="h-4 w-4" />
                      Todas
                    </button>
                    <button
                      onClick={() => handleFiltroStatus('ativas')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'ativas'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Ativas
                    </button>
                    <button
                      onClick={() => handleFiltroStatus('reservada')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'reservada'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      Reservada
                    </button>
                    <button
                      onClick={() => handleFiltroStatus('ativa')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'ativa'
                          ? 'bg-green-700 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Ativa
                    </button>
                    <button
                      onClick={() => handleFiltroStatus('concluida')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'concluida'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <CalendarCheck className="h-4 w-4" />
                      Concluída
                    </button>
                    <button
                      onClick={() => handleFiltroStatus('cancelada')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'cancelada'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Ban className="h-4 w-4" />
                      Cancelada
                    </button>
                    <button
                      onClick={() => handleFiltroStatus('removida')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filtroStatus === 'removida'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Removida
                    </button>
                  </div>

                  {(busca || filtroStatus !== 'todas') && (
                    <button
                      onClick={mostrarTodas}
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
                    <CalendarClock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {reservas.length} reservas no total
                    </span>
                  </div>
                  {reservasFiltradas.length !== reservas.length && (
                    <span className="text-xs text-blue-600">
                      {reservasFiltradas.length} filtradas
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading overlay durante filtros */}
        {isLoadingReservas && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 animate-spin" />
              <span className="text-xs sm:text-sm text-blue-700">
                Aplicando filtros...
              </span>
            </div>
          </div>
        )}

        {/* LISTA DE RESERVAS */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {reservasFiltradas.length === 0 ? (
            // Estado vazio
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 md:p-12 text-center">
              {busca || filtroStatus !== 'todas' ? (
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Nenhuma reserva encontrada
                  </h3>
                  <p className="text-gray-600 mb-5 sm:mb-6 text-xs sm:text-sm md:text-base">
                    {busca
                      ? `Não encontramos reservas para "${busca}".`
                      : `Não encontramos reservas com o status selecionado.`}
                  </p>
                  <button
                    onClick={mostrarTodas}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    Ver todas as reservas
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Nenhuma reserva cadastrada
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                    Você ainda não criou nenhuma reserva rápida. Comece criando
                    sua primeira reserva.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Grid de cards responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {reservasPaginadas.map((reserva) => (
                  <div key={reserva.id} className="h-full">
                    <ReservaRapidaCard reserva={reserva} />
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="mt-6 md:mt-8">
                  <Paginacao
                    paginaAtual={paginaAtual}
                    totalPaginas={totalPaginas}
                    totalItens={reservasFiltradas.length}
                    itensPorPagina={ITENS_POR_PAGINA}
                    itemLabel="reserva"
                    itemLabelPlural="reservas"
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Rodapé com resumo estatístico detalhado */}
              <div className="mt-8 md:mt-12 p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                      Total de Reservas: {reservas.length}
                    </h3>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs md:text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />
                        <span>Reservada: {contarPorStatus('RESERVADA')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Ativa: {contarPorStatus('ATIVA')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        <CalendarCheck className="h-3 w-3" />
                        <span>Concluída: {contarPorStatus('CONCLUIDA')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                        <Ban className="h-3 w-3" />
                        <span>Cancelada: {contarPorStatus('CANCELADA')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        <Trash2 className="h-3 w-3" />
                        <span>Removida: {contarPorStatus('REMOVIDA')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge com contagem atual */}
                  <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm md:text-base font-medium">
                    {reservasFiltradas.length}{' '}
                    {reservasFiltradas.length === 1 ? 'reserva' : 'reservas'}{' '}
                    {filtroStatus !== 'todas' && (
                      <span className="text-xs">
                        (
                        {filtroStatus === 'ativas'
                          ? 'ativas'
                          : filtroStatus === 'reservada'
                            ? 'reservadas'
                            : filtroStatus === 'ativa'
                              ? 'ativas'
                              : filtroStatus === 'concluida'
                                ? 'concluídas'
                                : filtroStatus === 'cancelada'
                                  ? 'canceladas'
                                  : 'removidas'}
                        )
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
