'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { RelatorioSumario, RelatorioKpis } from '@/lib/api/dashboardApi';
import { DashboardSummary, DashboardKPIs } from '@/lib/types/dashboard';
import { KPICard } from '@/components/dashboard/KPICard';
import { VehicleTypesChart } from '@/components/dashboard/VehicleTypesChart';
import { LocationStats } from '@/components/dashboard/LocationStats';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { DashboardMetricsSection } from '@/components/dashboard/DashboardMetricsSection';
import { MostUsedParkingSpaces } from '@/components/dashboard/MostUsedParkingSpaces';
import { VehicleRoutesTable } from '@/components/dashboard/VehicleRoutesTable';
import {
  Loader2,
  BarChart3,
  ParkingSquare,
  CheckCircle,
  XCircle,
  Car,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  AlertCircle,
  RefreshCw,
  Menu,
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null,
  );
  const [kpisData, setKpisData] = useState<DashboardKPIs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --------------------------------------------------------------------------
  // BUSCA DE DADOS
  // --------------------------------------------------------------------------

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

  const handleDateChange = useCallback((newStartDate: string, newEndDate: string) => {
    setDateRange((prev) => {
        if (prev.startDate === newStartDate && prev.endDate === newEndDate) {
            return prev;
        }
        return {
            startDate: newStartDate,
            endDate: newEndDate,
        };
    });
  }, []);

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

  if (loading && !dashboardData && !kpisData) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] md:min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 md:w-12 md:h-12 text-blue-600 mb-4" />
        <p className="text-gray-600 text-sm md:text-base">
          Carregando dados do dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-4 md:mb-6 lg:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          {/* Título e menu mobile */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            {/* Menu mobile para filtros */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <div className="py-6">
                  <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                  <DateRangePicker onDateChange={handleDateChange} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Título e ícone */}
            <div className="flex items-center gap-2 md:gap-3">
              <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  Relatórios e Dashboard
                </h1>
                <p className="text-gray-600 text-sm md:text-base hidden md:block">
                  Visualize métricas e estatísticas do sistema
                </p>
              </div>
            </div>
          </div>

          {/* Subtítulo mobile */}
          <p className="text-gray-600 text-sm md:hidden mt-2">
            Visualize métricas e estatísticas do sistema
          </p>

          {/* Botão atualizar */}
          <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-0">
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              className="flex items-center gap-2 w-full md:w-auto"
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
              )}
              <span className="hidden sm:inline">
                {loading ? 'Atualizando...' : 'Atualizar'}
              </span>
              <span className="sm:hidden">Atualizar</span>
            </Button>
          </div>
        </div>
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
          {/* FILTRO DE DATA (DESKTOP) */}
          <Card className="mb-4 md:mb-6 hidden md:block">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <DateRangePicker onDateChange={handleDateChange} />
              {dateRange.startDate && dateRange.endDate && (
                <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
                  Mostrando dados de{' '}
                  {new Date(
                    dateRange.startDate.split('T')[0],
                  ).toLocaleDateString('pt-BR')}{' '}
                  até{' '}
                  {new Date(dateRange.endDate.split('T')[0]).toLocaleDateString(
                    'pt-BR',
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* TABS DE NAVEGAÇÃO */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4 md:space-y-6"
          >
            {/* Lista de Tabs (responsiva com scroll) */}
            <div className="overflow-x-auto pb-2 md:pb-0">
              <TabsList className="inline-flex h-10 w-full min-w-[400px] md:w-auto md:grid md:grid-cols-4 md:max-w-xl">
                <TabsTrigger value="overview" className="flex-1 min-w-[100px]">
                  <span className="truncate">Visão Geral</span>
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="flex-1 min-w-[100px]">
                  <span className="truncate">Veículos</span>
                </TabsTrigger>
                <TabsTrigger value="locations" className="flex-1 min-w-[100px]">
                  <span className="truncate">Localizações</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex-1 min-w-[100px]">
                  <span className="truncate">Avançado</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: VISÃO GERAL */}
            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              {/* KPIs Principais */}
              {kpisData && (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <KPICard
                    title="Total de Vagas"
                    value={kpisData.totalSlots}
                    icon={ParkingSquare}
                    description="Vagas disponíveis"
                  />
                  <KPICard
                    title="Taxa de Ocupação"
                    value={`${kpisData.occupancyRate.toFixed(1)}%`}
                    icon={TrendingUp}
                    description="Uso das vagas"
                    trend={{
                      value: kpisData.occupancyRate > 50 ? 5 : -2,
                      isPositive: kpisData.occupancyRate > 50,
                    }}
                  />
                  <KPICard
                    title="Reservas Pendentes"
                    value={kpisData.pendingReservations}
                    icon={Clock}
                    description="Reservas aguardando"
                  />
                  <KPICard
                    title="Reservas Ativas"
                    value={kpisData.activeReservations}
                    icon={Users}
                    description="Reservas em andamento"
                  />
                  <KPICard
                    title="Reservas Concluídas"
                    value={kpisData.completedReservations}
                    icon={CheckCircle}
                    description="Reservas finalizadas"
                  />
                  <KPICard
                    title="Reservas Canceladas"
                    value={kpisData.canceledReservations}
                    icon={XCircle}
                    description="Reservas canceladas"
                  />
                  <KPICard
                    title="Reservas Removidas"
                    value={kpisData.removedReservations}
                    icon={Trash2}
                    description="Reservas removidas"
                  />
                  <KPICard
                    title="Reservas Totais"
                    value={kpisData.totalReservations}
                    icon={BarChart3}
                    description="Total de reservas"
                  />
                  <KPICard
                    title="Múltiplas Vagas"
                    value={kpisData.multipleSlotReservations}
                    icon={Car}
                    description="Reservas com +1 vaga"
                  />
                  {derivedMetrics && (
                    <>
                      <KPICard
                        title="Taxa de Conclusão"
                        value={`${derivedMetrics.completionRate}%`}
                        icon={CheckCircle}
                        description="Reservas finalizadas"
                        className="bg-green-50 border-green-200"
                      />
                      <KPICard
                        title="Taxa de Cancelamento"
                        value={`${derivedMetrics.cancellationRate}%`}
                        icon={TrendingDown}
                        description="Reservas canceladas"
                        className="bg-red-50 border-red-200"
                      />
                      <KPICard
                        title="Reservas/Vaga"
                        value={derivedMetrics.reservationsPerSlot}
                        icon={Activity}
                        description="Média por vaga"
                        className="bg-blue-50 border-blue-200"
                      />
                    </>
                  )}
                </div>
              )}

              {/* Gráficos: Tipos de Veículo + Status das Reservas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {dashboardData?.vehicleTypes &&
                dashboardData.vehicleTypes.length > 0 ? (
                  <VehicleTypesChart data={dashboardData.vehicleTypes} />
                ) : (
                  <Card className="h-full">
                    <CardContent className="flex flex-col items-center justify-center h-full p-4 md:p-6 min-h-[300px]">
                      <Car className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-3" />
                      <p className="text-gray-600 text-center text-sm md:text-base">
                        Nenhum dado de tipos de veículo disponível
                      </p>
                    </CardContent>
                  </Card>
                )}

                {reservationStatusData.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Status das Reservas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reservationStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label
                            >
                              {reservationStatusData.map((entry, index) => (
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
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full">
                    <CardContent className="flex flex-col items-center justify-center h-full p-4 md:p-6 min-h-[300px]">
                      <BarChart3 className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-3" />
                      <p className="text-gray-600 text-center text-sm md:text-base">
                        Nenhum dado de status de reservas disponível
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Gráficos: Distribuição de Tipos + Top Bairros */}
              {reservationTypesData.length > 0 &&
                topDistrictsData.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Distribuição de Tipos de Reserva
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={reservationTypesData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                label
                              >
                                {reservationTypesData.map((entry, index) => (
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
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Top 5 Bairros
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={topDistrictsData}
                              layout="vertical"
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis
                                type="category"
                                dataKey="name"
                                width={80}
                              />
                              <Tooltip
                                formatter={(value) => [value, 'Reservas']}
                              />
                              <Bar
                                dataKey="value"
                                fill="#10b981"
                                radius={[0, 4, 4, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
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

                {dashboardData?.origins && dashboardData.origins.length > 0 ? (
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
                activeDuringPeriodStats={dashboardData?.activeDuringPeriodStats}
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
                        ? new Date(kpisData.endDate).toLocaleDateString('pt-BR')
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
    </div>
  );
}
