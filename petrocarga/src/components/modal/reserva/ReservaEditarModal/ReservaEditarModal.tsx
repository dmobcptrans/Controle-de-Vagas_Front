'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';

import { ReservaGet } from '@/lib/types/reservas/reserva';
import { atualizarReserva } from '@/services/api/reservaApi';
import { useAuth } from '@/components/hooks/useAuth';

import { useReserva } from '../../../hooks/reserva/useReserva';
import OriginVehicleStep from '../../../reserva/OriginVehicleStep';
import MotoristaStep from '@/components/reserva/MotoristaStep';

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

  // ============================================================
  // TIPO DE USUÁRIO
  // ============================================================

  const isEmpresa = user?.permissao === 'EMPRESA';

  const empresaId = user?.id ?? '';

  // ============================================================
  // ESTADO INICIAL
  // ============================================================

  const [initialForm] = useState({
    veiculoId: reserva.veiculo.id,
    cidadeOrigem: reserva.cidadeOrigem,
    inicio: reserva.inicio,
    fim: reserva.fim,
    motoristaId: reserva.motorista?.id ?? '',
  });

  // ============================================================
  // ESTADO EDITÁVEL
  // ============================================================

  const [form, setForm] = useState({
    ...initialForm,
  });

  // ============================================================
  // ESTADOS DA UI
  // ============================================================

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editField, setEditField] = useState<EditField>(null);

  /*
   * Indica que a etapa de horário foi aberta como continuação
   * automática da troca de motorista/veículo (fluxo de empresa),
   * e não como uma edição independente disparada pelo resumo.
   */
  const [chainedFromVehicle, setChainedFromVehicle] = useState(false);

  // ============================================================
  // ESTADO DO MOTORISTA
  // ============================================================

  const [selectedDriverId, setSelectedDriverId] = useState(
    initialForm.motoristaId,
  );

  // ============================================================
  // DADOS DA RESERVA
  // ============================================================

  const {
    veiculo,
    vaga,
    loading,
    error: dataError,
  } = useReservaData(form.veiculoId, reserva.vaga.id);

  // ============================================================
  // HOOK DE RESERVA
  // ============================================================

  const {
    step,
    setStep,

    setSelectedDay,

    fetchHorariosDisponiveis,
    fetchVeiculosMotorista,

    availableTimes,
    reservedTimesStart,
    reservedTimesEnd,

    startHour,
    setStartHour,

    endHour,
    setEndHour,

    vehicles,

    vehiclePage,
    vehiclesLoading,
    vehicleTotalPages,
    setVehiclePage,

    origin,
    setOrigin,

    entryCity,
    setEntryCity,

    selectedVehicleId,
    setSelectedVehicleId,
  } = useReserva(vaga);

  // ============================================================
  // VEÍCULOS FORMATADOS PARA O COMPONENTE
  // ============================================================

  const vehiclesForStep = vehicles.map((v) => ({
    id: v.id,
    name: `${v.marca} ${v.modelo}`,
    plate: v.placa,
  }));

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  useEffect(() => {
    if (isEmpresa && initialForm.motoristaId) {
      setSelectedDriverId(initialForm.motoristaId);

      setVehiclePage(0);

      fetchVeiculosMotorista(initialForm.motoristaId, 0);
    }
    // Executa somente na abertura do modal.
    // As funções do useReserva não são estáveis entre renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // SELEÇÃO DO MOTORISTA
  // ============================================================

  const handleDriverChange = async (driverId: string) => {
    setSelectedDriverId(driverId);

    setForm((prev) => ({
      ...prev,
      motoristaId: driverId,
    }));

    setSelectedVehicleId('');
    setVehiclePage(0);

    await fetchVeiculosMotorista(driverId, 0);
  };

  // ============================================================
  // SALVAMENTO
  // ============================================================

  const handleSave = async () => {
    if (!user?.id) {
      setError('Sessão expirada');
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

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const result = await atualizarReserva(
        {
          veiculoId: form.veiculoId,
          cidadeOrigem: form.cidadeOrigem,
          inicio: form.inicio,
          fim: form.fim,
          status: 'RESERVADA',
          // Empresa pode trocar o motorista vinculado à reserva.
          ...(isEmpresa ? { motoristaId: form.motoristaId } : {}),
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar a reserva.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // SELEÇÃO DO HORÁRIO FINAL
  // ============================================================

  const handleTimeSelectEnd = (time: string) => {
    if (!startHour) return;

    const base = new Date(form.inicio);

    const [sh, sm] = startHour.split(':').map(Number);

    const [eh, em] = time.split(':').map(Number);

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
    setChainedFromVehicle(false);

    setStep(1);
  };

  // ============================================================
  // EDITAR VEÍCULO (E MOTORISTA, QUANDO EMPRESA)
  // ============================================================

  const handleEditVehicle = () => {
    setError(null);
    setChainedFromVehicle(false);

    if (isEmpresa) {
      /*
       * Para empresa, sempre voltamos para a seleção
       * do motorista.
       *
       * Isso permite trocar o motorista e, depois,
       * carregar os veículos vinculados a ele.
       */
      setSelectedDriverId('');
      setSelectedVehicleId('');
      setVehiclePage(0);
    } else {
      /*
       * Usuário comum continua diretamente
       * na seleção do veículo.
       */
      setSelectedVehicleId(form.veiculoId);
    }

    setEditField('veiculo-origem');
  };

  // ============================================================
  // EDITAR HORÁRIO
  // ============================================================

  const handleEditTime = async () => {
    setError(null);
    setChainedFromVehicle(false);

    const dia = new Date(form.inicio);

    setSelectedDay(dia);

    setSelectedVehicleId(form.veiculoId);

    setEditField('horario');

    try {
      if (!vaga) {
        setError('Não foi possível identificar a vaga da reserva.');

        return;
      }

      /*
       * Muito importante:
       *
       * No caso de EMPRESA, os horários precisam ser
       * buscados utilizando o veículo atualmente
       * selecionado na reserva.
       */
      await fetchHorariosDisponiveis(dia, vaga, form.veiculoId);

      /*
       * O EditTimeForm usa:
       *
       * 3 = horário inicial
       * 4 = horário final
       */
      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os horários.',
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center min-h-[320px]">
        <p>Carregando edição</p>

        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* ======================================================
          HEADER
      ====================================================== */}

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
                }
              : onClose
          }
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
        >
          <X size={18} />
        </button>
      </header>

      {/* ======================================================
          CONTEÚDO
      ====================================================== */}

      <div className="flex-1 overflow-y-auto">
        {/* ====================================================
            MENSAGENS
        ==================================================== */}

        <div className="px-5 pt-4 space-y-3">
          {(error || dataError) && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm flex gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />

              <span>{error || dataError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm flex gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />

              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <main>
          {/* ==================================================
              MODO RESUMO
          ================================================== */}

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

          {/* ==================================================
              MODO EDIÇÃO DE VEÍCULO / ORIGEM
          ================================================== */}

          {editField === 'veiculo-origem' && (
            <>
              {/* =================================================
                  EMPRESA → MOTORISTA
              ================================================= */}

              {isEmpresa && !selectedDriverId && (
                <MotoristaStep
                  empresaId={empresaId}
                  selectedDriverId={selectedDriverId}
                  onDriverChange={handleDriverChange}
                />
              )}

              {/* =================================================
                  EMPRESA → VEÍCULO
                  OU
                  USUÁRIO COMUM → VEÍCULO
              ================================================= */}

              {(!isEmpresa || !!selectedDriverId) && (
                <OriginVehicleStep
                  vehicles={vehiclesForStep}
                  vehiclesLoading={vehiclesLoading}
                  vehiclePage={vehiclePage}
                  vehicleTotalPages={vehicleTotalPages}
                  onVehiclePageChange={(page) => {
                    setVehiclePage(page);

                    if (isEmpresa && selectedDriverId) {
                      fetchVeiculosMotorista(selectedDriverId, page);
                    }
                  }}
                  motoristaId={selectedDriverId}
                  isEmpresa={isEmpresa}
                  origin={origin}
                  entryCity={entryCity}
                  selectedVehicleId={selectedVehicleId}
                  onOriginChange={setOrigin}
                  onEntryCityChange={setEntryCity}
                  onVehicleChange={setSelectedVehicleId}
                  onNext={async (cidade, entradaCidade, veiculoId) => {
                    if (!veiculoId) {
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      cidadeOrigem: cidade,
                      veiculoId: veiculoId,
                      motoristaId: selectedDriverId || prev.motoristaId,
                    }));

                    if (isEmpresa) {
                      setError(null);

                      if (!vaga) {
                        setError(
                          'Não foi possível identificar a vaga da reserva.',
                        );
                        setEditField(null);
                        return;
                      }

                      try {
                        const dia = new Date(form.inicio);

                        setSelectedDay(dia);
                        setSelectedVehicleId(veiculoId);

                        const horarios = await fetchHorariosDisponiveis(
                          dia,
                          vaga,
                          veiculoId,
                        );

                        // Extrai HH:mm do form.inicio/fim atuais para comparar
                        const inicioAtual = new Date(form.inicio);
                        const fimAtual = new Date(form.fim);
                        const startAtual = inicioAtual
                          .toTimeString()
                          .slice(0, 5);
                        const endAtual = fimAtual.toTimeString().slice(0, 5);

                        // Verifica se o intervalo atual ainda está disponível
                        // para o novo veículo (ajuste conforme o formato real
                        // que fetchHorariosDisponiveis/availableTimes retornam).
                        const aindaValido =
                          horarios?.includes(startAtual) &&
                          horarios?.includes(endAtual) &&
                          !reservedTimesStart?.includes(startAtual) &&
                          !reservedTimesEnd?.includes(endAtual);

                        if (aindaValido) {
                          // Veículo/motorista trocados, horário mantido.
                          setEditField(null);
                          return;
                        }

                        // Horário não é mais válido para essa combinação:
                        // aí sim encadeamos para a seleção de horário.
                        setStartHour(null);
                        setEndHour(null);
                        setChainedFromVehicle(true);
                        setEditField('horario');
                        setStep(3);
                      } catch (err) {
                        setError(
                          err instanceof Error
                            ? err.message
                            : 'Não foi possível carregar os horários para o novo veículo.',
                        );
                        setEditField(null);
                      }

                      return;
                    }

                    setEditField(null);
                  }}
                  onBack={() => {
                    if (isEmpresa) {
                      /*
                       * Volta para a seleção
                       * do motorista.
                       */
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

          {/* ==================================================
              MODO EDIÇÃO DE HORÁRIO
          ================================================== */}

          {editField === 'horario' && (
            <EditTimeForm
              step={step}
              availableTimes={availableTimes}
              reservedTimesStart={reservedTimesStart}
              reservedTimesEnd={reservedTimesEnd}
              startHour={startHour}
              endHour={endHour}
              onSelectStart={(time) => {
                setStartHour(time);
                setEndHour(null);
                setStep(4);
              }}
              onSelectEnd={handleTimeSelectEnd}
              onBackToStart={() => setStep(3)}
              onBack={() => {
                if (chainedFromVehicle && isEmpresa) {
                  /*
                   * Veio do fluxo encadeado motorista/veículo → horário.
                   * Voltar deve retornar para a etapa de veículo,
                   * mantendo o motorista já selecionado.
                   */
                  setChainedFromVehicle(false);
                  setEditField('veiculo-origem');
                  return;
                }

                setEditField(null);
                setStep(1);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
