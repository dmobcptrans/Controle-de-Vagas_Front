'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getReservas,
  getReservasPorPlaca,
  getReservasPorUsuario,
  getReservasRapidas,
  getReservasBloqueios,
} from '../services/reservaApi';

import {
  ReservaParams,
  ReservaPorUsuarioResponse,
  ReservaResponse,
  ReservaBloqueiosResponse,
} from '../types/reservas';

import { ReservaRapidaResponse } from '../types/reservaRapida';

import { useApi } from '@/services/hooks/useApi';

interface UseReservaOptions {
  usuarioId?: string;
  veiculoId?: string;
  vagaId?: string;
  placa?: string;
  params?: ReservaParams;
  buscarAutomaticamente?: boolean;
}

interface UseReservaReturn<
  T extends ReservaResponse | ReservaPorUsuarioResponse | ReservaRapidaResponse, 
> {
  reservas: T[];
  reservasRapidas: ReservaRapidaResponse[];
  bloqueios: ReservaBloqueiosResponse[];
  loading: boolean;
  error: string | null;
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  buscarTodas: (novosParams?: ReservaParams) => Promise<void>;
  buscarPorUsuario: () => Promise<void>;
  buscarBloqueios: () => Promise<void>;
  buscarPorPlaca: () => Promise<void>;
  buscarReservasRapidas: () => Promise<void>;
  recarregar: () => Promise<void>;
}

const DEFAULT_PARAMS: ReservaParams = {};

export function useReservas<
  T extends ReservaResponse | ReservaPorUsuarioResponse | ReservaRapidaResponse,
>({
  usuarioId,
  vagaId,
  placa,
  params = DEFAULT_PARAMS,
  buscarAutomaticamente = true,
}: UseReservaOptions): UseReservaReturn<T> {
  const [reservas, setReservas] = useState<T[]>([]);
  const [reservasRapidas, setReservasRapidas] = useState<
    ReservaRapidaResponse[]
  >([]);
  const [bloqueios, setBloqueios] = useState<ReservaBloqueiosResponse[]>([]);

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const { loading, error, execute } = useApi();

  /**
   * Identifica qual requisição é a mais recente.
   *
   * Se duas requisições forem disparadas:
   *
   * request 1
   * request 2
   *
   * e a request 1 terminar depois da request 2,
   * ela não poderá sobrescrever o resultado mais novo.
   */
  const requestIdRef = useRef(0);

  const buscarTodas = useCallback(
    async (novosParams: ReservaParams = params): Promise<void> => {
      const requestId = ++requestIdRef.current;

      const response = await execute(() => getReservas(novosParams));

      if (!response) return;

      if (requestId !== requestIdRef.current) return;

      setReservas(response as T[]);
    },
    [execute, params],
  );

  const buscarPorUsuario = useCallback(async (): Promise<void> => {
    if (!usuarioId) return;

    const requestId = ++requestIdRef.current;

    const response = await execute(() =>
      getReservasPorUsuario(usuarioId, params),
    );

    if (!response) return;

    /**
     * Ignora resposta antiga.
     */
    if (requestId !== requestIdRef.current) return;

    setReservas(response.content as T[]);
    setPagina(response.pagina);
    setTotalPaginas(response.totalPaginas);
    setTotalElementos(response.totalElementos);
  }, [execute, usuarioId, params]);

  const buscarPorPlaca = useCallback(async (): Promise<void> => {
    if (!placa) return;

    const requestId = ++requestIdRef.current;

    const response = await execute(() => getReservasPorPlaca(placa));

    if (!response) return;

    if (requestId !== requestIdRef.current) return;

    setReservas(response as T[]);
  }, [execute, placa]);

  const buscarReservasRapidas = useCallback(async (): Promise<void> => {
    if (!usuarioId) return;

    const requestId = ++requestIdRef.current;

    const response = await execute(() =>
      getReservasRapidas(usuarioId, params),
    );

    if (!response) return;

    if (requestId !== requestIdRef.current) return;

    setReservasRapidas(response.content);
    setPagina(response.pagina);
    setTotalPaginas(response.totalPaginas);
    setTotalElementos(response.totalElementos);
  }, [execute, usuarioId, params]);

  const buscarBloqueios = useCallback(async (): Promise<void> => {
    if (!vagaId) return;

    const requestId = ++requestIdRef.current;

    const response = await execute(() =>
      getReservasBloqueios(vagaId, params),
    );

    if (!response) return;

    if (requestId !== requestIdRef.current) return;

    setBloqueios(response);
  }, [execute, vagaId, params]);

  /**
   * Recarrega somente a fonte de dados correspondente
   * ao contexto atual.
   */
  const recarregar = useCallback(async (): Promise<void> => {
    if (usuarioId) {
      await buscarPorUsuario();
      return;
    }

    if (placa) {
      await buscarPorPlaca();
      return;
    }

    if (vagaId) {
      await buscarBloqueios();
      return;
    }

    await buscarTodas();
  }, [
    usuarioId,
    placa,
    vagaId,
    buscarPorUsuario,
    buscarPorPlaca,
    buscarBloqueios,
    buscarTodas,
  ]);

  /**
   * IMPORTANTE:
   *
   * Não colocamos `recarregar` aqui.
   *
   * A busca automática deve acontecer quando o contexto
   * principal mudar, e não quando a função for recriada.
   */
  useEffect(() => {
    if (!buscarAutomaticamente) return;

    if (usuarioId) {
      buscarPorUsuario();
      return;
    }

    if (placa) {
      buscarPorPlaca();
      return;
    }

    if (vagaId) {
      buscarBloqueios();
      return;
    }

    buscarTodas();
  }, [
    buscarAutomaticamente,
    usuarioId,
    placa,
    vagaId,
    buscarPorUsuario,
    buscarPorPlaca,
    buscarBloqueios,
    buscarTodas,
  ]);

  return {
    reservas,
    reservasRapidas,
    bloqueios,
    loading,
    error,
    pagina,
    totalPaginas,
    totalElementos,
    buscarTodas,
    buscarPorUsuario,
    buscarBloqueios,
    buscarPorPlaca,
    buscarReservasRapidas,
    recarregar,
  };
}