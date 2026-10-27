import { useEffect, useMemo, useRef } from 'react';

import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import { useReservas } from '@/features/reserva/reservas/hooks/useReservas';

import type {
  ReservaParams,
  ReservaResponse,
} from '@/features/reserva/reservas/types/reservas';

import {
  adicionarDia,
  calcularFimBloqueado,
  calcularHorarios,
  expandirBloqueios,
  getOperacoesDia,
  toDateKey,
  toMinutes,
} from '../reservaHelpers';

interface Args {
  vaga?: VagaResponse | null;
  day?: Date;
  tipoVeiculo?: string;
  startHour: string | null;
  intervalo: number;
}

export function useHorariosReserva({
  vaga,
  day,
  tipoVeiculo,
  startHour,
  intervalo,
}: Args) {
  const diaSeguinte = useMemo(
    () => (day ? adicionarDia(day) : undefined),
    [day],
  );

  const paramsAtual = useMemo(
    () =>
      day && tipoVeiculo
        ? ({ data: toDateKey(day), tipoVeiculo } as ReservaParams)
        : undefined,
    [day, tipoVeiculo],
  );

  const paramsSeguinte = useMemo(
    () =>
      diaSeguinte && tipoVeiculo
        ? ({
            data: toDateKey(diaSeguinte),
            tipoVeiculo,
          } as ReservaParams)
        : undefined,
    [diaSeguinte, tipoVeiculo],
  );

  const atual = useReservas<ReservaResponse>({
    vagaId: vaga?.id,
    params: paramsAtual,
    buscarAutomaticamente: false,
  });

  const seguinte = useReservas<ReservaResponse>({
    vagaId: vaga?.id,
    params: paramsSeguinte,
    buscarAutomaticamente: false,
  });

  useEffect(() => {
    if (vaga && paramsAtual) {
      atual.buscarBloqueios();
    }
  }, [vaga, paramsAtual, atual.buscarBloqueios]);

  useEffect(() => {
    if (vaga && paramsSeguinte) {
      seguinte.buscarBloqueios();
    }
  }, [vaga, paramsSeguinte, seguinte.buscarBloqueios]);

  const horarios = useMemo(() => {
    if (!vaga || !day || !tipoVeiculo) {
      return {
        availableTimes: [],
        reservedStart: [],
        reservedEnd: [],
      };
    }

    return calcularHorarios(
      day,
      vaga,
      atual.bloqueios ?? [],
      intervalo,
    );
  }, [vaga, day, tipoVeiculo, atual.bloqueios, intervalo]);

  const horariosSeguinte = useMemo(() => {
    if (!vaga || !diaSeguinte || !tipoVeiculo) {
      return {
        availableTimes: [],
        reservedStart: [],
        reservedEnd: [],
      };
    }

    return calcularHorarios(
      diaSeguinte,
      vaga,
      seguinte.bloqueios ?? [],
      intervalo,
    );
  }, [
    vaga,
    diaSeguinte,
    tipoVeiculo,
    seguinte.bloqueios,
    intervalo,
  ]);

  const podeContinuarNoDiaSeguinte = useMemo(() => {
  if (!vaga || !day || !diaSeguinte) return false;

  const operacoesAtuais = getOperacoesDia(day, vaga);
  const operacoesSeguintes = getOperacoesDia(diaSeguinte, vaga);

  if (!operacoesAtuais.length || !operacoesSeguintes.length) {
    return false;
  }

  const ultimaOperacao = [...operacoesAtuais].sort(
    (a, b) =>
      toMinutes(b.horaFim) - toMinutes(a.horaFim),
  )[0];

  const primeiraOperacao = [...operacoesSeguintes].sort(
    (a, b) =>
      toMinutes(a.horaInicio) - toMinutes(b.horaInicio),
  )[0];

  const fimAtual = ultimaOperacao.horaFim.slice(0, 5);
  const inicioSeguinte = primeiraOperacao.horaInicio.slice(0, 5);

  return fimAtual === '23:59' && inicioSeguinte === '00:00';
}, [vaga, day, diaSeguinte]);

  const reservedEndBase = useMemo(() => {
    const bloqueiosAtuais = expandirBloqueios(
      atual.bloqueios ?? [],
      intervalo,
    );

    const bloqueiosSeguintes = expandirBloqueios(
      seguinte.bloqueios ?? [],
      intervalo,
    ).map((hora) => `D+1 ${hora}`);

    return [...bloqueiosAtuais, ...bloqueiosSeguintes];
  }, [atual.bloqueios, seguinte.bloqueios, intervalo]);

  const reservedTimesEnd = useMemo(() => {
    if (!startHour || !vaga) return horarios.reservedEnd;

    return calcularFimBloqueado(
      startHour,
      horarios.availableTimes,
      vaga.area,
      reservedEndBase,
      podeContinuarNoDiaSeguinte
        ? horariosSeguinte.availableTimes
        : [],
    );
  }, [
    startHour,
    vaga,
    horarios,
    horariosSeguinte.availableTimes,
    reservedEndBase,
    podeContinuarNoDiaSeguinte,
  ]);

  const buscouAtual = useRef(false);
  const buscouSeguinte = useRef(false);

  useEffect(() => {
    if (!atual.loading && paramsAtual) {
      buscouAtual.current = true;
    }
  }, [atual.loading, paramsAtual]);

  useEffect(() => {
    if (!seguinte.loading && paramsSeguinte) {
      buscouSeguinte.current = true;
    }
  }, [seguinte.loading, paramsSeguinte]);

  return {
    availableTimes: horarios.availableTimes,
    availableTimesNextDay: podeContinuarNoDiaSeguinte
      ? horariosSeguinte.availableTimes
      : [],
    reservedTimesStart: horarios.reservedStart,
    reservedTimesEnd,
    loadingHorarios: atual.loading || seguinte.loading,
    horariosCarregados:
      buscouAtual.current &&
      buscouSeguinte.current &&
      !atual.loading &&
      !seguinte.loading,
    podeContinuarNoDiaSeguinte,
  };
}