import type {
  DiaSemana,
  OperacoesVaga,
  VagaResponse,
} from '@/features/vaga/vagas/types/vaga';

import type { ReservaBloqueiosResponse } from '../../reservas/types/reservas';

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

/** O FIM da reserva não pode passar de agora + 2 dias. */
export const LIMITE_DIAS_RESERVA = 2;

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

/** Dia + HH:mm -> Date. */
const toDateTime = (day: Date, hhmm: string) => {
  const [h, m] = hhmm.slice(0, 5).split(':').map(Number);
  const date = new Date(day);
  date.setHours(h, m, 0, 0);
  return date;
};

/** Dia + HH:mm -> ISO string. */
export const formatDateTime = (day: Date, hhmm: string) =>
  toDateTime(day, hhmm).toISOString();

const isMesmoDia = (a: Date, b: Date) => toDateKey(a) === toDateKey(b);

// ---------- limite de reserva ----------

/** Momento máximo permitido para o FIM da reserva. */
export const getLimiteReserva = (agora = new Date()) =>
  adicionarDia(agora, LIMITE_DIAS_RESERVA);

/** true se o dia + horário passa do limite. */
export const excedeLimiteReserva = (
  day: Date,
  hhmm: string,
  agora = new Date(),
) => toDateTime(day, hhmm) > getLimiteReserva(agora);

// ---------- operação / grade de horários ----------

export const getOperacoesDia = (
  day: Date,
  vaga: { operacoesVaga?: OperacoesVaga[] },
) =>
  (vaga.operacoesVaga ?? []).filter(
    (op) => op.diaSemanaAsEnum === DIAS_SEMANA[day.getDay()],
  );

/**
 * Gera os horários da operação do dia.
 * A grade considera operações que terminam até 23:59.
 * A continuação após meia-noite é gerada pela operação do dia seguinte.
 */
export const gerarHorariosDia = (
  operacoes: OperacoesVaga[],
  intervalo: number,
) => {
  const horarios = new Set<string>();

  for (const operacao of operacoes) {
    const inicio = toMinutes(operacao.horaInicio);
    const fim = toMinutes(operacao.horaFim);

    if (fim < inicio) continue;

    for (let t = inicio; t <= fim; t += intervalo) {
      horarios.add(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
    }
  }

  return Array.from(horarios).sort((a, b) => toMinutes(a) - toMinutes(b));
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

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
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
  const operacoes = getOperacoesDia(day, vaga);

  const reservedStart = expandirBloqueios(bloqueios, intervalo, intervalo);

  const reservedEnd = expandirBloqueios(bloqueios, intervalo);

  if (operacoes.length === 0) {
    return {
      availableTimes: [],
      reservedStart,
      reservedEnd,
    };
  }

  const agora = new Date();

  const availableTimes = removerHorariosPassados(
    day,
    gerarHorariosDia(operacoes, intervalo),
    agora,
  )
    .filter((hora) => !reservedStart.includes(hora))
    // horário acima do limite (agora + 2 dias) não pode ser escolhido
    .filter((hora) => !excedeLimiteReserva(day, hora, agora));

  return {
    availableTimes,
    reservedStart,
    reservedEnd,
  };
};

/**
 * Converte horários para uma linha do tempo contínua.
 * Horários do dia seguinte devem receber +1440 minutos.
 * Quando `day` é informado, fins acima do limite de reserva também são bloqueados.
 */
export const calcularFimBloqueado = (
  inicio: string,
  availableTimes: string[],
  area: string,
  reservedEndBase: string[],
  horariosDiaSeguinte: string[] = [],
  day?: Date,
) => {
  const inicioMinutos = toMinutes(inicio);

  const limite = inicioMinutos + (LIMITE_HORAS_POR_AREA[area] ?? 1) * 60;

  const agora = new Date();
  const diaSeguinte = day ? adicionarDia(day) : undefined;

  const candidatos = [
    ...availableTimes.map((hora) => ({
      hora,
      minutos: toMinutes(hora),
      chave: hora,
      diaSeguinte: false,
      excede: day ? excedeLimiteReserva(day, hora, agora) : false,
    })),
    ...horariosDiaSeguinte.map((hora) => ({
      hora,
      minutos: MINUTOS_DIA + toMinutes(hora),
      chave: `D+1 ${hora}`,
      diaSeguinte: true,
      excede: diaSeguinte
        ? excedeLimiteReserva(diaSeguinte, hora, agora)
        : false,
    })),
  ];

  return candidatos
    .filter(({ minutos, chave, excede }) => {
      const depoisDoInicio = minutos > inicioMinutos;
      const dentroDoLimite = minutos <= limite;
      const reservado = reservedEndBase.includes(chave);

      return depoisDoInicio && (!dentroDoLimite || reservado || excede);
    })
    .map(({ hora, diaSeguinte: ehDiaSeguinte }) =>
      ehDiaSeguinte ? `D+1 ${hora}` : hora,
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

  const limite = getLimiteReserva(agora);

  const datas = new Map<string, Date>();

  for (const disponibilidade of disponibilidades) {
    const cur = new Date(disponibilidade.inicio);
    const fim = new Date(disponibilidade.fim);

    cur.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);

    for (; cur <= fim; cur.setDate(cur.getDate() + 1)) {
      if (cur < hoje) continue;

      // dia inteiro fora do limite
      if (toDateTime(cur, '00:00') > limite) continue;

      const operacoes = getOperacoesDia(cur, vaga);

      if (operacoes.length === 0) continue;

      if (isMesmoDia(cur, agora)) {
        const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();

        const aindaTemHorario = operacoes.some(
          (operacao) => minutosAtuais < toMinutes(operacao.horaFim),
        );

        if (!aindaTemHorario) continue;
      }

      // dia-limite: precisa ter ao menos um início dentro do limite
      const temHorarioNoLimite = operacoes.some(
        (operacao) => toDateTime(cur, operacao.horaInicio) <= limite,
      );

      if (!temHorarioNoLimite) continue;

      datas.set(toDateKey(cur), new Date(cur));
    }
  }

  return Array.from(datas.values());
};

/**
 * Converte o dia e o horário selecionado em ISO.
 * Horários com prefixo "D+1" pertencem ao dia seguinte.
 */
export const formatDateTimeReserva = (day: Date, horario: string) => {
  const diaSeguinte = horario.startsWith('D+1 ');
  const hora = diaSeguinte ? horario.slice(4) : horario;

  const data = diaSeguinte ? adicionarDia(day) : new Date(day);

  return formatDateTime(data, hora);
};