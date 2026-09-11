'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * @component KPICard
 * @version 1.0.0
 * 
 * @description Card de exibição de Indicador-Chave de Performance (KPI).
 * Exibe métricas com título, valor, ícone e opcionalmente descrição e tendência.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {string} title - Título do KPI (ex: "Total de Vagas")
 * @property {string | number} value - Valor principal (ex: "150", "85%")
 * @property {LucideIcon} icon - Ícone Lucide (ex: ParkingSquare, Users)
 * @property {string} [description] - Texto descritivo adicional
 * @property {object} [trend] - Dados de tendência (variação percentual)
 * @property {number} trend.value - Valor da variação (ex: 5.2)
 * @property {boolean} trend.isPositive - true = positivo (verde), false = negativo (vermelho)
 * @property {string} [className] - Classes CSS adicionais
 * 
 * ----------------------------------------------------------------------------
 * 🎨 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * - TREND: 
 *   - Positivo: sinal "+", cor verde (text-green-600)
 *   - Negativo: sinal "-", cor vermelha (text-red-600)
 *   - Exibe mensagem "vs período anterior"
 * 
 * - RESPONSIVIDADE:
 *   - Valor: text-2xl (tamanho grande)
 *   - Hover: shadow-lg (sombra suave)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Card, CardHeader, CardContent, CardTitle: Componentes UI do shadcn/ui
 * - LucideIcon: Tipagem de ícones
 * - cn: Utilitário de concatenação de classes
 * 
 * @example
 * ```tsx
 * // Exemplo básico
 * <KPICard
 *   title="Total de Vagas"
 *   value={150}
 *   icon={ParkingSquare}
 * />
 * 
 * // Exemplo com descrição
 * <KPICard
 *   title="Taxa de Ocupação"
 *   value="75%"
 *   icon={TrendingUp}
 *   description="Uso das vagas"
 * />
 * 
 * // Exemplo com tendência
 * <KPICard
 *   title="Reservas Ativas"
 *   value={42}
 *   icon={Users}
 *   description="Reservas em andamento"
 *   trend={{
 *     value: 5.2,
 *     isPositive: true
 *   }}
 * />
 * ```
 */

export function KPICard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: KPICardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      
      {/* Header com título e ícone */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      
      {/* Conteúdo com valor */}
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        
        {/* Descrição opcional */}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        
        {/* Tendência opcional */}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600',
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-gray-500 ml-2">
              vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}