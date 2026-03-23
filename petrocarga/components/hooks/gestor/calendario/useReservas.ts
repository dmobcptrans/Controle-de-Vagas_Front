'use client';

import { useEffect, useState, useCallback } from 'react';
import { getReservas, finalizarForcado } from '@/lib/api/reservaApi';
import { Reserva } from '@/lib/types/reserva';
import { toast } from 'sonner';

/**
 * @hook useReservas
 * @version 1.0.0
 * 
 * @description Hook customizado para gerenciamento de reservas no dashboard do gestor.
 * Fornece funcionalidades para carregar reservas e realizar checkout forçado.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {Reserva[]} reservas - Lista de reservas carregadas
 * @property {boolean} loading - Estado de carregamento inicial
 * @property {boolean} actionLoading - Estado de carregamento durante ações (checkout)
 * @property {() => Promise<void>} carregarReservas - Função para recarregar reservas
 * @property {(reservaId: string, reservaData?: Reserva) => Promise<{ error: boolean; message: string }>} finalizarReservaForcada - Função para checkout forçado
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO INICIAL:
 *    - useEffect dispara carregarReservas na montagem
 *    - Chama API getReservas
 *    - Atualiza estado reservas
 *    - Trata erros com toast
 * 
 * 2. FINALIZAÇÃO FORÇADA:
 *    - Recebe ID da reserva (e opcionalmente dados completos)
 *    - Se dados não fornecidos, busca na lista de reservas
 *    - Exibe modal de confirmação com detalhes da reserva
 *    - Se confirmado, chama API finalizarForcado
 *    - Atualiza estado local (status = 'CONCLUIDA')
 *    - Feedback com toast de sucesso/erro
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useCallback: Memoização das funções para evitar re-renders
 * - Estados separados: loading (carregamento inicial) vs actionLoading (ações)
 * - Atualização otimista: Altera status localmente sem recarregar lista
 * - Confirmação nativa: window.confirm com dados detalhados da reserva
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - getReservas: API de listagem de reservas
 * - finalizarForcado: API de checkout forçado
 * - toast: Feedback visual (sonner)
 * - ReservaModal: Modal que utiliza este hook
 * 
 * @example
 * ```tsx
 * const { reservas, loading, finalizarReservaForcada } = useReservas();
 * 
 * const handleCheckoutForcado = async (reservaId: string) => {
 *   const result = await finalizarReservaForcada(reservaId);
 *   if (!result.error) {
 *     console.log('Checkout realizado');
 *   }
 * };
 * ```
 */

export default function useReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ==================== CARREGAR RESERVAS ====================
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

  // Carrega reservas na montagem
  useEffect(() => {
    carregarReservas();
  }, [carregarReservas]);

  // ==================== CHECKOUT FORÇADO ====================
  const finalizarReservaForcada = useCallback(
    async (reservaID: string, reservaData?: Reserva) => {
      setActionLoading(true);

      try {
        // 1. Encontrar a reserva completa (se não fornecida)
        let reserva = reservaData;
        if (!reserva) {
          reserva = reservas.find((r) => r.id === reservaID);
          if (!reserva) {
            toast.error('Reserva não encontrada');
            return { error: true, message: 'Reserva não encontrada' };
          }
        }

        // 2. Confirmar ação com modal nativo
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

        // 4. Atualizar estado local (otimista)
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

  return {
    reservas,
    loading,
    actionLoading,
    carregarReservas,
    finalizarReservaForcada,
  };
}