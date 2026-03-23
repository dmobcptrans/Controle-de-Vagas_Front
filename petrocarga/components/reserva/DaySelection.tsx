import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface DaySelectionProps {
  selected?: Date;
  onSelect: (day: Date) => void;
  availableDays: Date[];
}

/**
 * @component DaySelection
 * @version 1.0.0
 * 
 * @description Componente de seleção de dia utilizando react-day-picker.
 * Exibe calendário com dias disponíveis destacados e desabilita dias indisponíveis.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {Date} [selected] - Data atualmente selecionada
 * @property {(day: Date) => void} onSelect - Callback ao selecionar um dia
 * @property {Date[]} availableDays - Lista de dias disponíveis para reserva
 * 
 * ----------------------------------------------------------------------------
 * 🎨 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. DIAS DISPONÍVEIS:
 *    - Definidos pelo array availableDays
 *    - Dias com disponibilidade podem ser selecionados
 * 
 * 2. DIAS DESABILITADOS:
 *    - Dias anteriores ao dia atual (isBeforeDay)
 *    - Dias não presentes no Set de availableDays
 *    - Estilo: texto cinza, opacidade reduzida, cursor not-allowed
 * 
 * 3. DIA SELECIONADO:
 *    - Fundo azul (bg-blue-600)
 *    - Texto branco
 *    - Formato circular (rounded-full)
 * 
 * 4. DIA ATUAL:
 *    - Fundo cinza claro (bg-gray-100)
 *    - Texto semibold
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useMemo: Cria Set de availableDays para comparação O(1)
 * - NORMALIZAÇÃO: Remove horas/minutos/segundos para comparação de datas
 * - LOCALE: ptBR para português do Brasil
 * - MODIFIERS: Classes customizadas para selected, disabled, today
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - TimeSelection: Seleção de horários
 * - StepIndicator: Indicador de progresso
 * 
 * @example
 * ```tsx
 * <DaySelection
 *   selected={selectedDay}
 *   onSelect={setSelectedDay}
 *   availableDays={availableDates}
 * />
 * ```
 */

export default function DaySelection({
  selected,
  onSelect,
  availableDays,
}: DaySelectionProps) {
  const today = new Date();

  /**
   * @function isBeforeDay
   * @description Verifica se a primeira data é anterior à segunda (ignorando horas)
   */
  const isBeforeDay = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1 < d2;
  };

  /**
   * Cria um Set com os dias disponíveis normalizados
   * Usa useMemo para evitar recriação desnecessária
   */
  const availableDaysSet = useMemo(() => {
    return new Set(
      availableDays.map((d) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(),
      ),
    );
  }, [availableDays]);

  /**
   * @function isDisabled
   * @description Determina se uma data deve estar desabilitada
   * - Datas anteriores ao dia atual
   * - Datas não disponíveis no Set
   */
  const isDisabled = (date: Date) => {
    const normalized = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).toISOString();

    return !availableDaysSet.has(normalized) || isBeforeDay(date, today);
  };

  return (
    <div className="flex justify-center">
      <div>
        <p className="font-semibold mb-4 text-center text-lg">
          Selecione o dia:
        </p>

        <DayPicker
          mode="single"
          locale={ptBR}
          selected={selected}
          onDayClick={onSelect}
          className="mx-auto"
          disabled={isDisabled}
          modifiersClassNames={{
            selected:
              'bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full',
            disabled: 'text-gray-400 opacity-50 cursor-not-allowed',
            today: 'bg-gray-100 font-semibold',
          }}
          modifiersStyles={{
            disabled: {
              backgroundColor: '#f9fafb',
            },
          }}
        />
      </div>
    </div>
  );
}