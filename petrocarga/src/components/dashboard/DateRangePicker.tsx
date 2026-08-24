'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  onDateChange: (startDate: string, endDate: string) => void;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
}

/**
 * @component DateRangePicker
 * @version 1.0.0
 * 
 * @description Componente de seleção de intervalo de datas.
 * Permite escolher data inicial e final via calendário ou botões rápidos.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. BOTÕES RÁPIDOS:
 *    - Hoje: seleciona a data atual
 *    - Ontem: seleciona o dia anterior
 *    - Últimos 7 dias: intervalo dos últimos 7 dias
 * 
 * 2. SELETORES DE DATA:
 *    - Data inicial (popover com calendário)
 *    - Data final (popover com calendário)
 *    - Calendário com locale pt-BR
 * 
 * 3. FEEDBACK:
 *    - Botões com labels atualizados em tempo real
 *    - Formato brasileiro (dd/MM/yyyy)
 *    - Indicador "até" entre os seletores
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useCallback: Memoiza handleDateChangeCallback para evitar re-renders
 * - useEffect: Dispara onDateChange sempre que datas mudam
 * - Responsividade: 
 *   - Desktop: seletores lado a lado com "até" entre eles
 *   - Mobile: seletores empilhados com "até" separado
 * 
 * - FORMATO DAS DATAS:
 *   - Exibição: dd/MM/yyyy (pt-BR)
 *   - Envio: ISO string (toISOString())
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Calendar: Componente de calendário (shadcn/ui)
 * - Popover: Menu flutuante (shadcn/ui)
 * - date-fns: Formatação de datas com locale pt-BR
 * 
 * @example
 * ```tsx
 * <DateRangePicker
 *   onDateChange={(start, end) => {
 *     console.log('Período:', start, end);
 *   }}
 *   defaultStartDate={new Date('2024-01-01')}
 *   defaultEndDate={new Date('2024-01-31')}
 * />
 * ```
 */

export function DateRangePicker({
  onDateChange,
  defaultStartDate = new Date(),
  defaultEndDate = new Date(),
}: DateRangePickerProps) {
  const [dateFrom, setDateFrom] = useState<Date>(defaultStartDate);
  const [dateTo, setDateTo] = useState<Date>(defaultEndDate);

  // --------------------------------------------------------------------------
  // CALLBACK DE NOTIFICAÇÃO
  // --------------------------------------------------------------------------
  
  /**
   * @function handleDateChangeCallback
   * @description Dispara onDateChange com as datas selecionadas
   * Memorizado com useCallback para evitar re-renders desnecessários
   */
  const handleDateChangeCallback = useCallback(() => {
    if (dateFrom && dateTo) {
      const startDate = dateFrom.toISOString();
      const endDate = dateTo.toISOString();
      onDateChange(startDate, endDate);
    }
  }, [dateFrom, dateTo, onDateChange]);

  // --------------------------------------------------------------------------
  // EFEITO - NOTIFICA MUDANÇAS
  // --------------------------------------------------------------------------
  
  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    onDateChange(dateFrom.toISOString(), dateTo.toISOString());
  }, [dateFrom, dateTo]);

  // --------------------------------------------------------------------------
  // HANDLERS DOS BOTÕES RÁPIDOS
  // --------------------------------------------------------------------------
  
  const handleToday = () => {
    const today = new Date();
    setDateFrom(today);
    setDateTo(today);
  };

  const handleYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setDateFrom(yesterday);
    setDateTo(yesterday);
  };

  const handleLast7Days = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    setDateFrom(lastWeek);
    setDateTo(today);
  };

  return (
    <div className="space-y-3">
      
      {/* ==================== BOTÕES RÁPIDOS ==================== */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="text-xs flex-1 min-w-[80px]"
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleYesterday}
          className="text-xs flex-1 min-w-[80px]"
        >
          Ontem
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLast7Days}
          className="text-xs flex-1 min-w-[80px]"
        >
          Últimos 7 dias
        </Button>
      </div>

      {/* ==================== SELETORES DE DATA ==================== */}
      <div className="flex flex-col sm:flex-row gap-2">
        
        {/* Seletor de data inicial */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full sm:flex-1 justify-start text-left font-normal',
                !dateFrom && 'text-muted-foreground',
              )}
              size="sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {dateFrom
                  ? format(dateFrom, 'dd/MM/yyyy', { locale: ptBR })
                  : 'Data inicial'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(day) => day && setDateFrom(day)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        {/* Separador "até" (desktop) */}
        <div className="hidden sm:flex items-center justify-center text-gray-500">
          até
        </div>

        {/* Seletor de data final */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full sm:flex-1 justify-start text-left font-normal',
                !dateTo && 'text-muted-foreground',
              )}
              size="sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {dateTo
                  ? format(dateTo, 'dd/MM/yyyy', { locale: ptBR })
                  : 'Data final'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(day) => day && setDateTo(day)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Indicador "até" para mobile */}
      <div className="sm:hidden text-center text-xs text-gray-500">até</div>
    </div>
  );
}