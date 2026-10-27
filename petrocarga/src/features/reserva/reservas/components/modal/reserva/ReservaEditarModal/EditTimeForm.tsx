
import TimeSelection from '@/features/reserva/reservar-vaga/components/steps/TimeSelection';

interface EditTimeFormProps {
  step: number;
  availableTimes: string[];
  availableTimesNextDay: string[];
  podeContinuarNoDiaSeguinte: boolean;
  reservedTimesStart: string[];
  reservedTimesEnd: string[];
  startHour: string | null;
  endHour: string | null;

  onSelectStart: (t: string) => void;
  onSelectEnd: (t: string) => void;

  onBackToStart: () => void;
  onBack: () => void;
}

export function EditTimeForm({
  step,
  availableTimes,
  availableTimesNextDay,
  podeContinuarNoDiaSeguinte,
  reservedTimesStart,
  reservedTimesEnd,
  startHour,
  endHour,
  onSelectStart,
  onSelectEnd,
  onBackToStart,
  onBack,
}: EditTimeFormProps) {
  const toMinutes = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };

  const horariosFinais = [
    ...availableTimes.filter(
      (t) => startHour !== null && toMinutes(t) > toMinutes(startHour),
    ),
    ...(podeContinuarNoDiaSeguinte
      ? availableTimesNextDay.map((t) => `D+1 ${t}`)
      : []),
  ];

  return (
    <div className="flex w-full flex-col">
      {/* ETAPA 3: HORÁRIO INICIAL */}
      {step === 3 && (
        <div className="w-full">
          <TimeSelection
            times={availableTimes}
            reserved={reservedTimesStart}
            selected={startHour}
            onSelect={onSelectStart}
            onBack={onBack}
            color="blue"
          />
        </div>
      )}

      {/* ETAPA 4: HORÁRIO FINAL */}
      {step === 4 && startHour && (
        <div className="w-full">
          <TimeSelection
            times={horariosFinais}
            reserved={reservedTimesEnd}
            selected={endHour}
            onSelect={onSelectEnd}
            onBack={onBackToStart}
            color="blue"
          />
        </div>
      )}
    </div>
  );
}
