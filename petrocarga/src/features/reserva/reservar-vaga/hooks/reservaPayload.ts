import type { VeiculoResponse } from '@/features/veiculos/types/veiculo';
import type { CriarReservaPayload } from '../../reservas/types/reservas';
import type { CriarReservaRapidaPayload } from '../../reservas/types/reservaRapida';
import { formatDateTime } from './reservaHelpers';

export type Persona = 'MOTORISTA' | 'EMPRESA' | 'AGENTE';

export const resolvePersona = (permissao?: string): Persona =>
  permissao === 'AGENTE' ? 'AGENTE' : permissao === 'EMPRESA' ? 'EMPRESA' : 'MOTORISTA';

/** O `criar` do useReservaMutation só conhece 'Motorista' | 'Agente'. */
export const personaMutation = (p: Persona) => (p === 'AGENTE' ? 'Agente' : 'Motorista');

/** Um único estado plano para todas as personas. */
export interface ReservaForm {
  step: number;
  day?: Date;
  startHour: string | null;
  endHour: string | null;
  cidadeOrigem: string;
  entradaCidade: string;
  posicaoPerpendicular: number;
  // motorista / empresa
  veiculoId?: string;
  motoristaId?: string; // empresa escolhe; motorista usa o próprio user.id
  // agente
  tipoVeiculo?: VeiculoResponse['tipo'];
  placa: string;
}

export const FORM_INICIAL: ReservaForm = {
  step: 1,
  day: undefined,
  startHour: null,
  endHour: null,
  cidadeOrigem: '',
  entradaCidade: '',
  posicaoPerpendicular: 0,
  veiculoId: undefined,
  motoristaId: undefined,
  tipoVeiculo: undefined,
  placa: '',
};

type BuildResult =
  | { ok: true; ownerId: string; payload: CriarReservaPayload | CriarReservaRapidaPayload }
  | { ok: false; message: string };

const fail = (message: string): BuildResult => ({ ok: false, message });

/** Valida + monta o payload certo para cada persona. */
export function buildPayload(
  persona: Persona,
  form: ReservaForm,
  ctx: { vagaId: string; userId: string },
): BuildResult {
  const { day, startHour, endHour } = form;
  if (!day || !startHour || !endHour) return fail('Data ou horário inválido.');

  // campos comuns a TODAS as personas
  const base = {
    vagaId: ctx.vagaId,
    inicio: formatDateTime(day, startHour),
    fim: formatDateTime(day, endHour),
    cidadeOrigem: form.cidadeOrigem || undefined,
    entradaCidade: form.entradaCidade || undefined,
    posicaoPerpendicular: form.posicaoPerpendicular ?? 0,
  };

  if (persona === 'AGENTE') {
    if (!form.tipoVeiculo || !form.placa) return fail('Informe o tipo do veículo e a placa.');
    return {
      ok: true,
      ownerId: ctx.userId,
      payload: { ...base, tipoVeiculo: form.tipoVeiculo, placa: form.placa } as CriarReservaRapidaPayload,
    };
  }

  const motoristaId = persona === 'EMPRESA' ? form.motoristaId : ctx.userId;
  if (!motoristaId) {
    return fail(persona === 'EMPRESA' ? 'Selecione um motorista da empresa.' : 'Dados do motorista incompletos.');
  }
  if (!form.veiculoId) return fail('Veículo não selecionado.');

  return {
    ok: true,
    ownerId: motoristaId,
    payload: { ...base, motoristaId, veiculoId: form.veiculoId } as CriarReservaPayload,
  };
}