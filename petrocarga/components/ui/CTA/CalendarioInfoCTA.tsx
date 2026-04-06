'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarioMes } from '@/context/CalendarioMesContext';

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function CalendarioInfoCTA() {
  const { ano, mes, irMesAnterior, irProximoMes } = useCalendarioMes();

  return (
    <div className="flex items-center justify-between gap-4 bg-[#071D41] rounded-2xl px-5 py-4 border-l-4 border-[#FFCD07]">

      {/* Seta esquerda */}
      <button
        onClick={irMesAnterior}
        className="bg-white/15 rounded-xl w-11 h-11  hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      {/* Mês central */}
      <span className="text-white font-semibold text-[18px] text-center select-none leading-tight min-w-[120px]">
        {MESES_PT[mes]}
        <span className="block text-white/40 text-[13px] font-normal">
          {ano}
        </span>
      </span>

      {/* Seta direita */}
      <button
        onClick={irProximoMes}
        className="bg-white/15 rounded-xl w-11 h-11 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all"
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

    </div>
  );
}