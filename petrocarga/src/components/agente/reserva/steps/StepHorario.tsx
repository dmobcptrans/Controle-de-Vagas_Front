'use client';

import TimeSelection from '@/components/reserva/TimeSelection';

interface StepHorarioProps {
  startHour: string;
  endHour: string | null;
  availableTimes: string[];
  reservedTimesEnd: string[];
  onSelect: (time: string) => void;
  onBack: () => void;
}

function toMinutes(h: string) {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
}

export default function StepHorario({
  startHour,
  endHour,
  availableTimes,
  reservedTimesEnd,
  onSelect,
  onBack,
}: StepHorarioProps) {
  const filteredTimes = availableTimes.filter(
    (t) => toMinutes(t) > toMinutes(startHour),
  );

  return (
    <div className="p-2">
      <h3 className="text-md font-semibold text-gray-700 mb-1">
        Até quando deseja reservar?
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Início:{' '}
        <span className="font-medium text-gray-600">{startHour}</span> (agora)
      </p>
      <TimeSelection
        times={filteredTimes}
        reserved={reservedTimesEnd}
        selected={endHour}
        onSelect={onSelect}
        onBack={onBack}
        color="blue"
      />
    </div>
  );
}