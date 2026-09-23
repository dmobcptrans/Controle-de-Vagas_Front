'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  getReservas,
  getReservasPorPlaca,
  getReservasPorUsuario,
  getReservasRapidas,
} from '../services/reservaApi';

import {
  ReservaParams,
  ReservaPorUsuarioResponse,
  ReservaResponse,
} from '../types/reservas';

import { ReservaRapidaResponse } from '../types/reservaRapida';

import { useApi } from '@/services/hooks/useApi';

interface UseReservaOptions {
  usuarioId?: string;
  veiculoId?: string;
  placa?: string;
  params?: ReservaParams;
  buscarAutomaticamente?: boolean;
}

interface UseReservaReturn<T extends ReservaResponse | ReservaPorUsuarioResponse> {
  reservas: T[];
  reservasRapidas: ReservaRapidaResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscarTodas: (novosParams?: ReservaParams) => Promise<void>;
  buscarPorUsuario: () => Promise<void>;
  buscarPorPlaca: () => Promise<void>;
  buscarReservasRapidas: () => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: ReservaParams = {};

export function useReservas<
  T extends ReservaResponse | ReservaPorUsuarioResponse,
>({
  usuarioId,
  placa,
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseReservaOptions): UseReservaReturn<T> {
  const [reservas, setReservas] = useState<T[]>([]);

  const [reservasRapidas, setReservasRapidas] = useState<
    ReservaRapidaResponse[]
  >([]);

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  const buscarTodas = useCallback(
    async (
      novosParams: ReservaParams = params,
    ): Promise<void> => {
      const response = await execute(() => getReservas(novosParams));

      if (response) {
        setReservas(response as T[]);
      }
    },
    [params, execute],
  );

  const buscarPorUsuario = useCallback(async (): Promise<void> => {
    if (!usuarioId) {
      return;
    }

    const response = await execute(() =>
      getReservasPorUsuario(usuarioId, params),
    );

    if (response) {
      setReservas(response.content as T[]);

      setPagina(response.pagina);
      setTotalPaginas(response.totalPaginas);
      setTotalElementos(response.totalElementos);
    }
  }, [usuarioId, params, execute]);

  const buscarPorPlaca = useCallback(async (): Promise<void> => {
    if (!placa) {
      return;
    }

    const response = await execute(() => getReservasPorPlaca(placa));

    if (response) {
      setReservas(response as T[]);
    }
  }, [placa, execute]);

  const buscarReservasRapidas = useCallback(async (): Promise<void> => {
    if (!usuarioId) {
      return;
    }

    const response = await execute(() =>
      getReservasRapidas(usuarioId, params),
    );

    if (response) {
      setReservasRapidas(response.content);

      setPagina(response.pagina);
      setTotalPaginas(response.totalPaginas);
      setTotalElementos(response.totalElementos);
    }
  }, [usuarioId, params, execute]);

  const recarregar = useCallback(async (): Promise<void> => {
    if (usuarioId) {
      await buscarPorUsuario();
      return;
    }

    if (placa) {
      await buscarPorPlaca();
      return;
    }

    await buscarTodas();
  }, [usuarioId, placa, buscarPorUsuario, buscarPorPlaca, buscarTodas]);

  useEffect(() => {
    if (!buscarAutomaticamente) {
      return;
    }

    recarregar();
  }, [buscarAutomaticamente, recarregar]);

  return {
    reservas,
    reservasRapidas,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    buscarTodas,
    buscarPorUsuario,
    buscarPorPlaca,
    buscarReservasRapidas,
    recarregar,
  };
}