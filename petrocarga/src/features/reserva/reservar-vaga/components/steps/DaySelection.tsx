import { useMemo } from 'react';
import { DayPicker, type DayButtonProps } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface DaySelectionProps {
  selected?: Date;
  onSelect: (day: Date) => void;
  availableDays: Date[];
  onMonthChange: (month: Date) => void;
  onBack?: () => void;
  loading?: boolean;
}

export default function DaySelection({
  selected,
  onSelect,
  availableDays,
  onMonthChange,
  loading = false,
  onBack,
}: DaySelectionProps) {
  const today = new Date();

  const normalizeDate = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Limite: hoje + 2 dias
  const maxSelectableDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 2,
  );

  const availableDaysSet = useMemo(() => {
    return new Set(
      availableDays.map((date) => {
        const normalized = normalizeDate(date);

        return `${normalized.getFullYear()}-${normalized.getMonth()}-${normalized.getDate()}`;
      }),
    );
  }, [availableDays]);

  const getDateKey = (date: Date) => {
    const normalized = normalizeDate(date);

    return `${normalized.getFullYear()}-${normalized.getMonth()}-${normalized.getDate()}`;
  };

  const isAvailable = (date: Date) =>
    availableDaysSet.has(getDateKey(date));

  const isDisabled = (date: Date) => {
    const normalized = normalizeDate(date);

    return (
      normalized < normalizeDate(today) ||
      normalized > maxSelectableDate ||
      !isAvailable(date)
    );
  };

  const isBeyondLimit = (date: Date) =>
    normalizeDate(date) > maxSelectableDate;

  const isTodayOrFuture = (date: Date) =>
    normalizeDate(date) >= normalizeDate(today);

  const getSkeletonDelay = (date: Date) => {
    const seed =
      date.getDate() + date.getMonth() * 31 + date.getFullYear() * 365;

    return -((seed * 137) % 1200);
  };

  const CustomDayButton = (props: DayButtonProps) => {
    const { day, modifiers, ...buttonProps } = props;

    const date = day.date;

    const showSkeleton =
      loading && isTodayOrFuture(date) && !modifiers.outside;

    const beyondLimit = isBeyondLimit(date);

    return (
      <button
        {...buttonProps}
        disabled={loading || modifiers.disabled}
        className={`
          relative flex h-12 w-12 items-center justify-center
          rounded-full transition-all duration-200

          ${
            modifiers.selected
              ? 'bg-blue-800 text-white shadow-sm'
              : ''
          }

          ${
            modifiers.today && !modifiers.selected
              ? 'bg-blue-50 font-bold text-blue-800'
              : ''
          }

          ${
            beyondLimit
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : ''
          }

          ${
            modifiers.disabled && !beyondLimit
              ? 'text-gray-400 opacity-50 cursor-not-allowed'
              : ''
          }

          ${
            !modifiers.disabled && !modifiers.selected
              ? 'hover:bg-blue-100'
              : ''
          }
        `}
        title={
          beyondLimit
            ? 'Disponível somente nos próximos dias'
            : undefined
        }
      >
        {showSkeleton ? (
          <span
            className="z-1 h-10 w-10 animate-pulse rounded-full bg-blue-800"
            style={{
              animationDelay: `${getSkeletonDelay(date)}ms`,
            }}
            aria-hidden="true"
          />
        ) : (
          date.getDate()
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3 justify-center w-full max-w-xl mx-auto px-2 sm:px-0">
      <div className="flex justify-center">
        <DayPicker
          mode="single"
          locale={ptBR}
          navLayout="around"
          animate
          selected={selected}
          onDayClick={(day) => {
            if (!isDisabled(day)) {
              onSelect(day);
            }
          }}
          onMonthChange={onMonthChange}
          className="mx-auto"
          disabled={isDisabled}
          components={{
            DayButton: CustomDayButton,
          }}
          modifiersClassNames={{
            selected: 'bg-blue-800 text-white',
            disabled: 'cursor-not-allowed',
            today: 'bg-blue-50 font-bold',
          }}
          modifiersStyles={{
            disabled: {
              cursor: 'not-allowed',
            },
          }}
        />
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-800" />
          <span>Selecionado</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-50 border border-blue-200" />
          <span>Hoje</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-gray-200" />
          <span>Fora do período</span>
        </div>
      </div>

      {onBack && (
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl bg-gray-200 px-4 py-3 text-sm hover:bg-gray-300 sm:w-auto"
          onClick={onBack}
        >
          Voltar
        </button>
      )}
    </div>
  );
}