'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';

import { ReservaPorUsuarioResponse } from '@/features/reserva/reservas/types/reservas';
import { useReservaMutation } from '@/features/reserva/reservas/hooks/useReservaMutation';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';

import { useVeiculo } from '@/features/veiculos/hooks/useVeiculo';
import { useVaga } from '@/features/vaga/vagas/hooks/useVaga';

import { useReserva } from '@/features/reserva/reservar-vaga/hooks/useReserva';
import OriginVehicleStep from '@/features/reserva/reservar-vaga/components/steps/OriginVehicleStep';
import MotoristaStep from '@/features/reserva/reservar-vaga/components/steps/MotoristaStep';

import { ReservaSummary } from './ReservaSummary';
import { EditTimeForm } from './EditTimeForm';

interface ReservaEditarProps {
  reserva: ReservaPorUsuarioResponse;
  onClose?: () => void;
  onSuccess?: (reservaAtualizada: ReservaPorUsuarioResponse) => void;
}

type EditField = null | 'horario' | 'veiculo-origem';

export default function ReservaEditarModal({
  reserva,
  onClose,
  onSuccess,
}: ReservaEditarProps) {
  const router = useRouter();
  const { user } = useAuth();

  const isEmpresa = user?.permissao === 'EMPRESA';
  const empresaId = user?.id ?? '';

  // ============================================================
  // FORMULÁRIO DA RESERVA EXISTENTE
  // ============================================================

  const [initialForm, setInitialForm] = useState({
    veiculoId: reserva.veiculo.id,
    cidadeOrigem: reserva.cidadeOrigem,
    inicio: reserva.inicio,
    fim: reserva.fim,
    motoristaId: reserva.motorista?.id ?? '',
  });

  const [form, setForm] = useState({ ...initialForm });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editField, setEditField] = useState<EditField>(null);
  const [chainedFromVehicle, setChainedFromVehicle] = useState(false);

  const [selectedDriverId, setSelectedDriverId] = useState(
    initialForm.motoristaId,
  );

  const [selectedVehicleId, setSelectedVehicleId] = useState(
    initialForm.veiculoId,
  );

  const [origin, setOrigin] = useState('');
  const [entryCity, setEntryCity] = useState<string | null>(null);

  // Estado visual das etapas do formulário de horários.
  const [step, setStep] = useState(1);
  const [startHour, setStartHour] = useState<string | null>(null);
  const [endHour, setEndHour] = useState<string | null>(null);

  // ============================================================
  // DADOS DA RESERVA
  // ============================================================

  const {
    buscar,
    veiculo,
    loading: loadingVeiculo,
    error: errorVeiculo,
  } = useVeiculo({
    veiculoId: form.veiculoId,
    buscarAutomaticamente: false,
  });

  const {
    vaga,
    loading: loadingVaga,
    error: errorVaga,
  } = useVaga({
    vagaId: reserva.vaga.id,
    buscarAutomaticamente: true,
  });

  const loading = loadingVaga || (Boolean(form.veiculoId) && loadingVeiculo);
  const dataError = errorVeiculo || errorVaga;

  console.log('Resultado do useVaga:', {
    vagaId: reserva.vaga.id,
    vaga,
    loadingVaga,
    errorVaga,
  });
  // ============================================================
  // ATUALIZAÇÃO DA RESERVA EXISTENTE
  // ============================================================

  const {
    atualizar,
    loading: isSaving,
    error: apiError,
    limparError,
  } = useReservaMutation();

  // ============================================================
  // NOVO HOOK DE RESERVA
  // ============================================================

  const {
    form: reservaForm,
    setField,
    selecionarMotorista,
    vehicles,
    vehiclePage,
    vehiclesLoading,
    vehicleTotalPages,
    setVehiclePage,
    availableTimes,
    availableTimesNextDay,
    podeContinuarNoDiaSeguinte,
    reservedTimesStart,
    reservedTimesEnd,
    loadingHorarios,
    horariosCarregados,
  } = useReserva(vaga);
  const vehiclesForStep = vehicles.map((v) => ({
    ...v,
    id: v.id,
    name: `${v.marca} ${v.modelo}`,
    plate: v.placa,
  }));

  // ============================================================
  // SINCRONIZAÇÃO INICIAL COM O NOVO HOOK
  // ============================================================

  useEffect(() => {
    if (!form.veiculoId) return;

    buscar();
  }, [form.veiculoId, buscar]);

  useEffect(() => {
    if (!vaga) return;

    const inicio = new Date(form.inicio);
    const horaInicial = inicio.toTimeString().slice(0, 5);

    setField('day', inicio);
    setField('startHour', horaInicial);
    setField('veiculoId', form.veiculoId);

    if (form.motoristaId) {
      setField('motoristaId', form.motoristaId);
    }
  }, [vaga, form.inicio, form.veiculoId, form.motoristaId, setField]);

  // ============================================================
  // SELEÇÃO DO MOTORISTA
  // ============================================================

  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);

    setForm((prev) => ({
      ...prev,
      motoristaId: driverId,
      veiculoId: '',
    }));

    setSelectedVehicleId('');
    selecionarMotorista(driverId);
  };

  // ============================================================
  // SALVAR ALTERAÇÕES
  // ============================================================

  const handleSave = async () => {
    if (!user?.id) {
      setError('Sessão expirada.');
      return;
    }

    if (!form.veiculoId) {
      setError('Selecione um veículo.');
      return;
    }

    if (isEmpresa && !form.motoristaId) {
      setError('Selecione um motorista.');
      return;
    }

    if (!form.inicio || !form.fim) {
      setError('Selecione os horários da reserva.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    limparError();

    const result = await atualizar(reserva.id, user.id, {
      veiculoId: form.veiculoId,
      cidadeOrigem: form.cidadeOrigem,
      inicio: form.inicio,
      fim: form.fim,
      ...(isEmpresa ? { motoristaId: form.motoristaId } : {}),
    });

    if (!result) return;

    // Atualiza os valores de referência após o salvamento.
    setInitialForm({
      veiculoId: form.veiculoId,
      cidadeOrigem: form.cidadeOrigem,
      inicio: form.inicio,
      fim: form.fim,
      motoristaId: form.motoristaId,
    });

    const updatedReserva: ReservaPorUsuarioResponse = {
      ...reserva,
      ...form,
      status: 'RESERVADA',
    };

    setSuccessMsg('Reserva atualizada com sucesso!');
    router.refresh();

    setTimeout(() => {
      onSuccess?.(updatedReserva);
      onClose?.();
    }, 800);
  };

  // ============================================================
  // SELEÇÃO DO HORÁRIO FINAL
  // ============================================================

  const handleTimeSelectEnd = (time: string) => {
    if (!startHour) return;

    const terminaNoDiaSeguinte = time.startsWith('D+1 ');
    const horaFim = terminaNoDiaSeguinte ? time.slice(4) : time;

    const base = new Date(form.inicio);

    const [sh, sm] = startHour.split(':').map(Number);
    const [eh, em] = horaFim.split(':').map(Number);

    const inicio = new Date(base);
    inicio.setHours(sh, sm, 0, 0);

    const fim = new Date(base);

    // Avança a data antes de definir o horário final.
    if (terminaNoDiaSeguinte) {
      fim.setDate(fim.getDate() + 1);
    } else {
      // Protege também o caso de um horário final menor ou igual
      // ao inicial, caso esse formato seja permitido pela regra.
      const minutosInicio = sh * 60 + sm;
      const minutosFim = eh * 60 + em;

      if (minutosFim <= minutosInicio) {
        fim.setDate(fim.getDate() + 1);
      }
    }

    fim.setHours(eh, em, 0, 0);

    setForm((prev) => ({
      ...prev,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    }));

    setEndHour(time);
    setEditField(null);
    setChainedFromVehicle(false);
    setStep(1);
  };

  // ============================================================
  // EDITAR VEÍCULO
  // ============================================================

  const handleEditVehicle = () => {
    setError(null);
    limparError();
    setChainedFromVehicle(false);

    if (isEmpresa) {
      setSelectedDriverId('');
      setSelectedVehicleId('');

      setForm((prev) => ({
        ...prev,
        motoristaId: '',
        veiculoId: '',
      }));

      setVehiclePage(0);
    } else {
      setSelectedVehicleId(form.veiculoId);
    }

    setEditField('veiculo-origem');
  };

  // ============================================================
  // EDITAR HORÁRIO
  // ============================================================

  const handleEditTime = () => {
    setError(null);
    limparError();
    setChainedFromVehicle(false);

    const dia = new Date(form.inicio);

    setField('day', dia);
    setField('startHour', null);
    setField('veiculoId', form.veiculoId);

    setStartHour(null);
    setEndHour(null);
    setSelectedVehicleId(form.veiculoId);
    setEditField('horario');
    setStep(3);
  };

  // ============================================================
  // CARREGAMENTO
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <p>Carregando edição</p>
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <h1 className="font-semibold text-gray-900">
          {editField === 'horario'
            ? chainedFromVehicle
              ? 'Selecionar horário do novo motorista/veículo'
              : 'Selecionar horário'
            : editField === 'veiculo-origem'
              ? isEmpresa
                ? 'Selecionar motorista e veículo'
                : 'Editar veículo'
              : 'Gerenciar reserva'}
        </h1>

        <button
          onClick={
            editField
              ? () => {
                  setEditField(null);
                  setChainedFromVehicle(false);
                  setError(null);
                  limparError();
                }
              : onClose
          }
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 px-5 pt-4">
          {(error || apiError || dataError) && (
            <div className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error || apiError || dataError}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <main>
          {!editField && (
            <ReservaSummary
              form={form}
              initialForm={{
                inicio: initialForm.inicio,
                fim: initialForm.fim,
                cidadeOrigem: initialForm.cidadeOrigem,
              }}
              veiculo={veiculo}
              initialVeiculoId={initialForm.veiculoId}
              vaga={vaga}
              isSaving={isSaving}
              hasUser={!!user}
              onSave={handleSave}
              onEditVehicle={handleEditVehicle}
              onEditTime={handleEditTime}
            />
          )}

          {editField === 'veiculo-origem' && (
            <>
              {isEmpresa && !selectedDriverId && (
                <MotoristaStep
                  empresaId={empresaId}
                  selectedDriverId={selectedDriverId}
                  onDriverChange={handleDriverChange}
                />
              )}

              {(!isEmpresa || !!selectedDriverId) && (
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
                  onNext={(cidade, entradaCidade, veiculoId) => {
                    if (!veiculoId) return;

                    setForm((prev) => ({
                      ...prev,
                      cidadeOrigem: cidade,
                      veiculoId,
                      motoristaId: selectedDriverId || prev.motoristaId,
                    }));

                    setField('veiculoId', veiculoId);

                    if (isEmpresa) {
                      if (!vaga) {
                        setError(
                          'Não foi possível identificar a vaga da reserva.',
                        );
                        return;
                      }

                      /*
                       * A alteração do veículo pode mudar os horários
                       * disponíveis. Abrimos a etapa de horário para
                       * que sejam consultados pelo novo tipo de veículo.
                       */
                      const dia = new Date(form.inicio);

                      setField('day', dia);
                      setField('startHour', null);

                      setStartHour(null);
                      setEndHour(null);
                      setChainedFromVehicle(true);
                      setEditField('horario');
                      setStep(3);
                      return;
                    }

                    setEditField(null);
                  }}
                  onBack={() => {
                    if (isEmpresa) {
                      setSelectedDriverId('');
                      setSelectedVehicleId('');
                      setVehiclePage(0);
                    } else {
                      setEditField(null);
                    }
                  }}
                />
              )}
            </>
          )}

          {editField === 'horario' && (
            <>
              {loadingHorarios && (
                <div className="flex items-center gap-2 px-5 py-4 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando horários disponíveis...
                </div>
              )}

              {!loadingHorarios && !horariosCarregados && (
                <p className="px-5 py-4 text-sm text-gray-500">
                  Aguardando a consulta dos horários...
                </p>
              )}

              {!loadingHorarios && horariosCarregados && (
                <EditTimeForm
                  step={step}
                  availableTimes={availableTimes}
                  availableTimesNextDay={availableTimesNextDay}
                  podeContinuarNoDiaSeguinte={podeContinuarNoDiaSeguinte}
                  reservedTimesStart={reservedTimesStart}
                  reservedTimesEnd={reservedTimesEnd}
                  startHour={startHour}
                  endHour={endHour}
                  onSelectStart={(time) => {
                    setStartHour(time);
                    setEndHour(null);
                    setField('startHour', time);
                    setStep(4);
                  }}
                  onSelectEnd={handleTimeSelectEnd}
                  onBackToStart={() => {
                    setStartHour(null);
                    setEndHour(null);
                    setField('startHour', null);
                    setStep(3);
                  }}
                  onBack={() => {
                    if (chainedFromVehicle && isEmpresa) {
                      setChainedFromVehicle(false);
                      setEditField('veiculo-origem');
                      return;
                    }

                    setEditField(null);
                    setStep(1);
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
