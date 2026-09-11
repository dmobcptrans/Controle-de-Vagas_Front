'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getReservasPorUsuario } from '../services/reservaApi';
import { ReservaGet } from '../../reservar-vaga/types/reserva';

export function useReservas(usuarioId?: string) {
  const [reservas, setReservas] = useState<ReservaGet[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarReservas = useCallback(async () => {
    if (!usuarioId) {
      setReservas([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getReservasPorUsuario(usuarioId, 0, 100);

      const data = Array.isArray(response)
        ? response
        : response?.content ?? [];

      setReservas(data);
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