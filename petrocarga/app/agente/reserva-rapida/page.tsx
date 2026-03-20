'use client';

import { useState } from 'react';
import { MapReserva } from '@/components/map/MapReserva';
import ReservaRapida from '@/components/agente/reservaRapida/reservaRapidaComponent';
import { Vaga } from '@/lib/types/vaga';

export default function ReservaRapidaPage() {
  const [step, setStep] = useState<'mapa' | 'reserva'>('mapa');
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);

  const handleSelectVaga = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    setStep('reserva');
  };

  const handleBackToMap = () => {
    setStep('mapa');
    setSelectedVaga(null);
  };

  return (
    <div className="px-2 md:p-6 max-w-6xl mx-auto mt-6 md:mt-10">
      {step === 'mapa' && (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-lg md:text-2xl font-semibold text-center mb-4">
            Selecione uma Vaga
          </h1>
          <div className="w-full h-[calc(88vh-120px)] md:h-[70vh] lg:h-[75vh] rounded-lg overflow-hidden shadow-md mb-4">
            <MapReserva onClickVaga={handleSelectVaga} />
          </div>
        </div>
      )}

      {step === 'reserva' && selectedVaga && (
        <ReservaRapida selectedVaga={selectedVaga} onBack={handleBackToMap} />
      )}
    </div>
  );
}
