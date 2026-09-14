'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getReservasPorUsuario } from '../services/reservaApi';
import {
  ReservaPaginadaDeUmUsuario,
  ReservaPorUsuarioResponse,
} from '../types/reservas';

export function useReservas(usuarioId?: string) {
  const [reservas, setReservas] = useState<ReservaPorUsuarioResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarReservas = useCallback(async () => {
    if (!usuarioId) {
      setReservas([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response: ReservaPaginadaDeUmUsuario = await getReservasPorUsuario(
        usuarioId,
        0,
        100,
      );

      setReservas(response.content);
    } catch {
      toast.error('Não foi possível carregar suas reservas.');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    buscarReservas();
  }, [buscarReservas]);

  return {
    reservas,
    loading,
    refetch: buscarReservas,
  };
}
