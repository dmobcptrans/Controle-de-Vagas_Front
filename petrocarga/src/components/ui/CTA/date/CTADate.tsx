'use client';

import { useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  Menu,
  X,
} from 'lucide-react';

import { CTA } from '../CTA';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/features/dashboard/components/gestor/DateRangePicker';

interface CTADateProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  onDateChange: (
    startDate: string,
    endDate: string
  ) => void;
}

export function CTADate({
  dateRange,
  onDateChange,
}: CTADateProps) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const hasRange = Boolean(
    dateRange.startDate && dateRange.endDate
  );

  const formattedRange = hasRange
    ? `${new Date(
        dateRange.startDate.split('T')[0]
      ).toLocaleDateString('pt-BR')} até ${new Date(
        dateRange.endDate.split('T')[0]
      ).toLocaleDateString('pt-BR')}`
    : 'Selecione um período';

  const limparPeriodo = () => {
    onDateChange('', '');
  };

  const toggleFiltros = () => {
    setFiltrosAbertos((prev) => !prev);
  };

  return (
    <CTA className="block overflow-hidden p-0 " unstyled>
      {/* Barra principal */}
      <div className="w-full px-5 py-4">
        <div className="flex items-center gap-3">

          {/* Resumo do período */}
          <button
            type="button"
            onClick={toggleFiltros}
            className={`
              relative
              flex-1
              flex
              items-center
              gap-2
              rounded-xl
              px-3
              py-2.5
              text-left
              transition-all
              ${
                filtrosAbertos
                  ? 'bg-white/15 border border-[#FFCD07]/60'
                  : 'bg-white/10 border border-white/10'
              }
            `}
          >
            <Calendar
              className={`
                h-4
                w-4
                flex-shrink-0
                ${
                  filtrosAbertos
                    ? 'text-[#FFCD07]'
                    : 'text-white/45'
                }
              `}
            />

            <span
              className={`
                flex-1
                text-sm
                truncate
                ${
                  hasRange
                    ? 'text-white'
                    : 'text-white/35'
                }
              `}
            >
              {formattedRange}
            </span>

            {hasRange && (
              <span
                role="button"
                aria-label="Limpar período"
                onClick={(e) => {
                  e.stopPropagation();
                  limparPeriodo();
                }}
                className="rounded-full p-1 hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5 text-white/70" />
              </span>
            )}
          </button>

          {/* Botão de filtros */}
          <button
            type="button"
            onClick={toggleFiltros}
            aria-label={
              filtrosAbertos
                ? 'Fechar filtros'
                : 'Abrir filtros'
            }
            className={`
              relative
              h-11
              w-11
              flex
              items-center
              justify-center
              rounded-xl
              transition-all
              duration-300
              cursor-pointer
              ${
                filtrosAbertos
                  ? 'bg-[#FFCD07]/18 border border-[#FFCD07]/50'
                  : 'bg-white/10 border border-white/10'
              }
            `}
          >
            <Menu
              className={`
                h-5
                w-5
                text-white
                transition-transform
                duration-300
                ${filtrosAbertos ? 'rotate-90' : ''}
              `}
            />

            {hasRange && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FFCD07]" />
            )}
          </button>
        </div>
      </div>

      {/* Drawer dos filtros */}
      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ease-in-out
          text-black
          ${
            filtrosAbertos
              ? 'max-h-[500px] opacity-100'
              : 'max-h-0 opacity-0'
          }
        `}
      >
        <div className="border-t border-white/10 px-5 py-5 space-y-5">

          {/* Seletor */}
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50 mb-3">
              Período
            </p>

            <DateRangePicker
              onDateChange={onDateChange}
            />
          </div>

          {/* Limpar */}
          {hasRange && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={limparPeriodo}
            >
              <X className="mr-2 h-4 w-4" />
              Limpar filtro de data
            </Button>
          )}

          {/* Status */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 min-w-0">
              <CalendarCheck className="h-4 w-4 flex-shrink-0 text-[#FFCD07]" />

              <span className="text-sm text-white/80 truncate">
                {hasRange
                  ? `Mostrando dados de ${formattedRange}`
                  : 'Nenhum período selecionado'}
              </span>
            </div>

            {hasRange && (
              <span className="ml-3 flex-shrink-0 text-xs rounded-full bg-[#FFCD07] px-2 py-1 text-[#071D41] font-semibold">
                Filtro ativo
              </span>
            )}
          </div>
        </div>
      </div>
    </CTA>
  );
}

