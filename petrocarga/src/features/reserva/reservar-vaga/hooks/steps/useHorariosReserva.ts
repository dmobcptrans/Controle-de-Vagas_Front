import { useEffect, useMemo, useRef } from 'react';
import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import { useReservas } from '@/features/reserva/reservas/hooks/useReservas';
import type { ReservaParams, ReservaResponse } from '@/features/reserva/reservas/types/reservas';
import { calcularFimBloqueado, calcularHorarios, toDateKey } from '../reservaHelpers';

interface Args {
  vaga: VagaResponse | null;
  day?: Date;
  tipoVeiculo?: string;
  startHour: string | null;
  intervalo: number;
}

export function useHorariosReserva({ vaga, day, tipoVeiculo, startHour, intervalo }: Args) {
  const params = useMemo(
    () => (day && tipoVeiculo ? ({ data: toDateKey(day), tipoVeiculo } as ReservaParams) : undefined),
    [day, tipoVeiculo],
  );

  const { bloqueios, loading, buscarBloqueios } = useReservas<ReservaResponse>({
    vagaId: vaga?.id,
    params,
    buscarAutomaticamente: false,
  });

  useEffect(() => {
    if (vaga && params) buscarBloqueios();
  }, [vaga, params, buscarBloqueios]);

  const horarios = useMemo(() => {
    if (!vaga || !day || !tipoVeiculo) return { availableTimes: [], reservedStart: [], reservedEnd: [] };
    return calcularHorarios(day, vaga, bloqueios ?? [], intervalo);
  }, [vaga, day, tipoVeiculo, bloqueios, intervalo]);

  // fim bloqueado depende do início escolhido; senão usa os ocupados base
  const reservedTimesEnd = useMemo(
    () =>
      startHour && vaga
        ? calcularFimBloqueado(startHour, horarios.availableTimes, vaga.area, horarios.reservedEnd)
        : horarios.reservedEnd,
    [startHour, vaga, horarios],
  );

  // "carregou" = já houve ao menos uma busca concluída p/ estes params
  const buscou = useRef(false);
  useEffect(() => { if (!loading && params) buscou.current = true; }, [loading, params]);

  return {
    availableTimes: horarios.availableTimes,
    reservedTimesStart: horarios.reservedStart,
    reservedTimesEnd,
    loadingHorarios: loading,
    horariosCarregados: buscou.current && !loading,
  };
}