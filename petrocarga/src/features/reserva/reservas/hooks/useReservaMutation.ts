'use client';

import { useApi } from '@/services/hooks/useApi';

import {
  criarReserva,
  criarReservaRapida,
  atualizarReserva,
  deleteReservaByID,
} from '../services/reservaApi';

import {
  CriarReservaPayload,
  AtualizarReservaPayload,
  ReservaPorUsuarioResponse,
} from '../types/reservas';

import { CriarReservaRapidaPayload } from '../types/reservaRapida';

type Persona =
  | 'Motorista'
  | 'Agente';

interface UseReservaMutationReturn {
  loading: boolean;
  error: string | null;

  criar: (
    persona: Persona,
    usuarioId: string,
    payload:
      | CriarReservaPayload
      | CriarReservaRapidaPayload
  ) => Promise<ReservaPorUsuarioResponse | null>;

  atualizar: (
    reservaId: string,
    usuarioId: string,
    payload: AtualizarReservaPayload,
  ) => Promise<ReservaPorUsuarioResponse | null>;

  deletar: (
    reservaId: string,
    usuarioId: string
  ) => Promise<boolean>;

  limparError: () => void;
}

export function useReservaMutation(): UseReservaMutationReturn {
  const {
    loading,
    error,
    execute,
    limparError,
  } = useApi();

  const criar = async (
    persona: Persona,
    usuarioId: string,
    payload:
      | CriarReservaPayload
      | CriarReservaRapidaPayload
  ): Promise<ReservaPorUsuarioResponse | null> => {

    if (persona === 'Agente') {
      return await execute(() =>
        criarReservaRapida(
          payload as CriarReservaRapidaPayload
        )
      );
    }

    return await execute(() =>
      criarReserva(
        payload as CriarReservaPayload
      )
    );
  };

  const atualizar = async (
    reservaId: string,
    usuarioId: string,
    payload: AtualizarReservaPayload,
  ): Promise<ReservaPorUsuarioResponse | null> => {

    return await execute(() =>
      atualizarReserva(
        payload,
        reservaId,
        usuarioId
      )
    );
  };

  const deletar = async (
    reservaId: string,
    usuarioId: string,
  ): Promise<boolean> => {

    const response = await execute(() =>
      deleteReservaByID(
        reservaId,
        usuarioId
      )
    );

    return response !== null;
  };

  return {
    loading,
    error,
    criar,
    atualizar,
    deletar,
    limparError,
  };
}