import TimeSelection from '../../../reserva/TimeSelection';

interface EditTimeFormProps {
  step: number;
  availableTimes: string[];
  reservedTimesStart: string[];
  reservedTimesEnd: string[];
  startHour: string | null;
  endHour: string | null;

  onSelectStart: (t: string) => void;
  onSelectEnd: (t: string) => void;

  onBackToStart: () => void; // 👈 NOVO
  onBack: () => void;
}

export function EditTimeForm({
  step,
  availableTimes,
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

  return (
    <div className="w-full flex flex-col">
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

      {step === 4 && startHour && (
        <div className="w-full">
          <TimeSelection
            times={availableTimes.filter(
              (t) => toMinutes(t) > toMinutes(startHour),
            )}
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
