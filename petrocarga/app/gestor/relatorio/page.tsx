'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null,
  );
  const [kpisData, setKpisData] = useState<DashboardKPIs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFetching = useRef(false);

  const fetchDashboardData = useCallback(
    async (forceRefresh = false) => {
      if (isFetching.current && !forceRefresh) return;
      if (!user?.id) return;

      isFetching.current = true;
      setLoading(true);
      setError(null);

      try {
        const [summaryResult, kpisResult] = await Promise.allSettled([
          RelatorioSumario(startDate || undefined, endDate || undefined),
          RelatorioKpis(startDate || undefined, endDate || undefined),
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
      } catch (err) {
        setError('Erro interno ao processar os dados');
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [user?.id, startDate, endDate],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const calculateMetrics = () => {
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
  };

  const derivedMetrics = calculateMetrics();

  const reservationStatusData = kpisData
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
    : [];

  const reservationTypesData = kpisData
    ? [
        {
          name: 'Reservas Normais',
          value: kpisData.totalReservations - kpisData.multipleSlotReservations,
          color: '#3b82f6',
        },
        {
          name: 'Múltiplas Vagas',
          value: kpisData.multipleSlotReservations,
          color: '#8b5cf6',
        },
      ].filter((item) => item.value > 0)
    : [];

  const topDistrictsData =
    dashboardData?.districts?.slice(0, 5).map((item) => ({
      name:
        item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
      fullName: item.name,
      value: item.reservationCount,
      color: '#10b981',
    })) || [];

  const stayDurationData = dashboardData?.stayDurationStats
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
    : [];

  const lengthOccupancyData = dashboardData?.lengthOccupancyStats
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
    : [];

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
      <div className="mb-4 md:mb-6 lg:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center justify-between md:justify-start gap-3">
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

          <p className="text-gray-600 text-sm md:hidden mt-2">
            Visualize métricas e estatísticas do sistema
          </p>

          <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-0">
            <Button
              onClick={handleRefresh}
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
                  onClick={handleRefresh}
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

      {!error && (dashboardData || kpisData) ? (
        <>
          <Card className="mb-4 md:mb-6 hidden md:block">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <DateRangePicker onDateChange={handleDateChange} />
              {startDate && endDate && (
                <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
                  Mostrando dados de{' '}
                  {new Date(startDate.split('T')[0]).toLocaleDateString(
                    'pt-BR',
                  )}{' '}
                  até{' '}
                  {new Date(endDate.split('T')[0]).toLocaleDateString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4 md:space-y-6"
          >
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

            <TabsContent value="overview" className="space-y-4 md:space-y-6">
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

            <TabsContent value="advanced" className="space-y-4 md:space-y-6">
              <DashboardMetricsSection
                stayDurationStats={dashboardData?.stayDurationStats}
                activeDuringPeriodStats={dashboardData?.activeDuringPeriodStats}
                lengthOccupancyStats={dashboardData?.lengthOccupancyStats}
              />

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

              {dashboardData?.vehicleRoutes &&
                dashboardData.vehicleRoutes.length > 0 && (
                  <VehicleRoutesTable routes={dashboardData.vehicleRoutes} />
                )}
            </TabsContent>
          </Tabs>

          {kpisData && (
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
                      {kpisData.totalSlots
                        ? (
                            kpisData.totalReservations / kpisData.totalSlots
                          ).toFixed(1)
                        : 0}{' '}
                      reservas/vaga
                    </p>
                  </div>

                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-600">
                      Taxa de cancelamento
                    </p>
                    <p className="font-semibold text-sm md:text-base">
                      {kpisData.totalReservations
                        ? (
                            (kpisData.canceledReservations /
                              kpisData.totalReservations) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>

                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-600">
                      Taxa de conclusão
                    </p>
                    <p className="font-semibold text-sm md:text-base">
                      {kpisData.totalReservations
                        ? (
                            (kpisData.completedReservations /
                              kpisData.totalReservations) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : !error && !loading ? (
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
