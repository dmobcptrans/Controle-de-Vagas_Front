'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  StayDurationStats,
  ActiveDuringPeriodStats,
  LengthOccupancyStats,
} from '@/lib/types/dashboard';
import { Clock, Users, Ruler, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

interface DashboardMetricsSectionProps {
  stayDurationStats?: StayDurationStats;
  activeDuringPeriodStats?: ActiveDuringPeriodStats;
  lengthOccupancyStats?: LengthOccupancyStats;
}

/**
 * @component DashboardMetricsSection
 * @version 1.0.0
 * 
 * @description Seção de métricas avançadas do dashboard.
 * Exibe gráficos e estatísticas sobre tempo de permanência,
 * reservas ativas e ocupação por comprimento.
 * 
 * ----------------------------------------------------------------------------
 * 📋 MÉTRICAS EXIBIDAS:
 * ----------------------------------------------------------------------------
 * 
 * 1. TEMPO DE PERMANÊNCIA:
 *    - Gráfico de barras: mínimo, médio, máximo
 *    - Valor destacado: tempo médio formatado
 *    - Ícone: Clock (azul)
 * 
 * 2. RESERVAS ATIVAS NO PERÍODO:
 *    - Gráfico de barras: normais vs rápidas
 *    - Valor destacado: total de reservas ativas
 *    - Ícone: Users (verde)
 * 
 * 3. OCUPAÇÃO POR COMPRIMENTO:
 *    - Gráfico de pizza: ocupado vs disponível
 *    - Valor destacado: taxa de ocupação percentual
 *    - Ícone: Ruler (roxo)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - formatMinutes: Formata minutos para exibição amigável
 *   - < 60 min → exibe "X min"
 *   - >= 60 min → exibe "Xh Ymin"
 * 
 * - DADOS OPCIONAIS: Verifica se há dados antes de renderizar cada card
 *   - hasStayDurationData: verifica se há valores positivos
 *   - hasActivePeriodData: verifica total > 0
 *   - hasLengthOccupancyData: verifica disponibilidade
 * 
 * - FALLBACK: Cards "vazios" com opacidade e mensagem "Nenhum dado"
 * 
 * - GRÁFICOS:
 *   - Barras: Recharts BarChart (tempo e reservas)
 *   - Pizza: Recharts PieChart (ocupação)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Recharts: Biblioteca de gráficos
 * - Lucide icons: Clock, Users, Ruler, BarChart3
 * 
 * @example
 * ```tsx
 * <DashboardMetricsSection
 *   stayDurationStats={dashboard.stayDurationStats}
 *   activeDuringPeriodStats={dashboard.activeDuringPeriodStats}
 *   lengthOccupancyStats={dashboard.lengthOccupancyStats}
 * />
 * ```
 * 
 * @see /src/lib/types/dashboard.ts - Tipos de métricas
 */

export function DashboardMetricsSection({
  stayDurationStats,
  activeDuringPeriodStats,
  lengthOccupancyStats,
}: DashboardMetricsSectionProps) {
  /**
   * @function formatMinutes
   * @description Formata minutos para exibição legível
   * @param minutes - Número de minutos ou null
   * @returns String formatada (ex: "2h 30min", "45min", "N/A")
   */
  const formatMinutes = (minutes: number | null): string => {
    if (!minutes || minutes === null) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Verifica se há dados válidos para cada métrica
  const hasStayDurationData =
    stayDurationStats &&
    ((stayDurationStats.avgMinutes ?? 0) > 0 ||
      (stayDurationStats.minMinutes ?? 0) > 0 ||
      (stayDurationStats.maxMinutes ?? 0) > 0);

  const hasActivePeriodData =
    activeDuringPeriodStats && activeDuringPeriodStats.total > 0;

  const hasLengthOccupancyData =
    lengthOccupancyStats && lengthOccupancyStats.availableLengthMeters > 0;

  // Dados para gráfico de tempo de permanência
  const stayDurationChartData = stayDurationStats
    ? [
        {
          name: 'Mínimo',
          value: stayDurationStats.minMinutes || 0,
          color: '#10b981', // verde
        },
        {
          name: 'Médio',
          value: stayDurationStats.avgMinutes || 0,
          color: '#3b82f6', // azul
        },
        {
          name: 'Máximo',
          value: stayDurationStats.maxMinutes || 0,
          color: '#f59e0b', // laranja
        },
      ].filter((item) => item.value > 0)
    : [];

  // Dados para gráfico de reservas ativas
  const activePeriodChartData = activeDuringPeriodStats
    ? [
        {
          name: 'Normais',
          value: activeDuringPeriodStats.reserva,
          color: '#3b82f6', // azul
        },
        {
          name: 'Rápidas',
          value: activeDuringPeriodStats.reservaRapida,
          color: '#f59e0b', // laranja
        },
      ].filter((item) => item.value > 0)
    : [];

  // Dados para gráfico de ocupação por comprimento
  const lengthOccupancyChartData = lengthOccupancyStats
    ? [
        {
          name: 'Ocupado',
          value: lengthOccupancyStats.occupiedLengthMeters,
          color: '#8b5cf6', // roxo
        },
        {
          name: 'Disponível',
          value: Math.max(
            0,
            lengthOccupancyStats.availableLengthMeters -
              lengthOccupancyStats.occupiedLengthMeters,
          ),
          color: '#d1d5db', // cinza
        },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Header da seção */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Métricas Avançadas</h2>
      </div>

      {/* Grid de 3 cards (responsivo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* ==================== CARD 1: TEMPO DE PERMANÊNCIA ==================== */}
        {hasStayDurationData ? (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Tempo de Permanência
              </CardTitle>
              <span className="text-xs text-gray-500">Média</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gráfico de barras */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stayDurationChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`${value} min`, 'Tempo']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                      {stayDurationChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Valor destacado */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatMinutes(stayDurationStats?.avgMinutes)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Tempo médio por reserva
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Card vazio (sem dados)
          <Card className="hover:shadow-lg transition-shadow opacity-50">
            <CardContent className="flex flex-col items-center justify-center h-full p-6 min-h-[200px]">
              <Clock className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 text-center text-sm">
                Nenhum dado de tempo de permanência
              </p>
            </CardContent>
          </Card>
        )}

        {/* ==================== CARD 2: RESERVAS ATIVAS ==================== */}
        {hasActivePeriodData ? (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Reservas Ativas no Período
              </CardTitle>
              <span className="text-xs text-gray-500">Overlap</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gráfico de barras */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activePeriodChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [value, 'Reservas']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                      {activePeriodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Valor destacado */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {activeDuringPeriodStats?.total}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Reservas ativas em qualquer momento do período
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Card vazio (sem dados)
          <Card className="hover:shadow-lg transition-shadow opacity-50">
            <CardContent className="flex flex-col items-center justify-center h-full p-6 min-h-[200px]">
              <Users className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 text-center text-sm">
                Nenhum dado de reservas ativas
              </p>
            </CardContent>
          </Card>
        )}

        {/* ==================== CARD 3: OCUPAÇÃO POR COMPRIMENTO ==================== */}
        {hasLengthOccupancyData ? (
          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4 text-purple-500" />
                Ocupação por Comprimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gráfico de pizza */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lengthOccupancyChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label
                    >
                      {lengthOccupancyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} m`, 'Comprimento']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Taxa de ocupação */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Taxa de ocupação:</span>
                  <span className="text-lg font-bold text-purple-600">
                    {lengthOccupancyStats?.occupancyRatePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Card vazio (sem dados)
          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1 opacity-50">
            <CardContent className="flex flex-col items-center justify-center h-full p-6 min-h-[200px]">
              <Ruler className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 text-center text-sm">
                Nenhum dado de ocupação por comprimento
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}