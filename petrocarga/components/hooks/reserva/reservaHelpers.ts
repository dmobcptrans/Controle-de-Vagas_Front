import { DiaSemana, OperacoesVaga } from '@/lib/types/vaga';
import { Reserva } from '@/lib/types/reserva';
import { Vaga } from '@/lib/types/vaga';


/**
 * @module utils/reserva/horarios
 * @description Funções utilitárias para gerenciamento de horários no fluxo de reserva.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. DIAS_SEMANA - Constante com os dias da semana em português
 * 2. INTERVALO_MINUTOS - Intervalo padrão entre horários (30 minutos)
 * 3. padNumber - Preenche número com zero à esquerda
 * 4. formatDateTime - Formata data e hora para ISO string
 * 5. gerarHorariosOcupados - Gera horários ocupados por uma reserva
 * 6. gerarHorariosDia - Gera horários disponíveis para um dia baseado na operação
 * 7. getOperacaoDia - Retorna a operação de funcionamento para um dia específico
 * 8. gerarHorariosBloqueados - Gera horários bloqueados (reservas existentes)
 * 9. filtrarHorariosDisponiveis - Filtra horários disponíveis removendo os bloqueados
 * 10. removerHorariosPassadosDeHoje - Remove horários já passados (quando o dia é hoje)
 * 11. gerarHorariosOcupadosPorArea - Gera horários ocupados com limite por área
 */

export const DIAS_SEMANA: DiaSemana[] = [
  'DOMINGO',
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
];

/**
 * @function padNumber
 */
export const padNumber = (n: number): string => n.toString().padStart(2, '0');

/**
 * 🔥 NOVO: formatação padrão (remove dependência de 30min)
 */
const formatarHoraFromDate = (date: Date): string => {
  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
};

const formatarHora = (dateString: string): string => {
  return formatarHoraFromDate(new Date(dateString));
};

/**
 * @function formatDateTime
 */
export const formatDateTime = (day: Date, hour: string): string => {
  const [h, m] = hour.split(':').map(Number);
  const date = new Date(day);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

/**
 * gerarHorariosOcupadosInicio
 */
export const gerarHorariosOcupadosInicio = (
  reservas: Reserva[],
  intervalo: number
): string[] => {
  const resultado = new Set<string>();

  reservas.forEach((reserva) => {
    const inicio = new Date(reserva.inicio);
    const fim = new Date(reserva.fim);

    if (fim <= inicio) {
      fim.setDate(fim.getDate() + 1);
    }

    const current = new Date(inicio);
    current.setMinutes(current.getMinutes() - intervalo);

    while (current <= fim) {
      resultado.add(formatarHoraFromDate(current));
      current.setMinutes(current.getMinutes() + intervalo);
    }
  });

  return Array.from(resultado);
};

/**
 * gerarHorariosOcupadosFim
 */
export const gerarHorariosOcupadosFim = (
  reservas: Reserva[],
  intervalo: number
): string[] => {
  const resultado = new Set<string>();

  reservas.forEach((reserva) => {
    const inicio = new Date(reserva.inicio);
    const fim = new Date(reserva.fim);

    if (fim <= inicio) {
      fim.setDate(fim.getDate() + 1);
    }

    const current = new Date(inicio);

    while (current <= fim) {
      resultado.add(formatarHoraFromDate(current));
      current.setMinutes(current.getMinutes() + intervalo);
    }
  });

  return Array.from(resultado);
};

/**
 * gerarHorariosDia
 */
export const gerarHorariosDia = (
  operacao: OperacoesVaga,
  intervalo: number
): string[] => {
  const [hInicio, mInicio] = operacao.horaInicio.split(':').map(Number);
  const [hFim, mFim] = operacao.horaFim.split(':').map(Number);

  const times: string[] = [];
  let h = hInicio;
  let m = mInicio;

  while (h < hFim || (h === hFim && m <= mFim)) {
    times.push(`${padNumber(h)}:${padNumber(m)}`);

    m += intervalo;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }

  return times;
};

/**
 * getOperacaoDia
 */
export const getOperacaoDia = (
  day: Date,
  vaga: { operacoesVaga?: OperacoesVaga[] },
) => {
  const diaSemana = DIAS_SEMANA[day.getDay()];
  return vaga.operacoesVaga?.find((op) => op.diaSemanaAsEnum === diaSemana);
};

/**
 * gerarHorariosBloqueados
 */
export const gerarHorariosBloqueados = (
  bloqueios: { inicio: string; fim: string }[],
  intervalo: number
): string[] => {
  const horarios: string[] = [];

  bloqueios.forEach((b) => {
    const inicio = new Date(b.inicio);
    const fim = new Date(b.fim);
    const current = new Date(inicio);

    while (current < fim) {
      horarios.push(formatarHoraFromDate(current));
      current.setMinutes(current.getMinutes() + intervalo);
    }
  });

  return horarios;
};

/**
 * filtrarHorariosDisponiveis
 */
export const filtrarHorariosDisponiveis = (
  horariosDia: string[],
  horariosBloqueados: string[],
) => {
  return horariosDia.filter((h) => !horariosBloqueados.includes(h));
};

/**
 * removerHorariosPassadosDeHoje
 */
export const removerHorariosPassadosDeHoje = (
  day: Date,
  horarios: string[],
): string[] => {
  const agora = new Date();

  const isHoje =
    day.getDate() === agora.getDate() &&
    day.getMonth() === agora.getMonth() &&
    day.getFullYear() === agora.getFullYear();

  if (!isHoje) return horarios;

  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  return horarios.filter((h) => {
    const [hh, mm] = h.split(':').map(Number);

    if (hh > horaAtual) return true;
    if (hh === horaAtual && mm > minutoAtual) return true;

    return false;
  });
};

/**
 * filtrarHorariosFim
 */
export const filtrarHorariosFim = (
  horariosDia: string[],
  reservas: Reserva[],
  inicioSelecionado: string
): string[] => {
  return horariosDia.filter((horarioFim) => {
    if (horarioFim <= inicioSelecionado) return false;

    return !reservas.some((reserva) => {
      const inicioReserva = formatarHora(reserva.inicio);
      const fimReserva = formatarHora(reserva.fim);

      return (
        inicioSelecionado < fimReserva &&
        horarioFim > inicioReserva
      );
    });
  });
};

/**
 * gerarHorariosOcupadosPorArea
 */
export const gerarHorariosOcupadosPorArea = (
  reserva: Reserva,
  intervalo: number,
  area: Vaga['area'],
): string[] => {
  const limites: Record<string, number> = {
    VERMELHA: 1,
    AMARELA: 2,
    AZUL: 4,
    BRANCA: 6,
  };

  const limiteHoras = limites[area];

  const horariosOcupados: string[] = [];

  const inicio = new Date(reserva.inicio);
  const fimOriginal = new Date(reserva.fim);

  const fimLimitado = new Date(inicio);
  fimLimitado.setHours(fimLimitado.getHours() + limiteHoras);

  const fim = fimOriginal < fimLimitado ? fimOriginal : fimLimitado;

  if (fim <= inicio) {
    fim.setDate(fim.getDate() + 1);
  }

  const current = new Date(inicio);

  while (current <= fim) {
    horariosOcupados.push(formatarHoraFromDate(current));
    current.setMinutes(current.getMinutes() + intervalo);
  }

  return horariosOcupados;
};