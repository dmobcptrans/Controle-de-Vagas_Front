import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface DaySelectionProps {
  selected?: Date;
  onSelect: (day: Date) => void;
  availableDays: Date[];
}

export default function DaySelection({
  selected,
  onSelect,
  availableDays,
}: DaySelectionProps) {
  const today = new Date();

  const isBeforeDay = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1 < d2;
  };

  const availableDaysSet = useMemo(() => {
    return new Set(
      availableDays.map((d) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(),
      ),
    );
  }, [availableDays]);

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
