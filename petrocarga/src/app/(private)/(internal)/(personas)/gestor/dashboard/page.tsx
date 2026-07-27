'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { RelatorioSumario, RelatorioKpis } from '@/services/api/dashboardApi';
import { DashboardSummary, DashboardKPIs } from '@/lib/types/dashboard';
import { KPICard } from '@/components/dashboard/KPICard';
import { VehicleTypesChart } from '@/components/dashboard/VehicleTypesChart';
import { LocationStats } from '@/components/dashboard/LocationStats';
import { DashboardMetricsSection } from '@/components/dashboard/DashboardMetricsSection';
import { MostUsedParkingSpaces } from '@/components/dashboard/MostUsedParkingSpaces';
import { VehicleRoutesTable } from '@/components/dashboard/VehicleRoutesTable';
import {
  Loader2,
  LayoutDashboard,
  SlidersHorizontal,
  BarChart3,
  ParkingSquare,
  CheckCircle,
  XCircle,
  Car,
  MapPin,
  TrendingUp,
  Users,
  AlertCircle,
  RefreshCw,
  Clock,
  Trash2,
  DoorOpen,
  Ruler,
  TrendingDown,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts';
import { DateRangeFilterCTA } from '@/components/ui/CTA/DateRangeFilterCTA';




/**
 * @component RelatoriosPage
 * @version 1.0.0
 *
 * @description Página de relatórios e dashboard com métricas completas do sistema.
 * Visualização de KPIs, gráficos, estatísticas e análise de dados.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. CARREGAMENTO DE DADOS:
 *    - Verifica autenticação (user?.id)
 *    - Busca dados via Promise.allSettled (RelatorioSumario e RelatorioKpis)
 *    - Trata erros individualmente por requisição
 *
 * 2. FILTRO POR DATA:
 *    - DateRangePicker permite selecionar período
 *    - Recarrega dados automaticamente ao mudar datas
 *
 * 3. MÉTRICAS DERIVADAS:
 *    - Taxa de conclusão (completadas / total)
 *    - Taxa de cancelamento (canceladas / total)
 *    - Reservas por vaga (total / vagas)
 *
 * 4. GRÁFICOS E VISUALIZAÇÕES:
 *    - Gráficos de pizza (status, tipos de reserva)
 *    - Gráficos de barras (bairros, tempo de permanência)
 *    - Gráficos combinados (comparação de veículos)
 *    - Tabelas de rotas mais utilizadas
 *
 * 5. TABS DE NAVEGAÇÃO:
 *    - Visão Geral: KPIs principais e gráficos resumidos
 *    - Veículos: Análise detalhada de tipos e uso
 *    - Localizações: Estatísticas por bairro e origem
 *    - Avançado: Métricas de tempo e espaço
 *
 * 6. ESTADOS DE UI:
 *    - Loading: spinner centralizado
 *    - Erro: card vermelho com opção de retry
 *    - Sem dados: mensagem amigável
 *    - Sucesso: dashboard completo
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - Promise.allSettled: Permite que uma requisição falhe sem quebrar a outra
 * - useMemo: Otimização para dados derivados (taxas, gráficos)
 * - useCallback: Memoização da função de busca
 * - Responsividade: Grid adaptativo (1/2/4 colunas)
 * - Sheet mobile: Filtros em drawer no mobile
 * - Recharts: Biblioteca de gráficos (pizza, barras, linhas)
 *
 * ----------------------------------------------------------------------------
 * 📊 KPIs PRINCIPAIS:
 * ----------------------------------------------------------------------------
 *
 * - Total de Vagas
 * - Taxa de Ocupação
 * - Reservas Pendentes
 * - Reservas Ativas
 * - Reservas Concluídas
 * - Reservas Canceladas
 * - Reservas Removidas
 * - Reservas Totais
 * - Múltiplas Vagas
 * - Taxa de Conclusão
 * - Taxa de Cancelamento
 * - Reservas por Vaga
 *
 * ----------------------------------------------------------------------------
 * 📈 GRÁFICOS E VISUALIZAÇÕES:
 * ----------------------------------------------------------------------------
 *
 * - Tipos de Veículo (barras)
 * - Status das Reservas (pizza)
 * - Distribuição de Tipos de Reserva (pizza)
 * - Top 5 Bairros (barras horizontais)
 * - Comparação de Utilização (barras + linha)
 * - Tempo de Permanência (barras)
 * - Utilização de Espaço (pizza)
 * - Rotas Mais Utilizadas (tabela)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - KPICard: Card de métrica individual
 * - VehicleTypesChart: Gráfico de tipos de veículo
 * - LocationStats: Estatísticas de localização
 * - DateRangePicker: Seletor de período
 * - DashboardMetricsSection: Métricas avançadas
 * - MostUsedParkingSpaces: Vagas mais utilizadas
 * - VehicleRoutesTable: Tabela de rotas
 *
 * @example
 * // Uso em rota de gestor/admin
 * <RelatoriosPage />
 */

export default function RelatoriosPage() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Motorista';
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null,
  );
  const [kpisData, setKpisData] = useState<DashboardKPIs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [activeTab, setActiveTab] = useState('overview');

  // --------------------------------------------------------------------------
  // BUSCA DE DADOS
  // --------------------------------------------------------------------------

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Promise.allSettled permite que uma requisição falhe sem quebrar a outra
      const [summaryResult, kpisResult] = await Promise.allSettled([
        RelatorioSumario(
          dateRange.startDate || undefined,
          dateRange.endDate || undefined,
        ),
        RelatorioKpis(
          dateRange.startDate || undefined,
          dateRange.endDate || undefined,
        ),
      ]);

      if (summaryResult.status === 'fulfilled') {
        setDashboardData(summaryResult.value);
      } else {
        setError('Erro ao carregar resumo do dashboard');
      }

      if (kpisResult.status === 'fulfilled') {
        setKpisData(kpisResult.value);
      } else {
        setError((prev) =>
          prev
            ? `${prev}; Erro ao carregar KPIs`
            : 'Erro ao carregar KPIs do dashboard',
        );
      }

      if (
        summaryResult.status === 'rejected' &&
        kpisResult.status === 'rejected'
      ) {
        setError(
          'Não foi possível carregar os dados do dashboard. Verifique se o serviço está disponível.',
        );
      }
    } catch {
      setError('Erro interno ao processar os dados');
    } finally {
      setLoading(false);
    }
  }, [user?.id, dateRange.startDate, dateRange.endDate]);

  // Carrega dados iniciais
  useEffect(() => {
    if (!user?.id) return;
    fetchDashboardData();
  }, [user?.id]);

  // Recarrega quando filtro de data muda
  useEffect(() => {
    if (!user?.id || (!dateRange.startDate && !dateRange.endDate)) return;
    fetchDashboardData();
  }, [dateRange.startDate, dateRange.endDate]);

  // --------------------------------------------------------------------------
  // MÉTRICAS DERIVADAS
  // --------------------------------------------------------------------------

  const handleDateChange = useCallback(
    (newStartDate: string, newEndDate: string) => {
      setDateRange((prev) => {
        if (prev.startDate === newStartDate && prev.endDate === newEndDate) {
          return prev;
        }
        return {
          startDate: newStartDate,
          endDate: newEndDate,
        };
      });
    },
    [],
  );

  const derivedMetrics = useMemo(() => {
    if (!kpisData) return null;

    const completionRate =
      kpisData.totalReservations > 0
        ? (kpisData.completedReservations / kpisData.totalReservations) * 100
        : 0;

    const cancellationRate =
      kpisData.totalReservations > 0
        ? (kpisData.canceledReservations / kpisData.totalReservations) * 100
        : 0;

    const reservationsPerSlot =
      kpisData.totalSlots > 0
        ? kpisData.totalReservations / kpisData.totalSlots
        : 0;

    return {
      completionRate: completionRate.toFixed(1),
      cancellationRate: cancellationRate.toFixed(1),
      reservationsPerSlot: reservationsPerSlot.toFixed(1),
    };
  }, [kpisData]);

  // --------------------------------------------------------------------------
  // DADOS PARA GRÁFICOS
  // --------------------------------------------------------------------------

  const reservationStatusData = useMemo(
    () =>
      kpisData
        ? [
            {
              name: 'Concluídas',
              value: kpisData.completedReservations,
              color: '#10b981',
            },
            {
              name: 'Pendentes',
              value: kpisData.pendingReservations,
              color: '#f59e0b',
            },
            {
              name: 'Ativas',
              value: kpisData.activeReservations,
              color: '#3b82f6',
            },
            {
              name: 'Canceladas',
              value: kpisData.canceledReservations,
              color: '#ef4444',
            },
            {
              name: 'Removidas',
              value: kpisData.removedReservations,
              color: '#6b7280',
            },
          ].filter((item) => item.value > 0)
        : [],
    [kpisData],
  );

  const reservationTypesData = useMemo(
    () =>
      kpisData
        ? [
            {
              name: 'Reservas Normais',
              value:
                kpisData.totalReservations - kpisData.multipleSlotReservations,
              color: '#3b82f6',
            },
            {
              name: 'Múltiplas Vagas',
              value: kpisData.multipleSlotReservations,
              color: '#8b5cf6',
            },
          ].filter((item) => item.value > 0)
        : [],
    [kpisData],
  );

  const topDistrictsData = useMemo(
    () =>
      dashboardData?.districts?.slice(0, 5).map((item) => ({
        name:
          item.name.length > 15
            ? item.name.substring(0, 12) + '...'
            : item.name,
        fullName: item.name,
        value: item.reservationCount,
        color: '#10b981',
      })) || [],
    [dashboardData],
  );

  const stayDurationData = useMemo(
    () =>
      dashboardData?.stayDurationStats
        ? [
            {
              name: 'Mínimo',
              value: dashboardData.stayDurationStats.minMinutes || 0,
              color: '#10b981',
            },
            {
              name: 'Médio',
              value: dashboardData.stayDurationStats.avgMinutes || 0,
              color: '#3b82f6',
            },
            {
              name: 'Máximo',
              value: dashboardData.stayDurationStats.maxMinutes || 0,
              color: '#f59e0b',
            },
          ].filter((item) => item.value > 0)
        : [],
    [dashboardData],
  );

  const lengthOccupancyData = useMemo(
    () =>
      dashboardData?.lengthOccupancyStats
        ? [
            {
              name: 'Ocupado',
              value: dashboardData.lengthOccupancyStats.occupiedLengthMeters,
              color: '#10b981',
            },
            {
              name: 'Disponível',
              value: Math.max(
                0,
                dashboardData.lengthOccupancyStats.availableLengthMeters -
                  dashboardData.lengthOccupancyStats.occupiedLengthMeters,
              ),
              color: '#d1d5db',
            },
          ].filter((item) => item.value > 0)
        : [],
    [dashboardData],
  );

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------



  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Bem vindo, {primeiroNome}!
          </h1>
          <p className="text-xs text-white/50 capitalize">{hoje}</p>
        </div>
      </header>
      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* CTA principal - Dashboard Gestor */}
        <div className="-mt-4 mb-5">
          <DateRangeFilterCTA
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
        </div>
        {/* ESTADO DE ERRO */}
        {error && (
          <Card className="mb-4 md:mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                    Serviço Indisponível
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4 break-words">
                    {error}
                  </p>
                  <Button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 w-full md:w-auto"
                    size="sm"
                  >
                    <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DASHBOARD PRINCIPAL */}
        {!error && (dashboardData || kpisData) ? (
          <>
            {/* TABS DE NAVEGAÇÃO */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-5 md:space-y-6"
            >
              <div className="w-full overflow-x-auto pb-1 scrollbar-none">
                <TabsList
                  className="
        flex h-auto w-full min-w-[500px]
        items-center justify-center gap-1
        rounded-2xl border border-slate-200/80
        bg-slate-100/80 p-1.5
        shadow-sm backdrop-blur-sm
      "
                >
                  <TabsTrigger
                    value="overview"
                    className="
          group relative flex min-h-10 items-center gap-2
          rounded-xl px-4 py-2
          text-sm font-medium text-slate-500
          transition-all duration-200
          hover:bg-white/70 hover:text-slate-700
          data-[state=active]:bg-white
          data-[state=active]:text-[#071D41]
          data-[state=active]:shadow-sm
          data-[state=active]:ring-1
          data-[state=active]:ring-slate-200/80
        "
                  >
                    <LayoutDashboard
                      className="
            h-4 w-4 shrink-0 transition-colors
            group-data-[state=active]:text-[#071D41]
          "
                    />
                    <span>Visão Geral</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="vehicles"
                    className="
          group relative flex min-h-10 items-center gap-2
          rounded-xl px-4 py-2
          text-sm font-medium text-slate-500
          transition-all duration-200
          hover:bg-white/70 hover:text-slate-700
          data-[state=active]:bg-white
          data-[state=active]:text-[#071D41]
          data-[state=active]:shadow-sm
          data-[state=active]:ring-1
          data-[state=active]:ring-slate-200/80
        "
                  >
                    <Car
                      className="
            h-4 w-4 shrink-0 transition-colors
            group-data-[state=active]:text-[#071D41]
          "
                    />
                    <span>Veículos</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="locations"
                    className="
          group relative flex min-h-10 items-center gap-2
          rounded-xl px-4 py-2
          text-sm font-medium text-slate-500
          transition-all duration-200
          hover:bg-white/70 hover:text-slate-700
          data-[state=active]:bg-white
          data-[state=active]:text-[#071D41]
          data-[state=active]:shadow-sm
          data-[state=active]:ring-1
          data-[state=active]:ring-slate-200/80
        "
                  >
                    <MapPin
                      className="
            h-4 w-4 shrink-0 transition-colors
            group-data-[state=active]:text-[#071D41]
          "
                    />
                    <span>Localizações</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="advanced"
                    className="
          group relative flex min-h-10 items-center gap-2
          rounded-xl px-4 py-2
          text-sm font-medium text-slate-500
          transition-all duration-200
          hover:bg-white/70 hover:text-slate-700
          data-[state=active]:bg-white
          data-[state=active]:text-[#071D41]
          data-[state=active]:shadow-sm
          data-[state=active]:ring-1
          data-[state=active]:ring-slate-200/80
        "
                  >
                    <SlidersHorizontal
                      className="
            h-4 w-4 shrink-0 transition-colors
            group-data-[state=active]:text-[#071D41]
          "
                    />
                    <span>Avançado</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ================================================================
    TAB: VISÃO GERAL
================================================================ */}
              <TabsContent
                value="overview"
                className="space-y-5 md:space-y-6 focus-visible:outline-none"
              >
                {/* ================================================================
      KPIs PRINCIPAIS
  ================================================================ */}
                {kpisData && (
                  <>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4 md:gap-4">
                      <KPICard
                        title="Total de Vagas"
                        value={kpisData.totalSlots}
                        icon={ParkingSquare}
                        description="Vagas cadastradas"
                      />

                      <KPICard
                        title="Taxa de Ocupação"
                        value={`${kpisData.occupancyRate.toFixed(1)}%`}
                        icon={TrendingUp}
                        description="Ocupação atual"
                        trend={{
                          value: kpisData.occupancyRate > 50 ? 5 : -2,
                          isPositive: kpisData.occupancyRate > 50,
                        }}
                      />

                      <KPICard
                        title="Reservas Ativas"
                        value={kpisData.activeReservations}
                        icon={Users}
                        description="Em andamento"
                      />

                      <KPICard
                        title="Reservas Totais"
                        value={kpisData.totalReservations}
                        icon={BarChart3}
                        description="No período selecionado"
                      />
                    </div>

                    {/* ================================================================
          RESUMO OPERACIONAL
      ================================================================ */}
                    <Card className="rounded-3xl sm:rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <CardContent className="p-2 sm:p-1.5">
                        <div className="flex flex-col sm:flex-row items-center">
                          {/* Pendentes */}
                          <div className="flex flex-1 items-center gap-3 w-full px-4 py-2.5 rounded-2xl sm:rounded-full hover:bg-amber-50/40 transition-colors">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                              <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-amber-700">
                                Pendentes
                              </p>
                              <p className="text-lg font-bold leading-none text-slate-900 mt-1">
                                {kpisData.pendingReservations}
                              </p>
                            </div>
                          </div>

                          {/* Linha Divisória 1 */}
                          <div className="h-[1px] w-[90%] sm:h-8 sm:w-[1px] bg-slate-200 my-1 sm:my-0 shrink-0" />

                          {/* Concluídas */}
                          <div className="flex flex-1 items-center gap-3 w-full px-4 py-2.5 rounded-2xl sm:rounded-full hover:bg-emerald-50/40 transition-colors">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-emerald-700">
                                Concluídas
                              </p>
                              <p className="text-lg font-bold leading-none text-slate-900 mt-1">
                                {kpisData.completedReservations}
                              </p>
                            </div>
                          </div>

                          {/* Linha Divisória 2 */}
                          <div className="h-[1px] w-[90%] sm:h-8 sm:w-[1px] bg-slate-200 my-1 sm:my-0 shrink-0" />

                          {/* Canceladas */}
                          <div className="flex flex-1 items-center gap-3 w-full px-4 py-2.5 rounded-2xl sm:rounded-full hover:bg-red-50/40 transition-colors">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                              <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-red-700">
                                Canceladas
                              </p>
                              <p className="text-lg font-bold leading-none text-slate-900 mt-1">
                                {kpisData.canceledReservations}
                              </p>
                            </div>
                          </div>

                          {/* Linha Divisória 3 */}
                          <div className="h-[1px] w-[90%] sm:h-8 sm:w-[1px] bg-slate-200 my-1 sm:my-0 shrink-0" />

                          {/* Removidas */}
                          <div className="flex flex-1 items-center gap-3 w-full px-4 py-2.5 rounded-2xl sm:rounded-full hover:bg-slate-50 transition-colors">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200/80">
                              <Trash2 className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-600">
                                Removidas
                              </p>
                              <p className="text-lg font-bold leading-none text-slate-900 mt-1">
                                {kpisData.removedReservations}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {/* ================================================================
          MÉTRICAS DERIVADAS
      ================================================================ */}
                    {derivedMetrics && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
                        <KPICard
                          title="Taxa de Conclusão"
                          value={`${derivedMetrics.completionRate}%`}
                          icon={CheckCircle}
                          description="Reservas finalizadas"
                          className="border-emerald-200 bg-emerald-50/50"
                        />

                        <KPICard
                          title="Taxa de Cancelamento"
                          value={`${derivedMetrics.cancellationRate}%`}
                          icon={TrendingDown}
                          description="Reservas canceladas"
                          className="border-red-200 bg-red-50/50"
                        />

                        <KPICard
                          title="Reservas por Vaga"
                          value={derivedMetrics.reservationsPerSlot}
                          icon={Activity}
                          description="Média de reservas por vaga"
                          className="border-blue-200 bg-blue-50/50"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* ================================================================
      ANÁLISE DE RESERVAS
  ================================================================ */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
                  {/* TIPOS DE VEÍCULO */}
                  {dashboardData?.vehicleTypes?.length ? (
                    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                      <CardHeader className="border-b px-4 py-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                            <Car className="h-4 w-4 text-[#071D41]" />
                          </div>

                          <div>
                            <CardTitle className="text-base font-semibold text-[#071D41]">
                              Tipos de veículos
                            </CardTitle>

                            <p className="text-xs text-slate-500">
                              Distribuição das reservas por veículo
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 md:p-6">
                        <div className="h-[280px]">
                          <VehicleTypesChart
                            data={dashboardData.vehicleTypes}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-slate-200/80 shadow-sm">
                      <CardContent className="flex min-h-[340px] flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <Car className="h-6 w-6 text-slate-400" />
                        </div>

                        <h3 className="text-sm font-semibold text-slate-700">
                          Sem dados de veículos
                        </h3>

                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                          Ainda não existem informações suficientes para
                          apresentar a distribuição dos tipos de veículos.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* STATUS DAS RESERVAS */}
                  {reservationStatusData.length > 0 ? (
                    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                      <CardHeader className="border-b px-4 py-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                            <BarChart3 className="h-4 w-4 text-emerald-600" />
                          </div>

                          <div>
                            <CardTitle className="text-base font-semibold text-[#071D41]">
                              Status das reservas
                            </CardTitle>

                            <p className="text-xs text-slate-500">
                              Situação atual das reservas
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 md:p-6">
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={reservationStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={2}
                                stroke="#fff"
                              >
                                {reservationStatusData.map((entry, index) => (
                                  <Cell
                                    key={`status-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>

                              <Tooltip
                                contentStyle={{
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}
                              />

                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-slate-200/80 shadow-sm">
                      <CardContent className="flex min-h-[340px] flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <BarChart3 className="h-6 w-6 text-slate-400" />
                        </div>

                        <h3 className="text-sm font-semibold text-slate-700">
                          Sem dados de reservas
                        </h3>

                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                          Não há informações suficientes para gerar o gráfico de
                          status.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* ================================================================
      DISTRIBUIÇÃO E LOCALIZAÇÃO
  ================================================================ */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
                  {/* TIPOS DE RESERVA */}
                  {reservationTypesData.length > 0 && (
                    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                      <CardHeader className="border-b px-4 py-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
                            <TrendingUp className="h-4 w-4 text-violet-600" />
                          </div>

                          <div>
                            <CardTitle className="text-base font-semibold text-[#071D41]">
                              Tipos de reserva
                            </CardTitle>

                            <p className="text-xs text-slate-500">
                              Distribuição por modalidade
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 md:p-6">
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={reservationTypesData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={2}
                                stroke="#fff"
                              >
                                {reservationTypesData.map((entry, index) => (
                                  <Cell
                                    key={`type-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>

                              <Tooltip
                                contentStyle={{
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}
                              />

                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* TOP BAIRROS */}
                  {topDistrictsData.length > 0 && (
                    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                      <CardHeader className="border-b px-4 py-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                            <MapPin className="h-4 w-4 text-amber-600" />
                          </div>

                          <div>
                            <CardTitle className="text-base font-semibold text-[#071D41]">
                              Regiões com maior demanda
                            </CardTitle>

                            <p className="text-xs text-slate-500">
                              Top 5 bairros por número de reservas
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 md:p-6">
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={topDistrictsData}
                              layout="vertical"
                              margin={{
                                top: 8,
                                right: 20,
                                left: 10,
                                bottom: 8,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="#e2e8f0"
                              />

                              <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                              />

                              <YAxis
                                type="category"
                                dataKey="name"
                                width={90}
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                              />

                              <Tooltip
                                formatter={(value) => [value, 'Reservas']}
                                contentStyle={{
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}
                              />

                              <Bar
                                dataKey="value"
                                fill="#071D41"
                                radius={[0, 6, 6, 0]}
                                barSize={22}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: VEÍCULOS */}
              <TabsContent value="vehicles" className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {dashboardData?.vehicleTypes &&
                  dashboardData.vehicleTypes.length > 0 ? (
                    <>
                      <VehicleTypesChart data={dashboardData.vehicleTypes} />

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base md:text-lg">
                            Comparação de Utilização
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart
                                data={dashboardData.vehicleTypes.map(
                                  (vehicle) => ({
                                    name: vehicle.type,
                                    total: vehicle.count,
                                    únicos: vehicle.uniqueVehicles,
                                    média:
                                      vehicle.uniqueVehicles > 0
                                        ? vehicle.count / vehicle.uniqueVehicles
                                        : 0,
                                  }),
                                )}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 60,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="name"
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                  dataKey="total"
                                  name="Total Reservas"
                                  fill="#3b82f6"
                                  barSize={30}
                                />
                                <Bar
                                  dataKey="únicos"
                                  name="Veículos Únicos"
                                  fill="#10b981"
                                  barSize={30}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="média"
                                  name="Média por Veículo"
                                  stroke="#f59e0b"
                                  strokeWidth={2}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6 md:p-12 min-h-[300px]">
                          <Car className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mb-3 md:mb-4" />
                          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2 text-center">
                            Nenhum dado de veículos
                          </h3>
                          <p className="text-gray-600 text-center text-sm md:text-base">
                            Não há dados de tipos de veículos disponíveis
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 3: LOCALIZAÇÕES */}
              <TabsContent value="locations" className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {dashboardData?.districts &&
                  dashboardData.districts.length > 0 ? (
                    <LocationStats
                      title="Bairros"
                      data={dashboardData.districts}
                      icon="district"
                    />
                  ) : (
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center justify-center h-full p-4 md:p-6 min-h-[300px]">
                        <MapPin className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-3" />
                        <p className="text-gray-600 text-center text-sm md:text-base">
                          Nenhum dado de bairros disponível
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {dashboardData?.origins &&
                  dashboardData.origins.length > 0 ? (
                    <LocationStats
                      title="Locais de Origem"
                      data={dashboardData.origins}
                      icon="origin"
                    />
                  ) : (
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center justify-center h-full p-4 md:p-6 min-h-[300px]">
                        <MapPin className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-3" />
                        <p className="text-gray-600 text-center text-sm md:text-base">
                          Nenhum dado de locais de origem disponível
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {dashboardData?.entryOrigins &&
                  dashboardData.entryOrigins.length > 0 ? (
                    <LocationStats
                      title="Entradas da Cidade"
                      data={dashboardData.entryOrigins}
                      icon="entry-origin"
                    />
                  ) : (
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center justify-center h-full p-4 md:p-6 min-h-[300px]">
                        <DoorOpen className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-3" />
                        <p className="text-gray-600 text-center text-sm md:text-base">
                          Nenhum dado de entradas da cidade disponível
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {dashboardData?.mostUsedVagas &&
                  dashboardData.mostUsedVagas.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Ruler className="h-5 w-5" />
                          Vagas Mais Utilizadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <MostUsedParkingSpaces
                          data={dashboardData.mostUsedVagas}
                        />
                      </CardContent>
                    </Card>
                  )}
              </TabsContent>

              {/* TAB 4: AVANÇADO */}
              <TabsContent value="advanced" className="space-y-4 md:space-y-6">
                {/* Métricas avançadas (tempo e espaço) */}
                <DashboardMetricsSection
                  stayDurationStats={dashboardData?.stayDurationStats}
                  activeDuringPeriodStats={
                    dashboardData?.activeDuringPeriodStats
                  }
                  lengthOccupancyStats={dashboardData?.lengthOccupancyStats}
                />

                {/* Gráficos: Tempo de Permanência + Utilização de Espaço */}
                {stayDurationData.length > 0 &&
                  lengthOccupancyData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Tempo de Permanência
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stayDurationData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                  dataKey="value"
                                  fill="#3b82f6"
                                  radius={[4, 4, 0, 0]}
                                >
                                  {stayDurationData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Utilização de Espaço
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={lengthOccupancyData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={2}
                                  dataKey="value"
                                  label
                                >
                                  {lengthOccupancyData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-900">
                                Comprimento Ocupado
                              </p>
                              <p className="text-lg font-bold text-green-700">
                                {dashboardData?.lengthOccupancyStats?.occupiedLengthMeters.toFixed(
                                  1,
                                )}{' '}
                                m
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-900">
                                Taxa de Ocupação
                              </p>
                              <p className="text-lg font-bold text-gray-700">
                                {dashboardData?.lengthOccupancyStats?.occupancyRatePercent.toFixed(
                                  1,
                                )}
                                %
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                {/* Tabela de rotas mais utilizadas */}
                {dashboardData?.vehicleRoutes &&
                  dashboardData.vehicleRoutes.length > 0 && (
                    <VehicleRoutesTable routes={dashboardData.vehicleRoutes} />
                  )}
              </TabsContent>
            </Tabs>

            {/* RESUMO DO PERÍODO */}
            {kpisData && derivedMetrics && (
              <Card className="mt-4 md:mt-6">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">
                    Resumo do Período
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600">
                        Período analisado
                      </p>
                      <p className="font-semibold text-sm md:text-base truncate">
                        {kpisData.startDate
                          ? new Date(kpisData.startDate).toLocaleDateString(
                              'pt-BR',
                            )
                          : 'Data inicial'}{' '}
                        -{' '}
                        {kpisData.endDate
                          ? new Date(kpisData.endDate).toLocaleDateString(
                              'pt-BR',
                            )
                          : 'Data final'}
                      </p>
                    </div>

                    <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600">
                        Reservas por vaga
                      </p>
                      <p className="font-semibold text-sm md:text-base">
                        {derivedMetrics.reservationsPerSlot} reservas/vaga
                      </p>
                    </div>

                    <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600">
                        Taxa de cancelamento
                      </p>
                      <p className="font-semibold text-sm md:text-base">
                        {derivedMetrics.cancellationRate}%
                      </p>
                    </div>

                    <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-600">
                        Taxa de conclusão
                      </p>
                      <p className="font-semibold text-sm md:text-base">
                        {derivedMetrics.completionRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : !error && !loading ? (
          // ESTADO SEM DADOS
          <Card className="mb-4 md:mb-6">
            <CardContent className="p-6 md:p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                <BarChart3 className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                <div>
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                    Nenhum dado disponível
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Não há dados para exibir no momento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
