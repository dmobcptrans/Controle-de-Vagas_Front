
import type {
  DiaSemana,
  OperacoesVaga,
  VagaResponse,
} from '@/features/vaga/vagas/types/vaga';

import type {
  ReservaBloqueiosResponse,
} from '../../reservas/types/reservas';

export const DIAS_SEMANA: DiaSemana[] = [
  'DOMINGO',
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
];

export const INTERVALO_MINUTOS = {
  AGENTE: 15,
  MOTORISTA: 30,
} as const;

export const LIMITE_HORAS_POR_AREA: Record<string, number> = {
  VERMELHA: 1,
  AMARELA: 2,
  AZUL: 4,
  BRANCA: 6,
};

const MINUTOS_DIA = 24 * 60;

const pad = (n: number) => String(n).padStart(2, '0');

/** HH:mm -> minutos desde 00:00. */
export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Date -> HH:mm no horário local. */
export const toHHmm = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** Date -> YYYY-MM-DD no horário local. */
export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Soma dias sem alterar a data original. */
export const adicionarDia = (day: Date, quantidade = 1) => {
  const result = new Date(day);
  result.setDate(result.getDate() + quantidade);
  return result;
};

/** Dia + HH:mm -> ISO string. */
export const formatDateTime = (day: Date, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date(day);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

const isMesmoDia = (a: Date, b: Date) =>
  toDateKey(a) === toDateKey(b);

// ---------- operação / grade de horários ----------

export const getOperacaoDia = (
  day: Date,
  vaga: { operacoesVaga?: OperacoesVaga[] },
) =>
  vaga.operacoesVaga?.find(
    (op) => op.diaSemanaAsEnum === DIAS_SEMANA[day.getDay()],
  );

/**
 * Gera os horários da operação do dia.
 * A grade considera operações que terminam até 23:59.
 * A continuação após meia-noite é gerada pela operação do dia seguinte.
 */
export const gerarHorariosDia = (
  operacao: OperacoesVaga,
  intervalo: number,
) => {
  const inicio = toMinutes(operacao.horaInicio);
  const fim = toMinutes(operacao.horaFim);
  const times: string[] = [];

  if (fim < inicio) return times;

  for (let t = inicio; t <= fim; t += intervalo) {
    times.push(
      `${pad(Math.floor(t / 60))}:${pad(t % 60)}`,
    );
  }

  return times;
};

export const removerHorariosPassados = (
  day: Date,
  horarios: string[],
  agora = new Date(),
) => {
  if (!isMesmoDia(day, agora)) return horarios;

  const atual = agora.getHours() * 60 + agora.getMinutes();

  return horarios.filter((h) => toMinutes(h) > atual);
};

// ---------- bloqueios ----------

/**
 * Expande bloqueios em slots HH:mm.
 * A margem recua o início do bloqueio para impedir reservas
 * que comecem imediatamente antes de outra reserva.
 */
export const expandirBloqueios = (
  bloqueios: Pick<ReservaBloqueiosResponse, 'inicio' | 'fim'>[],
  intervalo: number,
  margem = 0,
) => {
  const slots = new Set<string>();

  for (const bloqueio of bloqueios) {
    const inicio = new Date(bloqueio.inicio);
    const fim = new Date(bloqueio.fim);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime())
    ) {
      continue;
    }

    const cursor = new Date(inicio);
    cursor.setMinutes(cursor.getMinutes() - margem);

    while (cursor <= fim) {
      slots.add(toHHmm(cursor));
      cursor.setMinutes(cursor.getMinutes() + intervalo);
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

  if (!operacao) {
    return {
      availableTimes: [],
      reservedStart: [],
      reservedEnd: [],
    };
  }

  const reservedStart = expandirBloqueios(
    bloqueios,
    intervalo,
    intervalo,
  );

  const reservedEnd = expandirBloqueios(
    bloqueios,
    intervalo,
  );

  const availableTimes = removerHorariosPassados(
    day,
    gerarHorariosDia(operacao, intervalo),
  ).filter((hora) => !reservedStart.includes(hora));

  return {
    availableTimes,
    reservedStart,
    reservedEnd,
  };
};

/**
 * Converte horários para uma linha do tempo contínua.
 * Horários do dia seguinte devem receber +1440 minutos.
 */
export const calcularFimBloqueado = (
  inicio: string,
  availableTimes: string[],
  area: string,
  reservedEndBase: string[],
  horariosDiaSeguinte: string[] = [],
) => {
  const inicioMinutos = toMinutes(inicio);

  const limite =
    inicioMinutos +
    (LIMITE_HORAS_POR_AREA[area] ?? 1) * 60;

  const candidatos = [
    ...availableTimes.map((hora) => ({
      hora,
      minutos: toMinutes(hora),
      chave: hora,
      diaSeguinte: false,
    })),
    ...horariosDiaSeguinte.map((hora) => ({
      hora,
      minutos: MINUTOS_DIA + toMinutes(hora),
      chave: `D+1 ${hora}`,
      diaSeguinte: true,
    })),
  ];

  return candidatos
    .filter(({ minutos, chave }) => {
      const depoisDoInicio = minutos > inicioMinutos;
      const dentroDoLimite = minutos <= limite;
      const reservado = reservedEndBase.includes(chave);

      return (
        depoisDoInicio &&
        (!dentroDoLimite || reservado)
      );
    })
    .map(({ hora, diaSeguinte }) =>
      diaSeguinte ? `D+1 ${hora}` : hora,
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

  for (const disponibilidade of disponibilidades) {
    const cur = new Date(disponibilidade.inicio);
    const fim = new Date(disponibilidade.fim);

    cur.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);

    for (; cur <= fim; cur.setDate(cur.getDate() + 1)) {
      if (cur < hoje) continue;

      const operacao = getOperacaoDia(cur, vaga);

      if (!operacao) continue;

      if (
        isMesmoDia(cur, agora) &&
        agora.getHours() * 60 + agora.getMinutes() >=
          toMinutes(operacao.horaFim)
      ) {
        continue;
      }

      datas.set(toDateKey(cur), new Date(cur));
    }
  }

  return Array.from(datas.values());
};


/**
 * Converte o dia e o horário selecionado em ISO.
 * Horários com prefixo "D+1" pertencem ao dia seguinte.
 */
export const formatDateTimeReserva = (
  day: Date,
  horario: string,
) => {
  const diaSeguinte = horario.startsWith('D+1 ');
  const hora = diaSeguinte ? horario.slice(4) : horario;

  const data = diaSeguinte
    ? adicionarDia(day)
    : new Date(day);

  return formatDateTime(data, hora);
};