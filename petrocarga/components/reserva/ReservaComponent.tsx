'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/reserva/StepIndicator';
import DaySelection from '@/components/reserva/DaySelection';
import TimeSelection from '@/components/reserva/TimeSelection';
import OriginVehicleStep from '@/components/reserva/OriginVehicleStep';
import Confirmation from '@/components/reserva/Confirmation';
import { useReserva } from './hooks/useReserva';
import { Vaga } from '@/lib/types/vaga';
import toast from 'react-hot-toast';

interface ReservaComponentProps {
  selectedVaga: Vaga;
  onBack?: () => void;
}

export default function ReservaComponent({
  selectedVaga,
  onBack,
}: ReservaComponentProps) {
  const router = useRouter();
  const reserva = useReserva(selectedVaga);

  const {
    step,
    availableDates,
    setStep,
    selectedDay,
    setSelectedDay,
    availableTimes,
    reservedTimesStart,
    reservedTimesEnd,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    origin,
    setOrigin,
    entryCity,
    setEntryCity,
    selectedVehicleId,
    setSelectedVehicleId,
    vehicles,
    loadingHorarios,
    horariosCarregados,
    handleConfirm,
    reset,
  } = reserva;

  const [success, setSuccess] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const vehiclesForStep = vehicles.map((v) => ({
    id: v.id,
    name: `${v.marca} ${v.modelo}`,
    plate: v.placa,
  }));

  // ==========================
  // CONFIRMAR RESERVA
  // ==========================
  const onConfirm = async () => {
    const result = await handleConfirm();

    if (!result.success) {
      toast.error('Erro ao confirmar reserva');
    } else {
      toast.success('Reserva confirmada com sucesso!');
    }

    setSuccess(result.success);
    setFeedbackMessage(result.message ?? null);
    setStep(6);
  };

  const toMinutes = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };

  return (
    <div className="p-4 sm:p-6 border rounded-xl shadow-lg max-w-2xl mx-auto bg-white min-h-[80vh] flex flex-col gap-4">
      {onBack && step < 6 && (
        <button
          onClick={onBack}
          className="px-3 py-2 w-fit bg-gray-200 rounded-lg text-sm sm:text-base"
        >
          Voltar ao mapa
        </button>
      )}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Reservando Vaga Em
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center leading-tight">
          {selectedVaga.endereco.logradouro}
          <span className="block text-base sm:text-lg font-medium text-gray-500 mt-1">
            {selectedVaga.endereco.bairro}
          </span>
        </h2>
      </div>

      {step < 6 && <StepIndicator step={step} />}

      <div className="flex-1 flex flex-col overflow-y-auto pb-4">
        {/* STEP 1 - Seleção do dia */}
        {step === 1 && (
          <DaySelection
            selected={selectedDay}
            onSelect={async (day) => {
              setSelectedDay(day);
              setStep(2);
            }}
            availableDays={availableDates}
          />
        )}

        {/* STEP 2 - Origem e veículo */}
        {step === 2 && (
          <OriginVehicleStep
            vehicles={vehiclesForStep}
            origin={origin}
            entryCity={entryCity}
            selectedVehicleId={selectedVehicleId}
            onOriginChange={setOrigin}
            onEntryCityChange={setEntryCity}
            onVehicleChange={setSelectedVehicleId}
            onNext={async (origin, entryCity, vehicleId) => {
              if (!selectedDay || !selectedVaga) return;

              setOrigin(origin);
              setEntryCity(entryCity);
              setSelectedVehicleId(vehicleId);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {/* STEP 3 - Seleção do horário inicial */}
        {step === 3 && selectedDay && (
          loadingHorarios || !horariosCarregados ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">
                Carregando horários disponíveis...
              </p>
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <p className="text-sm text-gray-600">
                Nenhum horário disponível para o dia selecionado.
              </p>
              <button
                onClick={() => setStep(2)}
                className="px-3 py-2 bg-gray-200 rounded-lg text-sm"
              >
                Voltar
              </button>
            </div>
          ) : (
            <TimeSelection
              times={availableTimes}
              reserved={reservedTimesStart}
              selected={startHour}
              onSelect={(t) => {
                setStartHour(t);
                setEndHour(null);
                setStep(4);
              }}
              onBack={() => setStep(2)}
              color="blue"
            />
          )
        )}

        {/* STEP 4 - Seleção do horário final */}
        {step === 4 && startHour && (
          <TimeSelection
            times={availableTimes.filter(
              (t) => toMinutes(t) > toMinutes(startHour),
            )}
            reserved={reservedTimesEnd}
            selected={endHour}
            onSelect={(t) => {
              setEndHour(t);
              setStep(5);
            }}
            onBack={() => setStep(3)}
            color="blue"
          />
        )}

        {/* STEP 5 - Confirmação */}
        {step === 5 && (
          <Confirmation
            day={selectedDay!}
            startHour={startHour!}
            endHour={endHour!}
            origin={origin}
            entryCity={entryCity}
            destination={`${selectedVaga.endereco.logradouro}, ${selectedVaga.endereco.bairro}`}
            vehicleName={`${
              vehiclesForStep.find((v) => v.id === selectedVehicleId)?.name
            } - ${
              vehiclesForStep.find((v) => v.id === selectedVehicleId)?.plate
            }`}
            onConfirm={onConfirm}
            onReset={reset}
          />
        )}

        {/* STEP 6 - FEEDBACK */}
        {step === 6 && (
          <div className="flex-1 flex items-center justify-center w-full animate-in fade-in zoom-in duration-300">
            {success ? (
              <div className="flex flex-col items-center text-center">
                {/* Ícone de Sucesso */}
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm animate-scale">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Reserva confirmada!
                </h2>

                <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
                  {feedbackMessage ??
                    'Sua solicitação foi processada com sucesso.'}
                </p>

                <button
                  onClick={() => router.push('/motorista/reservas')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Ir para minhas reservas
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                {/* Ícone de Erro */}
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm animate-scale">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Ops! Algo deu errado
                </h2>

                <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
                  {feedbackMessage ??
                    'Não foi possível confirmar sua reserva. Tente novamente.'}
                </p>

                <button
                  onClick={() => {
                    setStep(5);
                    setSuccess(null);
                    setFeedbackMessage(null);
                  }}
                  className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all active:scale-95"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
