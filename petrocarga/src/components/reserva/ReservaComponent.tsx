'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/reserva/StepIndicator';
import DaySelection from '@/components/reserva/DaySelection';
import TimeSelection from '@/components/reserva/TimeSelection';
import OriginVehicleStep from '@/components/reserva/OriginVehicleStep';
import Confirmation from '@/components/reserva/Confirmation';
import { useReserva } from '../hooks/reserva/useReserva';
import { Vaga } from '@/lib/types/vaga';
import toast from 'react-hot-toast';
import MotoristaStep from './MotoristaStep';
import { ArrowLeft, Clock3 } from 'lucide-react';

interface ReservaComponentProps {
  selectedVaga: Vaga;
  onBack?: () => void;
  empresaId?: string;
}
/**
 * @component ReservaComponent
 * @version 1.0.0
 *
 * @description Componente principal de reserva de vagas para motoristas em 6 etapas.
 * Gerencia o fluxo completo de reserva: seleção de dia, veículo/origem, horários e confirmação.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO (6 ETAPAS):
 * ----------------------------------------------------------------------------
 *
 * STEP 1 - SELEÇÃO DO DIA:
 *    - Exibe dias disponíveis (DaySelection)
 *    - Avança para etapa 2
 *
 * STEP 2 - ORIGEM E VEÍCULO:
 *    - Cidade de origem
 *    - Ponto de entrada na cidade (opcional)
 *    - Seleção do veículo (lista do usuário)
 *    - Avança para etapa 3
 *
 * STEP 3 - HORÁRIO INICIAL:
 *    - Carregamento de horários disponíveis
 *    - Lista de horários (TimeSelection)
 *    - Avança para etapa 4
 *
 * STEP 4 - HORÁRIO FINAL:
 *    - Filtra horários posteriores ao início
 *    - Lista de horários (TimeSelection)
 *    - Avança para etapa 5
 *
 * STEP 5 - CONFIRMAÇÃO:
 *    - Resumo da reserva (Confirmation)
 *    - Botão "Confirmar" com loading
 *
 * STEP 6 - FEEDBACK:
 *    - Sucesso: ícone verde, mensagem, botão "Ir para minhas reservas"
 *    - Erro: ícone vermelho, mensagem, botão "Tentar novamente"
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - HOOK PERSONALIZADO: useReserva gerencia toda a lógica de negócio
 * - LOADING HORÁRIOS: Exibe spinner enquanto carrega
 * - SEM HORÁRIOS: Mensagem amigável com botão "Voltar"
 * - FILTRO DE HORÁRIOS FINAIS: toMinutes() para comparação
 * - REDIRECIONAMENTO: Após sucesso, botão leva para página de reservas
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - useReserva: Hook com lógica de reserva
 * - StepIndicator: Indicador de progresso (5 etapas)
 * - DaySelection: Seleção de dias disponíveis
 * - OriginVehicleStep: Formulário de origem e veículo
 * - TimeSelection: Seleção de horários
 * - Confirmation: Tela de resumo e confirmação
 *
 * @example
 * ```tsx
 * <ReservaComponent
 *   selectedVaga={vaga}
 *   onBack={() => setStep('mapa')}
 * />
 * ```
 *
 * @see /components/hooks/reserva/useReserva.ts - Lógica de reserva
 */

export default function ReservaComponent({
  selectedVaga,
  onBack,
  empresaId,
}: ReservaComponentProps) {
  const router = useRouter();
  const reserva = useReserva(selectedVaga);

  // ==================== DESTRUTURAÇÃO DO HOOK ====================
  const {
    step,
    fetchVeiculosMotorista,
    availableDates,
    setStep,
    isEmpresa,
    selectedDay,
    setSelectedDay,
    availableTimes,
    reservedTimesStart,
    reservedTimesEnd,
    startHour,

    vehiclePage,
    vehicleTotalPages,
    vehiclePageSize,
    vehiclesLoading,
    setVehiclePage,

    setStartHour,
    endHour,
    setEndHour,
    origin,
    setOrigin,
    entryCity,
    setEntryCity,
    fetchHorariosDisponiveis,
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
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  // ==================== FORMATAR VEÍCULOS ====================
  const vehiclesForStep = vehicles.map((v) => ({
    id: v.id,
    name: `${v.marca} ${v.modelo}`,
    plate: v.placa,
  }));

  // ==================== FUNÇÃO AUXILIAR ====================
  const toMinutes = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };

  // ==================== HANDLER DE CONFIRMAÇÃO ====================
  const onConfirm = async () => {
    const result = await handleConfirm({
      motoristaId: selectedDriverId,
      isEmpresa,
    });

    if (!result.success) {
      toast.error(result.message ?? 'Erro ao confirmar reserva');
    } else {
      toast.success('Reserva confirmada com sucesso!');
    }

    setSuccess(result.success);
    setFeedbackMessage(result.message ?? null);

    setStep(isEmpresa ? 7 : 6);
  };

  // ==================== BUSCA INICIAL / DIAS DISPONIVEIS ====================

  useEffect(() => {
    if (!selectedVaga || step !== 1) return;
    reserva.fetchDiasDisponiveis(new Date());
  }, [selectedVaga, step, reserva.fetchDiasDisponiveis]);

  return (
    <div className="p-6 border rounded-2xl shadow-lg mx-auto bg-white min-h-[60vh] flex flex-col">
      {/* ==================== INDICADOR DE PROGRESSO ==================== */}
      {step < (isEmpresa ? 7 : 6) && (
        <StepIndicator step={step} isEmpresa={isEmpresa} />
      )}

      <div className="flex flex-1 justify-center">
        {/* ==================== STEP 1: SELEÇÃO DO DIA ==================== */}
        {step === 1 && (
          <DaySelection
            selected={selectedDay}
            onSelect={(day) => {
              setSelectedDay(day);
              setStep(2);
            }}
            onMonthChange={(month) => {
              reserva.fetchDiasDisponiveis(month);
            }}
            availableDays={availableDates}
            loading={reserva.loadingDias}
          />
        )}

        {/* ==================== STEP 2: MOTORISTA - APENAS EMPRESA ==================== */}
        {step === 2 && isEmpresa && (
          <MotoristaStep
            empresaId={empresaId!}
            selectedDriverId={selectedDriverId}
            onDriverChange={(driverId) => {
              setSelectedDriverId(driverId);
              setSelectedVehicleId('');
              setVehiclePage(0);

              fetchVeiculosMotorista(driverId, 0);

              setStep(3);
            }}
          />
        )}

        {/* ==================== STEP 2/3: ORIGEM E VEÍCULO ==================== */}
        {((step === 2 && !isEmpresa) || (step === 3 && isEmpresa)) && (
          <OriginVehicleStep
            vehicles={vehiclesForStep}
            vehiclesLoading={vehiclesLoading}
            vehiclePage={vehiclePage}
            vehicleTotalPages={vehicleTotalPages}
            onVehiclePageChange={setVehiclePage}
            motoristaId={selectedDriverId}
            isEmpresa={isEmpresa}
            origin={origin}
            entryCity={entryCity}
            selectedVehicleId={selectedVehicleId}
            onOriginChange={setOrigin}
            onEntryCityChange={setEntryCity}
            onVehicleChange={setSelectedVehicleId}
            onNext={async (origin, entryCity, vehicleId) => {
              if (!selectedDay || !selectedVaga) return;

              try {
                await fetchHorariosDisponiveis(
                  selectedDay,
                  selectedVaga,
                  vehicleId,
                );

                setOrigin(origin);
                setEntryCity(entryCity);
                setSelectedVehicleId(vehicleId);

                setStep(isEmpresa ? 4 : 3);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'O veículo não pode operar nesta vaga.',
                );

                return;
              }
            }}
            onBack={() => setStep(isEmpresa ? 2 : 1)}
          />
        )}

        {/* ==================== STEP 3/4: HORÁRIO INICIAL ==================== */}
        {((step === 3 && !isEmpresa) || (step === 4 && isEmpresa)) &&
          selectedDay &&
          (loadingHorarios || !horariosCarregados ? (
            // Loading
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />

              <p className="text-sm text-gray-600">
                Carregando horários disponíveis...
              </p>
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Clock3 className="h-6 w-6 text-gray-400" />
              </div>

              <h3 className="text-sm font-semibold text-gray-800">
                Nenhum horário disponível
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Não encontramos horários disponíveis para o dia selecionado.
              </p>

              <button
                onClick={() => setStep(isEmpresa ? 3 : 2)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
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
                setStep(isEmpresa ? 5 : 4);
              }}
              onBack={() => setStep(isEmpresa ? 3 : 2)}
              color="blue"
            />
          ))}

        {/* ==================== STEP 4/5: HORÁRIO FINAL ==================== */}
        {((step === 4 && !isEmpresa) || (step === 5 && isEmpresa)) &&
          startHour && (
            <TimeSelection
              times={availableTimes.filter(
                (t) => toMinutes(t) > toMinutes(startHour),
              )}
              reserved={reservedTimesEnd}
              selected={endHour}
              onSelect={(t) => {
                setEndHour(t);
                setStep(isEmpresa ? 6 : 5);
              }}
              onBack={() => setStep(isEmpresa ? 4 : 3)}
              color="blue"
            />
          )}

        {/* ==================== STEP 5/6: CONFIRMAÇÃO ==================== */}
        {((step === 5 && !isEmpresa) || (step === 6 && isEmpresa)) &&
          selectedDay &&
          startHour &&
          endHour && (
            <Confirmation
              day={selectedDay}
              startHour={startHour}
              endHour={endHour}
              origin={origin}
              entryCity={entryCity}
              destination={`${selectedVaga.endereco.logradouro}, ${selectedVaga.endereco.bairro}`}
              vehicleName={`${
                vehiclesForStep.find((v) => v.id === selectedVehicleId)?.name ??
                ''
              } - ${
                vehiclesForStep.find((v) => v.id === selectedVehicleId)
                  ?.plate ?? ''
              }`}
              onConfirm={onConfirm}
              onReset={reset}
            />
          )}
        {/* ==================== FEEDBACK ==================== */}
        {((step === 6 && !isEmpresa) || (step === 7 && isEmpresa)) && (
          <div className="flex-1 flex items-center justify-center w-full animate-in fade-in zoom-in duration-300">
            {success ? (
              // Tela de Sucesso
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl animate-scale">
                  <svg
                    className="w-11 h-11"
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
                  onClick={() => {
                    router.push('/minhas-reservas');
                  }}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Ir para minhas reservas
                </button>
              </div>
            ) : (
              // Tela de Erro
              <div className="flex flex-col items-center text-center">
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
                    setStep(isEmpresa ? 6 : 5);
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
