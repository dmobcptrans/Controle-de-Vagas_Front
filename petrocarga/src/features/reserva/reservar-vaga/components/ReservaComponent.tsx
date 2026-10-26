'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock3 } from 'lucide-react';
import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import type { ConfirmResult } from '@/lib/types/confirmResult';

import StepIndicator from './StepIndicator';
import DaySelection from './steps/DaySelection';
import TimeSelection from './steps/TimeSelection';
import OriginVehicleStep from './steps/OriginVehicleStep';
import Confirmation from './steps/Confirmation';
import MotoristaStep from './steps/MotoristaStep';
import ResultadoReserva from './steps/ResultadoReserva';

import { useReserva } from '../hooks/useReserva';
import { toMinutes } from '../hooks/reservaHelpers';
import type { Persona } from '../hooks/reservaPayload';

/**
 * Cada persona tem seu fluxo. A posição no array = número da etapa (1-based),
 * que é o que o StepIndicator e o `form.step` já usam.
 * 'veiculo' para AGENTE será o formulário de tipo/placa (TODO: rota rápida).
 */
type StepKey =
  | 'dia'
  | 'motorista'
  | 'veiculo'
  | 'inicio'
  | 'fim'
  | 'confirmacao'
  | 'feedback';

const FLUXOS: Record<Persona, StepKey[]> = {
  MOTORISTA: ['dia', 'veiculo', 'inicio', 'fim', 'confirmacao', 'feedback'],
  EMPRESA: [
    'dia',
    'motorista',
    'veiculo',
    'inicio',
    'fim',
    'confirmacao',
    'feedback',
  ],
  AGENTE: ['dia', 'veiculo', 'inicio', 'fim', 'confirmacao', 'feedback'],
};

interface Props {
  selectedVaga: VagaResponse;
  onBack?: () => void;
  empresaId?: string;
}

export default function ReservaComponent({ selectedVaga, empresaId }: Props) {
  const r = useReserva(selectedVaga);
  const { form, setField } = r;

  const [resultado, setResultado] = useState<ConfirmResult | null>(null);

  // ---------- navegação ----------
  const fluxo = FLUXOS[r.persona];
  const stepKey = fluxo[form.step - 1];
  const irPara = (key: StepKey) => setField('step', fluxo.indexOf(key) + 1);
  const voltar = () => setField('step', Math.max(1, form.step - 1));

  // ---------- dados derivados p/ a UI ----------
  const vehiclesForStep = r.vehicles.map((v) => ({
    ...v,
    name: `${v.marca} ${v.modelo}`,
    plate: v.placa,
  }));
  const veiculoSel = vehiclesForStep.find((v) => v.id === form.veiculoId);

  // dias: busca ao entrar na etapa 'dia'
  useEffect(() => {
    if (stepKey === 'dia') r.fetchDias(new Date());
  }, [stepKey, r.fetchDias]);

  const onConfirm = async () => {
    const result = await r.confirmar();
    result.success
      ? toast.success('Reserva confirmada com sucesso!')
      : toast.error(result.message ?? 'Erro ao confirmar reserva');
    setResultado(result);
    irPara('feedback');
  };

  return (
    <div className="p-6 border rounded-2xl shadow-lg mx-auto bg-white min-h-[60vh] flex flex-col">
      {stepKey !== 'feedback' && (
        <StepIndicator step={form.step} isEmpresa={r.isEmpresa} />
      )}

      <div className="flex flex-1 justify-center">
        {stepKey === 'dia' && (
          <DaySelection
            selected={form.day}
            onSelect={(day) => {
              setField('day', day);
              irPara(r.isEmpresa ? 'motorista' : 'veiculo');
            }}
            onMonthChange={r.fetchDias}
            availableDays={r.availableDates}
            loading={r.loadingDias}
          />
        )}

        {stepKey === 'motorista' && (
          <MotoristaStep
            empresaId={empresaId!}
            selectedDriverId={form.motoristaId ?? ''}
            onDriverChange={(driverId) => {
              r.selecionarMotorista(driverId); // limpa veículo, zera página e o hook já busca
              irPara('veiculo');
            }}
          />
        )}

        {stepKey === 'veiculo' && (
          <OriginVehicleStep
            vehicles={vehiclesForStep}
            vehiclesLoading={r.vehiclesLoading}
            vehiclePage={r.vehiclePage}
            vehicleTotalPages={r.vehicleTotalPages}
            onVehiclePageChange={r.setVehiclePage}
            motoristaId={form.motoristaId ?? ''}
            isEmpresa={r.isEmpresa}
            origin={form.cidadeOrigem}
            entryCity={form.entradaCidade}
            selectedVehicleId={form.veiculoId}
            onOriginChange={(v) => setField('cidadeOrigem', v)}
            onEntryCityChange={(v) => setField('entradaCidade', v ?? '')}
            onVehicleChange={(id) => setField('veiculoId', id)}
            onNext={(origin, entryCity, vehicleId) => {
              // os horários carregam sozinhos quando dia + veículo estão no form
              setField('cidadeOrigem', origin);
              setField('entradaCidade', entryCity ?? '');
              setField('veiculoId', vehicleId);
              irPara('inicio');
            }}
            onBack={voltar}
          />
        )}

        {stepKey === 'inicio' &&
          (r.loadingHorarios || !r.horariosCarregados ? (
            <Loading />
          ) : r.availableTimes.length === 0 ? (
            <SemHorarios onBack={voltar} />
          ) : (
            <TimeSelection
              times={r.availableTimes}
              reserved={r.reservedTimesStart}
              selected={form.startHour}
              onSelect={(t) => {
                setField('startHour', t);
                setField('endHour', null);
                irPara('fim');
              }}
              onBack={voltar}
              color="blue"
            />
          ))}

        {stepKey === 'fim' && form.startHour && (
          <TimeSelection
            times={[
              ...r.availableTimes.filter(
                (t) => toMinutes(t) > toMinutes(form.startHour!),
              ),
              ...(r.podeContinuarNoDiaSeguinte
                ? r.availableTimesNextDay.map((t) => `D+1 ${t}`)
                : []),
            ]}
            reserved={r.reservedTimesEnd}
            selected={form.endHour}
            onSelect={(t) => {
              setField('endHour', t);
              irPara('confirmacao');
            }}
            onBack={voltar}
            color="blue"
          />
        )}

        {stepKey === 'confirmacao' &&
          form.day &&
          form.startHour &&
          form.endHour && (
            <Confirmation
              day={form.day}
              startHour={form.startHour}
              endHour={form.endHour}
              origin={form.cidadeOrigem}
              entryCity={form.entradaCidade}
              destination={`${selectedVaga.endereco.logradouro}, ${selectedVaga.endereco.bairro}`}
              vehicleName={
                veiculoSel ? `${veiculoSel.name} - ${veiculoSel.plate}` : ''
              }
              onConfirm={onConfirm}
              onReset={r.reset}
            />
          )}

        {stepKey === 'feedback' && resultado && (
          <ResultadoReserva
            resultado={resultado}
            onRetry={() => {
              setResultado(null);
              irPara('confirmacao');
            }}
          />
        )}
      </div>
    </div>
  );
}

// ---------- pedaços pequenos ----------
const Loading = () => (
  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-gray-600">Carregando horários disponíveis...</p>
  </div>
);

const SemHorarios = ({ onBack }: { onBack: () => void }) => (
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
      onClick={onBack}
      className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </button>
  </div>
);
