'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { CTA } from '../CTA';
import { useCalendarioMes } from '@/contexts/CalendarioMesContext';

const MESES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default function CTAMonth() {
  const {
    ano,
    mes,
    irMesAnterior,
    irProximoMes,
  } = useCalendarioMes();

  return (
    <CTA className="px-5 py-4">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Mês anterior */}
        <button
          type="button"
          onClick={irMesAnterior}
          className="
            w-11 h-11
            flex items-center justify-center
            rounded-xl
            bg-white/15
            hover:bg-white/20
            active:scale-95
            transition-all
            flex-shrink-0
          "
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Mês atual */}
        <div className="text-white text-center select-none leading-tight min-w-[120px]">
          <p className="font-semibold text-[18px]">
            {MESES_PT[mes]}
          </p>

          <p className="text-white/40 text-[13px] font-normal">
            {ano}
          </p>
        </div>

        {/* Próximo mês */}
        <button
          type="button"
          onClick={irProximoMes}
          className="
            w-11 h-11
            flex items-center justify-center
            rounded-xl
            bg-white/15
            hover:bg-white/20
            active:scale-95
            transition-all
            flex-shrink-0
          "
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </CTA>
  );
}