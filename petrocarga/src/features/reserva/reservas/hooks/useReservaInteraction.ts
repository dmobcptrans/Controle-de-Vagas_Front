'use client';

import { useState } from 'react';

import {
  checkinReserva,
  checkoutReserva,
  finalizarForcado as finalizarForcadoApi,
} from '../services/reservaApi';

import {
  ReservaPorUsuarioResponse,
  ReservaResponse,
} from '../types/reservas';

import { useApi } from '@/services/hooks/useApi';

interface UseReservaOptions {
  reservaId: string;
}

interface UseReservaReturn {
  resposta: ReservaPorUsuarioResponse | ReservaResponse | null;

  loading: boolean;

  error: string | null;

  checkin: () => Promise<ReservaPorUsuarioResponse | null>;

  checkout: () => Promise<ReservaPorUsuarioResponse | null>;

  finalizarForcado: () => Promise<ReservaResponse | null>;
}

export function useReservaInteraction({
  reservaId,
}: UseReservaOptions): UseReservaReturn {

  const [resposta, setResposta] = useState<
    ReservaPorUsuarioResponse | ReservaResponse | null
  >(null);

  const {
    loading,
    error,
    execute,
  } = useApi();

  const checkin = async (): Promise<ReservaPorUsuarioResponse | null> => {

    const response = await execute(() =>
      checkinReserva(reservaId)
    );

    if (response) {
      setResposta(response);
    }

    return response;
  };

  const checkout = async (): Promise<ReservaPorUsuarioResponse | null> => {

    const response = await execute(() =>
      checkoutReserva(reservaId)
    );

    if (response) {
      setResposta(response);
    }

    return response;
  };

  const finalizarForcado = async (): Promise<ReservaResponse | null> => {

    const response = await execute(() =>
      finalizarForcadoApi(reservaId)
    );

    if (response) {
      setResposta(response);
    }

    return response;
  };

  return {
    resposta,
    loading,
    error,
    checkin,
    checkout,
    finalizarForcado,
  };
}