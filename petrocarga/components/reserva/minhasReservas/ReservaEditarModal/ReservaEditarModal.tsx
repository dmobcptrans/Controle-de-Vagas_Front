'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';

import { ReservaGet } from '@/lib/types/reserva';
import { atualizarReserva } from '@/lib/api/reservaApi';
import { useAuth } from '@/components/hooks/useAuth';
import { useReserva } from '../../hooks/useReserva';
import OriginVehicleStep from '../../OriginVehicleStep';

import { useReservaData } from './useReservaData';
import { ReservaSummary } from './ReservaSummary';
import { EditTimeForm } from './EditTimeForm';

interface ReservaEditarProps {
  reserva: ReservaGet;
  onClose?: () => void;
  onSuccess?: (reservaAtualizada: ReservaGet) => void;
}

type EditField = null | 'horario' | 'veiculo-origem';

export default function ReservaEditarModal({
  reserva,
  onClose,
  onSuccess,
}: ReservaEditarProps) {
  const router = useRouter();
  const { user } = useAuth();

  /* =====================
     ESTADOS DE REFERÊNCIA
  ====================== */
  const [initialForm] = useState({
    veiculoId: reserva.veiculoId,
    cidadeOrigem: reserva.cidadeOrigem,
    inicio: reserva.inicio,
    fim: reserva.fim,
  });

  /* =====================
     ESTADO EDITÁVEL
  ====================== */
  const [form, setForm] = useState({ ...initialForm });

  /* =====================
     UI
  ====================== */
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editField, setEditField] = useState<EditField>(null);

  /* =====================
     DADOS
  ====================== */
  const {
    veiculo,
    vaga,
    loading,
    error: dataError,
  } = useReservaData(form.veiculoId, reserva.vagaId);

  const {
    step,
    setStep,
    setSelectedDay,
    fetchHorariosDisponiveis,
    availableTimes,
    reservedTimesStart,
    reservedTimesEnd,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    vehicles,
    origin,
    setOrigin,
    entryCity,
    setEntryCity,
    selectedVehicleId,
    setSelectedVehicleId,
  } = useReserva(vaga);

  const vehiclesForStep = vehicles.map((v) => ({
    id: v.id,
    name: `${v.marca} ${v.modelo}`,
    plate: v.placa,
  }));

  useEffect(() => {
    if (!origin) {
      setOrigin(initialForm.cidadeOrigem);
    }

    if (!selectedVehicleId) {
      setSelectedVehicleId(initialForm.veiculoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================
     AÇÕES
  ====================== */
  const handleSave = async () => {
    if (!user?.id) {
      setError('Sessão expirada');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const result = await atualizarReserva(
      {
        veiculoId: form.veiculoId,
        cidadeOrigem: form.cidadeOrigem,
        inicio: form.inicio,
        fim: form.fim,
        status: 'RESERVADA',
      },
      reserva.id,
      user.id,
    );

    if (!result.success) {
      setError(result.message);
      setIsSaving(false);
      return;
    }

    const updatedReserva: ReservaGet = {
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

    setIsSaving(false);
  };

  const handleTimeSelectEnd = (t: string) => {
    if (!startHour) return;

    const base = new Date(form.inicio);

    const [sh, sm] = startHour.split(':').map(Number);
    const [eh, em] = t.split(':').map(Number);

    const inicio = new Date(base);
    inicio.setHours(sh, sm, 0, 0);

    const fim = new Date(base);
    fim.setHours(eh, em, 0, 0);

    setForm((prev) => ({
      ...prev,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    }));

    setEditField(null);
    setStep(1);
  };

  /* =====================
     RENDER
  ====================== */
  if (loading) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center min-h-[320px]">
        <p>Carregando Edição</p>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b">
        <h1 className="font-semibold text-gray-900">
          {editField === 'horario'
            ? 'Selecionar horário'
            : editField === 'veiculo-origem'
              ? 'Editar veículo'
              : 'Gerenciar reserva'}
        </h1>

        <button
          onClick={editField ? () => setEditField(null) : onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4 space-y-3">
          {(error || dataError) && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm flex gap-2">
              <AlertCircle size={16} />
              <span>{error || dataError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm flex gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <main className="">
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
              onEditVehicle={() => setEditField('veiculo-origem')}
              onEditTime={async () => {
                const dia = new Date(form.inicio);
                setSelectedDay(dia);
                setEditField('horario');

                if (vaga) {
                  await fetchHorariosDisponiveis(dia, vaga, form.veiculoId);
                  setStep(3);
                }
              }}
            />
          )}

          {editField === 'veiculo-origem' && (
            <OriginVehicleStep
              vehicles={vehiclesForStep}
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
                  veiculoId: veiculoId,
                }));

                setEditField(null);
              }}
              onBack={() => setEditField(null)}
            />
          )}

          {editField === 'horario' && (
            <EditTimeForm
              step={step}
              availableTimes={availableTimes}
              reservedTimesStart={reservedTimesStart}
              reservedTimesEnd={reservedTimesEnd}
              startHour={startHour}
              endHour={endHour}
              onSelectStart={(t) => {
                setStartHour(t);
                setEndHour(null);
                setStep(4);
              }}
              onSelectEnd={handleTimeSelectEnd}
              onBackToStart={() => setStep(3)}
              onBack={() => setEditField(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
