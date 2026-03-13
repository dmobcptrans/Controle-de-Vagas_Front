'use client';

import { useState } from 'react';
import { useReserva } from '@/components/hooks/reserva/useReserva';
import { Vaga } from '@/lib/types/vaga';
import DaySelection from '@/components/reserva/DaySelection';
import TimeSelection from '@/components/reserva/TimeSelection';
import StepIndicator from '@/components/reserva/StepIndicator';
import Confirmation from '@/components/reserva/Confirmation';
import { Veiculo } from '@/lib/types/veiculo';
import toast from 'react-hot-toast';

interface ReservaAgenteProps {
  selectedVaga: Vaga;
  onBack?: () => void;
}

export default function ReservaAgente({
  selectedVaga,
  onBack,
}: ReservaAgenteProps) {
  const reserva = useReserva(selectedVaga);
  const {
    tipoVeiculoAgente,
    setTipoVeiculoAgente,
    placaAgente,
    setPlacaAgente,
    selectedDay,
    setSelectedDay,
    availableTimes,
    reservedTimesStart,
    reservedTimesEnd,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    fetchHorariosDisponiveis,
    handleConfirm,
    availableDates,
  } = reserva;

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 👈 NOVO: Estado de loading

  // ==========================
  // CONFIRMAR RESERVA
  // ==========================
  const onConfirm = async () => {
    if (isSubmitting) return; // 👈 NOVO: Previne clique duplo

    setIsSubmitting(true); // 👈 NOVO: Ativa o loading

    try {
      const result = await handleConfirm();

      if (!result.success) {
        toast.error('Erro ao confirmar reserva');
      } else {
        toast.success('Reserva confirmada com sucesso!');
      }

      setSuccess(result.success);
      setFeedbackMessage(result.message ?? null);
      setStep(6);
    } finally {
      setIsSubmitting(false); // 👈 NOVO: Desativa o loading (sempre executa)
    }
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

      {/* LOCAL DA RESERVA */}
      {step < 6 && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Reservando vaga em
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center leading-tight">
            {selectedVaga.endereco.logradouro}
            <span className="block text-base sm:text-lg font-medium text-gray-500 mt-1">
              {selectedVaga.endereco.bairro}
            </span>
          </h2>
        </div>
      )}

      {step < 6 && <StepIndicator step={step} />}

      <div className="flex-1 flex flex-col overflow-y-auto pb-4">
        {/* STEP 1 - Cadastro veículo */}
        {step === 1 && (
          <div className="flex flex-col gap-5 p-2">
            <h3 className="text-md font-semibold text-gray-700">
              1. Informações do Veículo
            </h3>
            <div>
              <p className="font-medium mb-1">Tipo de veículo</p>
              <select
                value={tipoVeiculoAgente || ''}
                onChange={(e) =>
                  setTipoVeiculoAgente(e.target.value as Veiculo['tipo'])
                }
                className="w-full border rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Selecione...</option>
                <option value="AUTOMOVEL">Automóvel</option>
                <option value="VUC">VUC</option>
                <option value="CAMINHONETA">Caminhoneta</option>
                <option value="CAMINHAO_MEDIO">Caminhão médio</option>
                <option value="CAMINHAO_LONGO">Caminhão longo</option>
              </select>
            </div>
            <div>
              <p className="font-medium mb-1">Placa</p>
              <input
                value={placaAgente}
                onChange={(e) => setPlacaAgente(e.target.value.toUpperCase())}
                className="w-full border rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Digite a placa"
                maxLength={7}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!tipoVeiculoAgente || placaAgente.length < 7}
              className={`py-3 rounded-lg mt-4 font-semibold transition-opacity ${
                !tipoVeiculoAgente || placaAgente.length < 7
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Próximo
            </button>
          </div>
        )}

        {/* STEP 2 - Seleção do dia */}
        {step === 2 && (
          <div className="p-2">
            <h3 className="text-md font-semibold text-gray-700 mb-4">
              2. Selecione o Dia
            </h3>
            <DaySelection
              selected={selectedDay}
              onSelect={async (day) => {
                setSelectedDay(day);

                // --- CORREÇÃO IMPORTANTE AQUI ---
                // No ReservaComponent você passa o 'vehicleId'.
                // Aqui, como é agente, passamos o 'tipoVeiculoAgente' como 3º argumento.
                // Verifique se o seu hook 'fetchHorariosDisponiveis' aceita (string | null) nesse argumento.
                await fetchHorariosDisponiveis(
                  day,
                  selectedVaga,
                  tipoVeiculoAgente,
                );

                setStep(3);
              }}
              availableDays={availableDates}
            />
            <button
              onClick={() => setStep(1)}
              className="mt-6 bg-gray-200 py-3 rounded-lg w-full text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Voltar
            </button>
          </div>
        )}

        {/* STEP 3 - Seleção do horário inicial */}
        {step === 3 && selectedDay && (
          <div className="p-2">
            <h3 className="text-md font-semibold text-gray-700 mb-4">
              3. Horário Inicial
            </h3>
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
          </div>
        )}

        {/* STEP 4 - Seleção do horário final */}
        {step === 4 && startHour && (
          <div className="p-2">
            <h3 className="text-md font-semibold text-gray-700 mb-4">
              4. Horário Final
            </h3>
            <TimeSelection
              // Filtra garantindo que só mostre horários POSTERIORES ao início
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
          </div>
        )}

        {/* STEP 5 - Resumo e confirmação */}
        {step === 5 && startHour && endHour && (
          <Confirmation
            day={selectedDay!}
            startHour={startHour!}
            endHour={endHour!}
            origin="Agente Local"
            destination={`${selectedVaga.endereco.logradouro}, ${selectedVaga.endereco.bairro}`}
            vehicleName={`${tipoVeiculoAgente} - ${placaAgente}`}
            onConfirm={onConfirm}
            onReset={() => setStep(4)}
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
