import type {
  DiaSemana,
  OperacoesVaga,
  VagaResponse,
} from '@/features/vaga/vagas/types/vaga';
import type { ReservaBloqueiosResponse } from '../../reservas/types/reservas';


export const DIAS_SEMANA: DiaSemana[] = [
  'DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO',
];

export const INTERVALO_MINUTOS = { AGENTE: 15, MOTORISTA: 30 } as const;

export const LIMITE_HORAS_POR_AREA: Record<string, number> = {
  VERMELHA: 1,
  AMARELA: 2,
  AZUL: 4,
  BRANCA: 6,
};

// ---------- conversões ----------
const pad = (n: number) => String(n).padStart(2, '0');

/** "HH:mm" -> minutos desde 00:00 */
export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Date -> "HH:mm" (horário local) */
export const toHHmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Date -> "YYYY-MM-DD" no fuso LOCAL (toISOString() usa UTC e pode virar o dia) */
export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** dia + "HH:mm" -> ISO string */
export const formatDateTime = (day: Date, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date(day);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

const isMesmoDia = (a: Date, b: Date) => toDateKey(a) === toDateKey(b);

// ---------- operação / grade de horários ----------
export const getOperacaoDia = (
  day: Date,
  vaga: { operacoesVaga?: OperacoesVaga[] },
) => vaga.operacoesVaga?.find((op) => op.diaSemanaAsEnum === DIAS_SEMANA[day.getDay()]);

export const gerarHorariosDia = (operacao: OperacoesVaga, intervalo: number) => {
  const fim = toMinutes(operacao.horaFim);
  const times: string[] = [];
  for (let t = toMinutes(operacao.horaInicio); t <= fim; t += intervalo) {
    times.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return times;
};

export const removerHorariosPassados = (day: Date, horarios: string[], agora = new Date()) => {
  if (!isMesmoDia(day, agora)) return horarios;
  const atual = agora.getHours() * 60 + agora.getMinutes();
  return horarios.filter((h) => toMinutes(h) > atual);
};

// ---------- bloqueios ----------
/**
 * Expande cada bloqueio em slots "HH:mm".
 * `margem` recua o início (usado p/ impedir início colado numa reserva existente).
 */
export const expandirBloqueios = (
  bloqueios: Pick<ReservaBloqueiosResponse, 'inicio' | 'fim'>[],
  intervalo: number,
  margem = 0,
) => {
  const slots = new Set<string>();
  for (const b of bloqueios) {
    const inicio = new Date(b.inicio);
    const fim = new Date(b.fim);
    if (fim <= inicio) fim.setDate(fim.getDate() + 1); // vira a noite

    const cur = new Date(inicio);
    cur.setMinutes(cur.getMinutes() - margem);
    while (cur <= fim) {
      slots.add(toHHmm(cur));
      cur.setMinutes(cur.getMinutes() + intervalo);
    }
  }
  return Array.from(slots);
};

export const calcularHorarios = (
  day: Date,
  vaga: VagaResponse,
  bloqueios: ReservaBloqueiosResponse[],
  intervalo: number,
) => {
  const operacao = getOperacaoDia(day, vaga);
  if (!operacao) return { availableTimes: [], reservedStart: [], reservedEnd: [] };

  const reservedStart = expandirBloqueios(bloqueios, intervalo, intervalo);
  const reservedEnd = expandirBloqueios(bloqueios, intervalo);
  const availableTimes = removerHorariosPassados(day, gerarHorariosDia(operacao, intervalo))
    .filter((h) => !reservedStart.includes(h));

  return { availableTimes, reservedStart, reservedEnd };
};

/** Horários de FIM bloqueados após escolher o início (limite por área + já ocupados). */
export const calcularFimBloqueado = (
  inicio: string,
  availableTimes: string[],
  area: string,
  reservedEndBase: string[],
) => {
  const limite = toMinutes(inicio) + (LIMITE_HORAS_POR_AREA[area] ?? 1) * 60;
  return availableTimes.filter(
    (h) => toMinutes(h) > toMinutes(inicio) && (toMinutes(h) > limite || reservedEndBase.includes(h)),
  );
};

// ---------- dias disponíveis ----------
export const calcularDiasDisponiveis = (
  disponibilidades: { inicio: string; fim: string }[],
  vaga: VagaResponse,
  agora = new Date(),
) => {
  const hoje = new Date(agora);
  hoje.setHours(0, 0, 0, 0);

  const datas = new Map<string, Date>();

  for (const disp of disponibilidades) {
    const cur = new Date(disp.inicio);
    const fim = new Date(disp.fim);
    cur.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);

    for (; cur <= fim; cur.setDate(cur.getDate() + 1)) {
      if (cur < hoje) continue;
      const operacao = getOperacaoDia(cur, vaga);
      if (!operacao) continue;
      // hoje: só vale se a operação ainda não terminou
      if (isMesmoDia(cur, agora) && agora.getHours() * 60 + agora.getMinutes() >= toMinutes(operacao.horaFim)) continue;

      datas.set(toDateKey(cur), new Date(cur));
    }
  }
  return Array.from(datas.values());
};