'use client';

import { useEffect, useState, useCallback } from 'react';
import { getReservas, finalizarForcado } from '@/lib/api/reservaApi';
import { Reserva } from '@/lib/types/reserva';
import { toast } from 'sonner';

export default function useReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar reservas
  const carregarReservas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReservas();
      setReservas(data);
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarReservas();
  }, [carregarReservas]);

  const finalizarReservaForcada = useCallback(
    async (reservaID: string, reservaData?: Reserva) => {
      setActionLoading(true);

      try {
        // 1. Encontrar a reserva completa
        let reserva = reservaData;
        if (!reserva) {
          reserva = reservas.find((r) => r.id === reservaID);
          if (!reserva) {
            toast.error('Reserva não encontrada');
            return { error: true, message: 'Reserva não encontrada' };
          }
        }

        // 2. Confirmar ação
        const confirmar = window.confirm(
          `CONFIRMAR CHECKOUT FORÇADO\n\n` +
            `Motorista: ${reserva.motoristaNome}\n` +
            `Placa: ${reserva.placaVeiculo}\n` +
            `Vaga: ${reserva.enderecoVaga.logradouro}\n` +
            `Data: ${new Date(reserva.inicio).toLocaleDateString()}\n\n` +
            `Esta ação não pode ser desfeita.`,
        );

        if (!confirmar) {
          return { error: true, message: 'Ação cancelada pelo usuário' };
        }

        // 3. Executar checkout forçado
        const resultado = await finalizarForcado(reservaID);

        if (resultado.error) {
          toast.error(`Erro: ${resultado.message}`);
          return resultado;
        }

        // 4. Atualizar estado local
        setReservas((prev) =>
          prev.map((r) =>
            r.id === reservaID ? { ...r, status: 'CONCLUIDA' } : r,
          ),
        );

        // 5. Feedback ao usuário
        toast.success('Checkout forçado realizado com sucesso!');

        return {
          error: false,
          message: 'Checkout forçado realizado com sucesso',
        };
      } catch (err) {
        console.error('Erro ao finalizar reserva:', err);
        toast.error('Erro ao processar checkout forçado');
        return {
          error: true,
          message: 'Erro ao processar checkout forçado',
        };
      } finally {
        setActionLoading(false);
      }
    },
    [reservas],
  );

  // RETORNAR um objeto com todas as propriedades
  return {
    reservas,
    loading,
    actionLoading,
    carregarReservas,
    finalizarReservaForcada,
  };
}
