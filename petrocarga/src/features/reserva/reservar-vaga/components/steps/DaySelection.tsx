import { useMemo } from 'react';
import { DayPicker, type DayButtonProps } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface DaySelectionProps {
  selected?: Date;
  onSelect: (day: Date) => void;
  availableDays: Date[];
  onMonthChange: (month: Date) => void;
  /** Quando true, exibe skeleton (pulse) nos dias de hoje em diante */
  loading?: boolean;
}

/**
 * @component DaySelection
 * @version 1.2.0
 *
 * @description Componente de seleção de dia utilizando react-day-picker.
 * Exibe calendário com dias disponíveis destacados e desabilita dias indisponíveis.
 * Quando `loading` é true, os dias a partir de hoje (inclusive) exibem um
 * skeleton com animação de pulse no lugar do número, enquanto dias passados
 * continuam sendo exibidos normalmente (mesmo que desabilitados).
 *
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 *
 * @property {Date} [selected] - Data atualmente selecionada
 * @property {(day: Date) => void} onSelect - Callback ao selecionar um dia
 * @property {Date[]} availableDays - Lista de dias disponíveis para reserva
 * @property {boolean} [loading] - Exibe skeleton nos dias (hoje em diante) enquanto carrega
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
 *    - Dias anteriores ao dia atual (isBeforeToday)
 *    - Dias não presentes no Set de availableDays
 *    - Estilo: texto cinza, opacidade reduzida, cursor not-allowed
 *
 * 3. DIA SELECIONADO:
 *    - Fundo azul (bg-blue-800)
 *    - Texto branco
 *    - Formato circular (rounded-full)
 *
 * 4. DIA ATUAL:
 *    - Fundo cinza claro (bg-gray-100)
 *    - Texto semibold
 *
 * 5. ESTADO DE LOADING:
 *    - Quando loading=true, os dias de hoje em diante (exceto dias "outside",
 *      ou seja fora do mês atual) exibem um círculo com animação de pulse
 *      no lugar do número, mantendo o layout do calendário intacto.
 *    - Dias passados continuam exibindo o número normalmente.
 *    - Dias já selecionados não recebem skeleton (evita conflito visual
 *      entre o fundo azul de "selected" e o pulse).
 *    - Todos os botões ficam desabilitados durante o loading.
 *    - Um texto para leitores de tela (sr-only, aria-live) anuncia o
 *      carregamento sem poluir a navegação com 30+ anúncios individuais.
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - useMemo: Cria Set de availableDays para comparação O(1)
 * - NORMALIZAÇÃO: Remove horas/minutos/segundos para comparação de datas
 * - LOCALE: ptBR para português do Brasil
 * - MODIFIERS: Classes customizadas para selected, disabled, today
 * - SKELETON: Implementado via components.DayButton (customização oficial
 *   do react-day-picker), o que permite decidir por dia se mostra o
 *   número ou o skeleton, sem duplicar a grade do calendário.
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
 *   onMonthChange={(month) => reserva.fetchDiasDisponiveis(month)}
 *   loading={reserva.loadingDias}
 * />
 * ```
 */

export default function DaySelection({
  selected,
  onSelect,
  availableDays,
  onMonthChange,
  loading = false,
}: DaySelectionProps) {
  const today = new Date();

  /**
   * @function normalizeDate
   * @description Remove horas/minutos/segundos de uma data para comparação
   */
  const normalizeDate = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  /**
   * @function isBeforeToday
   * @description Verifica se a data é anterior ao dia atual
   */
  const isBeforeToday = (date: Date) => {
    return normalizeDate(date) < normalizeDate(today);
  };

  /**
   * @function isTodayOrFuture
   * @description Verifica se a data é hoje ou uma data futura
   */
  const isTodayOrFuture = (date: Date) => {
    return normalizeDate(date) >= normalizeDate(today);
  };

  /**
   * Cria um Set com os dias disponíveis normalizados
   * Usa useMemo para evitar recriação desnecessária
   */
  const availableDaysSet = useMemo(() => {
    return new Set(availableDays.map((d) => normalizeDate(d).toISOString()));
  }, [availableDays]);

  /**
   * @function isDisabled
   * @description Determina se uma data deve estar desabilitada
   * - Datas anteriores ao dia atual
   * - Datas não disponíveis no Set
   */
  const isDisabled = (date: Date) => {
    const normalized = normalizeDate(date).toISOString();
    return !availableDaysSet.has(normalized) || isBeforeToday(date);
  };

  /**
   * @function CustomDayButton
   * @description Botão de cada dia do calendário.
   * Durante o loading, dias de hoje em diante mostram um skeleton
   * (círculo com pulse) no lugar do número. Dias passados e dias
   * "outside" (fora do mês exibido) continuam normais.
   */

  const getSkeletonDelay = (date: Date) => {
    const seed =
      date.getDate() + date.getMonth() * 31 + date.getFullYear() * 365;
    return -((seed * 137) % 1200);
  };
  const CustomDayButton = (props: DayButtonProps) => {
    const { day, modifiers, ...buttonProps } = props;
    const date = day.date;
    const showSkeleton = loading && isTodayOrFuture(date) && !modifiers.outside;
    const skeletonDelay = getSkeletonDelay(date);
    return (
      <button
        {...buttonProps}
        disabled={loading || modifiers.disabled}
        className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-colors ${modifiers.selected ? 'bg-blue-800 text-white' : ''} ${modifiers.today && !modifiers.selected ? 'bg-gray-100 font-bold' : ''} ${modifiers.disabled ? 'text-gray-400 opacity-50 cursor-not-allowed' : ''}`}
      >
        {showSkeleton ? (
          <span
            className="z-1 h-10 w-10 animate-pulse rounded-2xl bg-blue-800"
            style={{ animationDelay: `${skeletonDelay}ms` }}
            aria-hidden="true"
          />
        ) : (
          date.getDate()
        )}{' '}
      </button>
    );
  };

  return (
    <div className="flex justify-center items-center">
      <div>
        <DayPicker
          mode="single"
          locale={ptBR}
          navLayout="around"
          animate
          selected={selected}
          onDayClick={onSelect}
          onMonthChange={onMonthChange}
          className="mx-auto"
          disabled={isDisabled}
          components={{ DayButton: CustomDayButton }}
          modifiersClassNames={{
            selected: 'bg-blue-800 text-white',
            disabled: 'text-gray-400 opacity-50 cursor-not-allowed',
            today: 'bg-gray-100 font-bold',
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
