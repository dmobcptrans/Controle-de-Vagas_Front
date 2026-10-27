import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import { getOperacoesDia, toMinutes } from '@/features/reserva/reservar-vaga/hooks/reservaHelpers';

/** Regras PURAS da reserva rápida: "a vaga está livre agora? até quando?" */

export interface Bloqueio {
  inicio: string;
  fim: string;
}

export interface SlotLivre {
  inicio: Date;
  fim: Date | null;
  duracaoMinutos: number | null;
}

export interface StatusAgora {
  vagaDisponivel: boolean;
  slotLivre: SlotLivre | null;
}

const MS_MIN = 60_000;
const SLOT_MINIMO_MIN = 15; // menor janela útil
const SLOT_CURTO_MIN = 30; // janelas <= 30min são exibidas como 15min
const MARGEM_INICIO_MIN = 15; // 15min antes de uma reserva já conta como ocupado

const minutosEntre = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / MS_MIN);

const criarSlot = (inicio: Date, fim: Date): SlotLivre => ({
  inicio,
  fim,
  duracaoMinutos: minutosEntre(inicio, fim),
});

export const estaOcupadoAgora = (bloqueios: Bloqueio[], agora: Date) =>
  bloqueios.some((b) => {
    if (!b.inicio || !b.fim) return false;
    const inicioComMargem = new Date(b.inicio).getTime() - MARGEM_INICIO_MIN * MS_MIN;
    return agora.getTime() >= inicioComMargem && agora < new Date(b.fim);
  });

export const encontrarProximoSlotLivre = (
  bloqueios: Bloqueio[],
  agora: Date,
  limite: Date,
): SlotLivre => {
  const ordenados = bloqueios
    .map((b) => ({ inicio: new Date(b.inicio), fim: new Date(b.fim) }))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

  let cursor = new Date(agora);

  for (const atual of ordenados) {
    if (cursor.getTime() + SLOT_MINIMO_MIN * MS_MIN <= atual.inicio.getTime()) {
      return criarSlot(new Date(cursor), atual.inicio);
    }
    if (cursor < atual.fim) cursor = new Date(atual.fim);
  }

  return criarSlot(cursor, limite);
};

const ajustarSlotCurto = (s: SlotLivre): SlotLivre =>
  s.fim && minutosEntre(s.inicio, s.fim) <= SLOT_CURTO_MIN
    ? criarSlot(s.inicio, new Date(s.inicio.getTime() + SLOT_MINIMO_MIN * MS_MIN))
    : s;

/** Junta tudo: disponibilidade AGORA + próximo slot livre. */
export function analisarAgora(
  bloqueios: Bloqueio[],
  vaga: VagaResponse,
  agora = new Date(),
): StatusAgora {
  const operacoes = getOperacoesDia(agora, vaga);

  if (!operacoes.length) {
    return { vagaDisponivel: false, slotLivre: null };
  }

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  const operacaoAtual = operacoes.find((operacao) => {
    const inicio = toMinutes(operacao.horaInicio);
    const fim = toMinutes(operacao.horaFim);

    return minutosAgora >= inicio && minutosAgora < fim;
  });

  if (!operacaoAtual) {
    return { vagaDisponivel: false, slotLivre: null };
  }

  const limite = new Date(agora);
  const [h, m] = operacaoAtual.horaFim.split(':').map(Number);
  limite.setHours(h, m, 0, 0);

  const slotLivre = ajustarSlotCurto(
    encontrarProximoSlotLivre(bloqueios, agora, limite),
  );

  if (estaOcupadoAgora(bloqueios, agora)) {
    return {
      vagaDisponivel: false,
      slotLivre: slotLivre.inicio < limite ? slotLivre : null,
    };
  }

  return {
    vagaDisponivel: true,
    slotLivre,
  };
}