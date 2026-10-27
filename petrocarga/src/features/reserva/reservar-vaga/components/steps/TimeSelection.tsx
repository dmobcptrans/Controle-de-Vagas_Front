
interface TimeSelectionProps {
  times: string[];
  reserved: string[];
  selected: string | null;
  onSelect: (time: string) => void;
  onBack?: () => void;
  color?: 'blue' | 'green';
}

type TimeOption = {
  value: string;
  hour: string;
  nextDay: boolean;
};

function parseTime(value: string): TimeOption {
  const nextDay = value.startsWith('D+1 ');
  const hour = nextDay ? value.slice(4) : value;

  return {
    value,
    hour,
    nextDay,
  };
}

export default function TimeSelection({
  times,
  reserved,
  selected,
  onSelect,
  onBack,
  color = 'blue',
}: TimeSelectionProps) {
  const hoverClass =
    color === 'blue'
      ? 'hover:bg-blue-500 hover:text-white'
      : 'hover:bg-green-500 hover:text-white';

  const selectedClass =
    color === 'blue'
      ? 'bg-blue-600 text-white border-blue-600'
      : 'bg-green-600 text-white border-green-600';

  const options = times.map(parseTime);

  const groups = [
    {
      label: 'Manhã',
      filter: (option: TimeOption) => {
        const hour = Number(option.hour.split(':')[0]);
        return !option.nextDay && hour < 12;
      },
    },
    {
      label: 'Tarde',
      filter: (option: TimeOption) => {
        const hour = Number(option.hour.split(':')[0]);
        return !option.nextDay && hour >= 12 && hour < 18;
      },
    },
    {
      label: 'Noite',
      filter: (option: TimeOption) => {
        const hour = Number(option.hour.split(':')[0]);
        return !option.nextDay && hour >= 18;
      },
    },
    {
      label: 'Dia seguinte',
      filter: (option: TimeOption) => option.nextDay,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col">
      <p className="mb-3 flex-shrink-0 text-center font-semibold">
        Escolha o horário
      </p>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        {groups.map(({ label, filter }) => {
          const group = options.filter(filter);

          if (group.length === 0) return null;

          return (
            <section key={label} className="mb-4">
              <p className="sticky top-0 z-10 bg-white/95 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm">
                {label}
              </p>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {group.map((option) => {
                  const disabled = reserved.includes(option.value);
                  const isSelected = selected === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(option.value)}
                      aria-pressed={isSelected}
                      className={`rounded border p-2 text-center transition ${
                        disabled
                          ? 'cursor-not-allowed border-gray-200 bg-gray-300 text-gray-500'
                          : `cursor-pointer ${hoverClass}`
                      } ${
                        isSelected ? selectedClass : 'border-gray-200'
                      }`}
                    >
                      <span className="block">{option.hour}</span>

                      {option.nextDay && (
                        <span className="mt-1 block text-[10px] leading-tight">
                          Dia seguinte
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {onBack && (
        <button
          type="button"
          className="w-full rounded-xl bg-gray-200 px-4 py-3 text-sm hover:bg-gray-300 sm:w-auto sm:text-base"
          onClick={onBack}
        >
          Voltar
        </button>
      )}
    </div>
  );
}
