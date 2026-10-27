import { useCallback, useState } from 'react';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import type { ConfirmResult } from '@/lib/types/confirmResult';
import { useReservaMutation } from '../../reservas/hooks/useReservaMutation';

import { INTERVALO_MINUTOS } from './reservaHelpers';
import {
  buildPayload,
  FORM_INICIAL,
  personaMutation,
  resolvePersona,
  type ReservaForm,
} from './reservaPayload';
import { useDiasDisponiveis } from './steps/useDiasDisponiveis';
import { useHorariosReserva } from './steps/useHorariosReserva';
import { useVeiculosReserva } from './steps/useVeiculosReserva';

/**
 * Orquestrador do fluxo de reserva (MOTORISTA | EMPRESA | AGENTE).
 * Não tem regra de horário nem montagem de payload: só compõe os pedaços.
 */
export function useReserva(selectedVaga: VagaResponse | null) {
  const { user } = useAuth();
  const persona = resolvePersona(user?.permissao);

  const [form, setForm] = useState<ReservaForm>(FORM_INICIAL);

  /** setField('startHour', '08:00') — substitui os 9 setters antigos */
  const setField = useCallback(
    <K extends keyof ReservaForm>(key: K, value: ReservaForm[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );
  const reset = useCallback(() => setForm(FORM_INICIAL), []);

  // veículos
  const veiculos = useVeiculosReserva(persona, user?.id, form.motoristaId);

  // empresa escolhe motorista: limpa veículo e volta p/ página 0
  const selecionarMotorista = useCallback(
    (motoristaId: string) => {
      setForm((prev) => ({ ...prev, motoristaId, veiculoId: undefined }));
      veiculos.setVehiclePage(0);
    },
    [veiculos.setVehiclePage],
  );

  // dias
  const dias = useDiasDisponiveis(selectedVaga);

  // horários
  const tipoVeiculo =
    persona === 'AGENTE'
      ? form.tipoVeiculo
      : veiculos.vehicles.find((v) => v.id === form.veiculoId)?.tipo;

  const horarios = useHorariosReserva({
    vaga: selectedVaga,
    day: form.day,
    tipoVeiculo,
    startHour: form.startHour,
    intervalo:
      persona === 'AGENTE'
        ? INTERVALO_MINUTOS.AGENTE
        : INTERVALO_MINUTOS.MOTORISTA,
  });

  // confirmação
  const {
    criar,
    loading: confirmando,
    error: erroConfirmar,
  } = useReservaMutation();

  const confirmar = useCallback(async (): Promise<ConfirmResult> => {
    if (!user?.id || !selectedVaga) {
      return {
        success: false,
        message: 'Sessão inválida ou vaga não selecionada.',
      };
    }

    const built = buildPayload(persona, form, {
      vagaId: selectedVaga.id,
      userId: user.id,
    });
    if (!built.ok) return { success: false, message: built.message };

    const resultado = await criar(
      personaMutation(persona),
      built.ownerId,
      built.payload as never,
    );

    return resultado
      ? { success: true, message: 'Reserva confirmada com sucesso!' }
      : {
          success: false,
          message: erroConfirmar ?? 'Não foi possível confirmar a reserva.',
        };
  }, [user?.id, selectedVaga, persona, form, criar, erroConfirmar]);

  return {
    persona,
    isAgente: persona === 'AGENTE',
    isEmpresa: persona === 'EMPRESA',
    selectedVaga,

    form,
    setField,
    selecionarMotorista,
    reset,

    ...veiculos,
    ...dias,
    ...horarios,

    confirmando,
    confirmar,
  };
}
