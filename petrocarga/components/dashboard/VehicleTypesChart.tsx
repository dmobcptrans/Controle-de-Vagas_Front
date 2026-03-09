'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleType } from '@/lib/types/dashboard';
import { Car, Truck, Bike } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface VehicleTypesChartProps {
  data: VehicleType[];
}

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

export function VehicleTypesChart({ data }: VehicleTypesChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map((item) => ({
    name: item.type,
    total: item.count,
    únicos: item.uniqueVehicles,
    média:
      item.uniqueVehicles > 0
        ? parseFloat((item.count / item.uniqueVehicles).toFixed(1))
        : 0,
    percentual:
      total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0,
  }));

  const getColor = (index: number) => {
    const colors = [
      '#3b82f6', // blue-500
      '#10b981', // green-500
      '#f59e0b', // yellow-500
      '#ef4444', // red-500
      '#8b5cf6', // purple-500
      '#ec4899', // pink-500
    ];
    return colors[index % colors.length];
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'automovel':
        return <Car className="h-4 w-4" />;
      case 'vuc':
        return <Truck className="h-4 w-4" />;
      case 'moto':
        return <Bike className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: TooltipPayload, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'percentual' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full p-4 md:p-6 min-h-[300px]">
          <Car className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-3" />
          <p className="text-gray-600 text-center text-sm md:text-base">
            Nenhum dado de tipos de veículo disponível
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Tipos de Veículos
          <span className="text-sm font-normal text-gray-500">
            ({total} reservas)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total" name="Total Reservas" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
                ))}
              </Bar>
              <Bar
                dataKey="únicos"
                name="Veículos Únicos"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Tipo mais comum</p>
            <p className="text-lg font-bold text-blue-700">
              {chartData[0]?.name || 'N/A'}
            </p>
            <p className="text-xs text-blue-600">
              {chartData[0]?.total || 0} reservas
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">Média geral</p>
            <p className="text-lg font-bold text-green-700">
              {chartData.length > 0
                ? (
                    chartData.reduce((sum, item) => sum + item.média, 0) /
                    chartData.length
                  ).toFixed(1)
                : 0}
            </p>
            <p className="text-xs text-green-600">reservas/veículo</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Detalhes por tipo:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColor(index) }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">{item.total}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({item.percentual}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
