'use client';

import { useState } from 'react';
import { ReservaPorUsuarioResponse } from '@/features/reserva/reservas/types/reservas';
import { useReservaInteraction } from '@/features/reserva/reservas/hooks/useReservaInteraction';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import ReservaDenuncia from './ReservaDenuncia';

interface ModalCheckinReservaProps {
  reserva: ReservaPorUsuarioResponse;
  onClose: () => void;
  onCheckinSuccess?: (reservaAtualizada: ReservaPorUsuarioResponse) => void;
  onDenunciar?: (reservaId: string) => void;
}

/**
 * @component ReservaCheckinModal
 * @version 1.0.0
 *
 * @description Modal de confirmação para realização de check-in de reserva.
 * Exibe detalhes da reserva e oferece opções para confirmar check-in ou reportar problema.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. APRESENTAÇÃO:
 *    - Exibe dados da reserva (local, horários)
 *    - Botão principal "Confirmar Check-in"
 *    - Botão secundário "Reportar problema"
 *    - Botão "Cancelar" para fechar modal
 *
 * 2. CHECK-IN:
 *    - Usuário confirma check-in
 *    - Chama API checkinReserva
 *    - Exibe loading durante processo
 *    - Em sucesso: fecha modal e chama onCheckinSuccess
 *    - Em erro: exibe mensagem de erro
 *
 * 3. REPORTAR PROBLEMA:
 *    - Abre modal de denúncia (ReservaDenuncia)
 *    - Mantém contexto da reserva atual
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - OVERLAY: Fundo escuro com blur, fecha ao clicar fora
 * - ANIMAÇÃO: fade-in zoom-in-95 (Tailwind)
 * - LOADING: Botão desabilitado com texto dinâmico
 * - ESTADOS: loading (envio), erro (feedback)
 * - MODAL ANINHADO: ReservaDenuncia aberto sobre este modal
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ReservaDenuncia: Modal de denúncia
 * - checkinReserva: API de check-in
 *
 * @example
 * ```tsx
 * <ReservaCheckinModal
 *   reserva={reservaSelecionada}
 *   onClose={() => setModalAberto(false)}
 *   onCheckinSuccess={(reserva) => fetchReservas()}
 * />
 * ```
 */

export default function ReservaCheckinModal({
  reserva,
  onClose,
  onCheckinSuccess,
}: ModalCheckinReservaProps) {
  const [abrirModal, setAbrirModal] = useState(false);

  const { checkin, error, loading, resposta } = useReservaInteraction({
    reservaId: reserva.id,
  });

  // ==================== FORMATAÇÃO ====================

  const formatarData = (data: string) =>
    new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  // ==================== HANDLER CHECK-IN ====================

  const handleCheckin = async () => {
    try {
      const resultado = await checkin();

      const dadosAtualizados = resultado ?? resposta;

      onCheckinSuccess?.({
        ...reserva,
        ...(dadosAtualizados ?? {}),
      });

      onClose();
    } catch {
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal principal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ==================== HEADER ==================== */}

        <div className="px-6 py-5 border-b flex items-start gap-3">
          <div className="p-2 rounded-full bg-green-100">
            <Clock className="w-5 h-5 text-green-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Confirmar Check-in
            </h2>

            <p className="text-sm text-gray-500">
              Confira os dados antes de continuar
            </p>
          </div>
        </div>

        {/* ==================== CONTEÚDO ==================== */}

        <div className="px-6 py-5 flex flex-col gap-4 text-sm">
          {/* Local da reserva */}

          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />

            <div>
              <p className="font-medium text-gray-800">
                {reserva.vaga.logradouro} – {reserva.vaga.bairro}
              </p>

              <p className="text-gray-500 text-xs">
                Origem: {reserva.cidadeOrigem}
              </p>
            </div>
          </div>

          {/* Horários */}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 flex flex-col gap-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Início
              </span>

              <span className="font-medium text-gray-800">
                {formatarData(reserva.inicio)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 flex flex-col gap-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Fim
              </span>

              <span className="font-medium text-gray-800">
                {formatarData(reserva.fim)}
              </span>
            </div>
          </div>

          {/* Mensagem de erro */}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5" />

              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ==================== AÇÕES ==================== */}

        <div className="px-6 py-5 border-t flex flex-col gap-3">
          {/* Confirmar Check-in */}

          <button
            onClick={handleCheckin}
            disabled={loading}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'w-full bg-green-600 hover:bg-green-700 transition disabled:opacity-60',
            )}
          >
            {loading ? 'Realizando check-in...' : 'Confirmar Check-in'}
          </button>

          {/* Ações secundárias */}

          <div className="flex flex-col gap-2">
            {/* Reportar problema */}

            <button
              onClick={() => setAbrirModal(true)}
              disabled={loading}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'w-full bg-red-600 hover:bg-red-700 transition disabled:opacity-60',
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              Reportar problema
            </button>

            {/* Cancelar */}

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de denúncia */}

      {abrirModal && (
        <ReservaDenuncia
          reserva={reserva}
          onClose={() => setAbrirModal(false)}
        />
      )}
    </div>
  );
}
