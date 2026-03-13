import { DiaSemana, OperacoesVaga } from '@/lib/types/vaga';
import { Reserva } from '@/lib/types/reserva';
import { Vaga } from '@/lib/types/vaga';

export const DIAS_SEMANA: DiaSemana[] = [
  'DOMINGO',
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
];

export const INTERVALO_MINUTOS = 30;

export const padNumber = (n: number): string => n.toString().padStart(2, '0');

export const formatDateTime = (day: Date, hour: string): string => {
  const [h, m] = hour.split(':').map(Number);
  const date = new Date(day);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

export const gerarHorariosOcupados = (reserva: Reserva): string[] => {
  const horariosOcupados: string[] = [];

  const inicio = new Date(reserva.inicio);
  const fim = new Date(reserva.fim);

  if (fim <= inicio) {
    fim.setDate(fim.getDate() + 1);
  }

  const current = new Date(inicio);

  while (current <= fim) {
    const h = padNumber(current.getHours());
    const m = current.getMinutes() >= 30 ? '30' : '00';

    horariosOcupados.push(`${h}:${m}`);
    current.setMinutes(current.getMinutes() + INTERVALO_MINUTOS);
  }

  return horariosOcupados;
};

export const gerarHorariosDia = (operacao: OperacoesVaga): string[] => {
  const [hInicio, mInicio] = operacao.horaInicio.split(':').map(Number);
  const [hFim, mFim] = operacao.horaFim.split(':').map(Number);

  const times: string[] = [];
  let h = hInicio;
  let m = mInicio;

  while (h < hFim || (h === hFim && m <= mFim)) {
    times.push(`${padNumber(h)}:${padNumber(m)}`);

    m += INTERVALO_MINUTOS;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }

  return times;
};

export const getOperacaoDia = (
  day: Date,
  vaga: { operacoesVaga?: OperacoesVaga[] },
) => {
  const diaSemana = DIAS_SEMANA[day.getDay()];
  return vaga.operacoesVaga?.find((op) => op.diaSemanaAsEnum === diaSemana);
};

export const gerarHorariosBloqueados = (
  bloqueios: { inicio: string; fim: string }[],
): string[] => {
  const horarios: string[] = [];

  bloqueios.forEach((b) => {
    const inicio = new Date(b.inicio);
    const fim = new Date(b.fim);
    const current = new Date(inicio);

    while (current < fim) {
      const h = padNumber(current.getHours());
      const m = current.getMinutes() >= 30 ? '30' : '00';

      horarios.push(`${h}:${m}`);

      current.setMinutes(current.getMinutes() + INTERVALO_MINUTOS);
    }
  });

  return horarios;
};

export const filtrarHorariosDisponiveis = (
  horariosDia: string[],
  horariosBloqueados: string[],
) => {
  return horariosDia.filter((h) => !horariosBloqueados.includes(h));
};

export const removerHorariosPassadosDeHoje = (
  day: Date,
  horarios: string[],
): string[] => {
  const agora = new Date();

  // Se o dia NÃO é hoje, retorna todos os horários normalmente
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

export const gerarHorariosOcupadosPorArea = (
  reserva: Reserva,
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
    const h = padNumber(current.getHours());
    const m = current.getMinutes() >= 30 ? '30' : '00';

    horariosOcupados.push(`${h}:${m}`);
    current.setMinutes(current.getMinutes() + INTERVALO_MINUTOS);
  }

  return horariosOcupados;
};
