'use client';

import { useState } from 'react';
import { useReserva } from '@/components/hooks/reserva/useReserva';
import { useReservaAgenteState } from './hooks/useReservaAgenteState';
import { Vaga, DiaSemana } from '@/lib/types/vaga';
import { Veiculo } from '@/lib/types/veiculo';
import StepIndicator from '@/components/reserva/StepIndicator';
import toast from 'react-hot-toast';
import { fetchReservasBloqueios } from '@/components/hooks/reserva/reservaService';

import StepVeiculo from './steps/StepVeiculo';
import StepStatusVaga from './steps/StepStatusVaga';
import StepHorario from './steps/StepHorario';
import StepConfirmacao from './steps/StepConfirmacao';
import StepFeedback from './steps/StepFeedback';

interface ReservaAgenteProps {
  selectedVaga: Vaga;
  onNewReservation?: () => void;
  onBack?: () => void;
}

interface SlotLivre {
  inicio: Date;
  fim: Date | null;
  duracaoMinutos: number | null;
}

type ReservaBloqueio = {
  inicio: string;
  fim: string;
};

export default function ReservaAgente({
  selectedVaga,
  onNewReservation,
}: ReservaAgenteProps) {
  // --------------------------------------------------------------------------
  // HOOKS
  // --------------------------------------------------------------------------
  const reserva = useReserva(selectedVaga);
  const {
    selectedDay,
    setSelectedDay,
    availableTimes,
    reservedTimesEnd,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    handleConfirm,
  } = reserva;

  // Estado persistido (placa, tipo, cidade, etc.)
  const { defaults, hydrated, updateField, clearDefaults } =
    useReservaAgenteState();

  // Hook do reserva usa seus próprios setters; espelhamos os defaults persistidos neles
  const {
    tipoVeiculoAgente,
    setTipoVeiculoAgente,
    placaAgente,
    setPlacaAgente,
  } = reserva;

  // --------------------------------------------------------------------------
  // ESTADOS LOCAIS (transitórios — não precisam persistir)
  // --------------------------------------------------------------------------
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vagaIncompativel, setVagaIncompativel] = useState(false);
  const [validandoVeiculo, setValidandoVeiculo] = useState(false);
  const [vagaDisponivel, setVagaDisponivel] = useState<boolean | null>(null);
  const [slotLivre, setSlotLivre] = useState<SlotLivre | null>(null);

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------
  const getNow = (): string => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const encontrarProximoSlotLivre = (
    reservas: ReservaBloqueio[],
    agora: Date,
    limite: Date,
  ): SlotLivre => {
    const MINIMO_MS = 15 * 60 * 1000;

    if (!reservas.length) {
      return {
        inicio: agora,
        fim: limite,
        duracaoMinutos: Math.round(
          (limite.getTime() - agora.getTime()) / 60000,
        ),
      };
    }

    const ordenadas = reservas
      .map((r) => ({ inicio: new Date(r.inicio), fim: new Date(r.fim) }))
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    let cursor = new Date(agora);

    for (const atual of ordenadas) {
      if (cursor.getTime() + MINIMO_MS <= atual.inicio.getTime()) {
        return {
          inicio: new Date(cursor),
          fim: atual.inicio,
          duracaoMinutos: Math.round(
            (atual.inicio.getTime() - cursor.getTime()) / 60000,
          ),
        };
      }
      if (cursor < atual.fim) cursor = new Date(atual.fim);
    }

    return {
      inicio: cursor,
      fim: limite,
      duracaoMinutos: Math.round((limite.getTime() - cursor.getTime()) / 60000),
    };
  };

  const isNowInReservedRange = (reservas: ReservaBloqueio[]) => {
    const now = new Date();
    return reservas.some((r) => {
      if (!r.inicio || !r.fim) return false;
      const inicio = new Date(r.inicio);
      const fim = new Date(r.fim);
      const inicioComMargem = new Date(inicio.getTime() - 15 * 60 * 1000);
      return now >= inicioComMargem && now < fim;
    });
  };

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const handleTipoVeiculoChange = async (tipo: Veiculo['tipo']) => {
    setTipoVeiculoAgente(tipo);
    updateField('tipoVeiculo', tipo);
    setVagaIncompativel(false);

    if (!tipo) return;

    setValidandoVeiculo(true);
    try {
      const dataFormatada = new Date().toISOString().split('T')[0];
      await fetchReservasBloqueios(selectedVaga.id, dataFormatada, tipo);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Veículo incompatível com esta vaga.';
      toast.error(msg);
      setVagaIncompativel(true);
    } finally {
      setValidandoVeiculo(false);
    }
  };

  const handlePlacaChange = (placa: string) => {
    setPlacaAgente(placa);
    updateField('placa', placa);
  };

  const handleNextFromStep1 = async () => {
    const now = new Date();
    const today = new Date();
    const dataFormatada = today.toISOString().split('T')[0];

    setStartHour(getNow());
    setSelectedDay(today);

    const reservas: ReservaBloqueio[] = await fetchReservasBloqueios(
      selectedVaga.id,
      dataFormatada,
      tipoVeiculoAgente!,
    );

    const diasSemanas: DiaSemana[] = [
      'DOMINGO',
      'SEGUNDA',
      'TERCA',
      'QUARTA',
      'QUINTA',
      'SEXTA',
      'SABADO',
    ];
    const hojeEnum = diasSemanas[today.getDay()];
    const operacaoHoje =
      selectedVaga.operacoesVaga.find(
        (op) => op.diaSemanaAsEnum === hojeEnum,
      ) || selectedVaga.operacoesVaga[0];

    if (!operacaoHoje) {
      setVagaDisponivel(false);
      setStep(2);
      return;
    }

    const [horaFim, minFim] = operacaoHoje.horaFim.split(':').map(Number);
    const limiteDisponibilidade = new Date(today);
    limiteDisponibilidade.setHours(horaFim, minFim, 0, 0);

    const estaOcupadoAgora = isNowInReservedRange(reservas);
    const proximoSlot = encontrarProximoSlotLivre(
      reservas,
      now,
      limiteDisponibilidade,
    );

    // Ajusta slot muito curto (≤30min → mostra 15min)
    const slotAjustado =
      proximoSlot?.fim &&
      (proximoSlot.fim.getTime() - proximoSlot.inicio.getTime()) / 60000 <= 30
        ? {
            ...proximoSlot,
            fim: new Date(proximoSlot.inicio.getTime() + 15 * 60 * 1000),
            duracaoMinutos: 15,
          }
        : proximoSlot;

    if (estaOcupadoAgora) {
      setVagaDisponivel(false);
      setSlotLivre(
        slotAjustado?.inicio.getTime() < limiteDisponibilidade.getTime()
          ? slotAjustado
          : null,
      );
    } else if (now > limiteDisponibilidade) {
      setVagaDisponivel(false);
      setSlotLivre(null);
    } else {
      setVagaDisponivel(true);
      setSlotLivre(slotAjustado);
    }

    setStep(2);
  };

  const onConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await handleConfirm({
        cidadeOrigem: defaults.cidadeOrigem,
        entradaCidade: defaults.entradaCidade,
      });
      if (!result.success) {
        toast.error('Erro ao confirmar reserva');
      } else {
        toast.success('Reserva confirmada com sucesso!');
      }
      setSuccess(result.success);
      setFeedbackMessage(result.message ?? null);
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNovaReserva = () => {
    // Volta ao step 1 mantendo os defaults (placa, tipo, etc.)
    setStep(1);
    setSuccess(null);
    setFeedbackMessage(null);
    setEndHour(null);
    clearDefaults();

    if (onNewReservation) onNewReservation();
  };

  // Aguarda hidratação para evitar flash de valores em branco
  if (!hydrated) return null;

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="p-4 sm:p-6 border rounded-xl shadow-lg max-w-2xl mx-auto bg-white min-h-[80vh] flex flex-col gap-4">
      {step < 5 && <StepIndicator step={step} isReservaRapida={true} />}

      <div className="flex-1 flex flex-col overflow-y-auto pb-4">
        {step === 1 && (
          <StepVeiculo
            tipoVeiculo={tipoVeiculoAgente || null}
            placa={placaAgente}
            cidadeOrigem={defaults.cidadeOrigem}
            entradaCidade={defaults.entradaCidade}
            mostrarDadosRota={defaults.mostrarDadosRota}
            vagaIncompativel={vagaIncompativel}
            validandoVeiculo={validandoVeiculo}
            onTipoVeiculoChange={handleTipoVeiculoChange}
            onPlacaChange={handlePlacaChange}
            onCidadeOrigemChange={(v) => updateField('cidadeOrigem', v)}
            onEntradaCidadeChange={(v) => updateField('entradaCidade', v)}
            onToggleDadosRota={() =>
              updateField('mostrarDadosRota', !defaults.mostrarDadosRota)
            }
            onNext={handleNextFromStep1}
          />
        )}

        {step === 2 && (
          <StepStatusVaga
            vagaDisponivel={vagaDisponivel}
            selectedVaga={selectedVaga}
            slotLivre={slotLivre}
            onContinuar={() => setStep(3)}
            onVoltar={() => setStep(1)}
          />
        )}

        {step === 3 && startHour && (
          <StepHorario
            startHour={startHour}
            endHour={endHour}
            availableTimes={availableTimes}
            reservedTimesEnd={reservedTimesEnd}
            onSelect={(t) => {
              setEndHour(t);
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && startHour && endHour && selectedDay && (
          <StepConfirmacao
            selectedDay={selectedDay}
            startHour={startHour}
            endHour={endHour}
            selectedVaga={selectedVaga}
            tipoVeiculo={tipoVeiculoAgente || null}
            placa={placaAgente}
            onConfirm={onConfirm}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && success !== null && (
          <div className="flex-1 flex items-center justify-center w-full animate-in fade-in zoom-in duration-300">
            <StepFeedback
              success={success}
              message={feedbackMessage}
              onNovaReserva={handleNovaReserva}
              onTentarNovamente={() => {
                setStep(4);
                setSuccess(null);
                setFeedbackMessage(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
