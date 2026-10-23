'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import type { ConfirmResult } from '@/lib/types/confirmResult';
import StepIndicator from '@/features/reserva/reservar-vaga/components/StepIndicator';

import { useReservaRapida } from '../hooks/useReservaRapida';
import StepVeiculo from './steps/StepVeiculo';
import StepStatusVaga from './steps/StepStatusVaga';
import StepHorario from './steps/StepHorario';
import StepConfirmacao from './steps/StepConfirmacao';
import StepFeedback from './steps/StepFeedback';

interface Props {
  selectedVaga: VagaResponse;
  onNewReservation?: () => void;
  onBack?: () => void;
}

const FLUXO = ['veiculo', 'status', 'fim', 'confirmacao', 'feedback'] as const;
type StepKey = (typeof FLUXO)[number];

export default function ReservaAgente({ selectedVaga, onNewReservation }: Props) {
  const r = useReservaRapida(selectedVaga);
  const { form, setField } = r;

  const [stepKey, setStepKey] = useState<StepKey>('veiculo');
  const [resultado, setResultado] = useState<ConfirmResult | null>(null);

  const onNext = async () => {
    if (await r.verificarAgora()) setStepKey('status');
  };

  const onConfirm = async () => {
    if (r.confirmando) return;
    const result = await r.confirmar(); // cidade/entrada/placa/tipo já estão no form
    result.success
      ? toast.success('Reserva confirmada com sucesso!')
      : toast.error(result.message ?? 'Erro ao confirmar reserva');
    setResultado(result);
    setStepKey('feedback');
  };

  const onNovaReserva = () => {
    r.novaReserva();
    setResultado(null);
    setStepKey('veiculo');
    onNewReservation?.();
  };

  if (!r.hydrated) return null; // evita flash de campos em branco

  return (
    <div className="p-4 sm:p-6 border rounded-2xl shadow-2xl bg-white min-h-[80vh] flex flex-col gap-4">
      {stepKey !== 'feedback' && (
        <StepIndicator step={FLUXO.indexOf(stepKey) + 1} isReservaRapida />
      )}

      <div className="flex-1 flex flex-col overflow-y-auto pb-4">
        {stepKey === 'veiculo' && (
          <StepVeiculo
            tipoVeiculo={form.tipoVeiculo ?? null}
            placa={form.placa}
            cidadeOrigem={form.cidadeOrigem}
            entradaCidade={form.entradaCidade}
            mostrarDadosRota={r.mostrarDadosRota}
            vagaIncompativel={r.vagaIncompativel}
            validandoVeiculo={r.validandoVeiculo}
            onTipoVeiculoChange={r.selecionarTipoVeiculo}
            onPlacaChange={r.setPlaca}
            onCidadeOrigemChange={r.setCidadeOrigem}
            onEntradaCidadeChange={r.setEntradaCidade}
            onToggleDadosRota={r.toggleDadosRota}
            onNext={onNext}
          />
        )}

        {stepKey === 'status' && (
          <StepStatusVaga
            vagaDisponivel={r.status?.vagaDisponivel ?? null}
            selectedVaga={selectedVaga}
            slotLivre={r.status?.slotLivre ?? null}
            onContinuar={() => setStepKey('fim')}
            onVoltar={() => setStepKey('veiculo')}
          />
        )}

        {stepKey === 'fim' && form.startHour && (
          <StepHorario
            startHour={form.startHour}
            endHour={form.endHour}
            availableTimes={r.availableTimes}
            reservedTimesEnd={r.reservedTimesEnd}
            onSelect={(t) => {
              setField('endHour', t);
              setStepKey('confirmacao');
            }}
            onBack={() => setStepKey('status')}
          />
        )}

        {stepKey === 'confirmacao' && form.day && form.startHour && form.endHour && (
          <StepConfirmacao
            selectedDay={form.day}
            startHour={form.startHour}
            endHour={form.endHour}
            selectedVaga={selectedVaga}
            tipoVeiculo={form.tipoVeiculo ?? null}
            placa={form.placa}
            onConfirm={onConfirm}
            onBack={() => setStepKey('fim')}
          />
        )}

        {stepKey === 'feedback' && resultado && (
          <div className="flex-1 flex items-center justify-center w-full animate-in fade-in zoom-in duration-300">
            <StepFeedback
              success={resultado.success}
              message={resultado.message ?? null}
              onNovaReserva={onNovaReserva}
              onTentarNovamente={() => {
                setResultado(null);
                setStepKey('confirmacao');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}