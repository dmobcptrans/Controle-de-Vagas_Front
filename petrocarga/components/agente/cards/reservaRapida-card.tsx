'use client';

import { buttonVariants } from '@/components/ui/button';
import { ReservaRapida } from '@/lib/types/reservaRapida';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CheckCheck,
  Clock,
  Loader2,
  MapPin,
  Truck,
} from 'lucide-react';
import { useState, useTransition } from 'react';

interface ReservaRapidaCardProps {
  reserva: ReservaRapida;
  onCheckout?: (reservaId: string) => void;
}

/**
 * @component ReservaRapidaCard
 * @version 1.0.0
 *
 * @description Card de exibição de reserva rápida criada por agentes.
 * Exibe as informações principais da reserva em formato compacto.
 *
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 *
 * 1. HEADER:
 *    - Placa do veículo (título)
 *    - Badge com status colorido
 *
 * 2. DETALHES:
 *    - Tipo do veículo (com ícone Truck)
 *    - Localização: logradouro e bairro (com ícone MapPin)
 *    - Data da reserva (com ícone Calendar)
 *    - Horário de início e fim (com ícone Clock)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - STATUS_MAP: Objeto de configuração para estilos por status
 *   - Cada status tem: badge (cor do selo) e border (cor da borda esquerda)
 *   - Status suportados: reservada, concluída, ativa, removida, cancelada
 *
 * - DEFAULT_STATUS: Fallback para status não mapeados
 *
 * - formatação de datas:
 *   - formatDate: "dd/MM/yyyy" (ex: 15/01/2024)
 *   - formatTime: "HH:MM" (ex: 08:30)
 *
 * - LAYOUT RESPONSIVO:
 *   - Mobile: flex-col (empilhado)
 *   - Desktop: flex-row (lado a lado)
 *   - Borda esquerda colorida conforme status
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES POR STATUS:
 * ----------------------------------------------------------------------------
 *
 * | Status      | Badge                    | Borda Esquerda |
 * |-------------|--------------------------|----------------|
 * | reservada   | verde claro              | verde          |
 * | concluida   | azul claro               | azul           |
 * | ativa       | verde claro              | verde escuro   |
 * | removida    | vermelho claro           | vermelho       |
 * | cancelada   | cinza claro              | cinza          |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Lucide icons: Truck, MapPin, Calendar, Clock
 * - cn: Utilitário para combinação de classes Tailwind
 *
 * @example
 * ```tsx
 * <ReservaRapidaCard reserva={reserva} />
 * ```
 *
 * @see /src/lib/types/reservaRapida.ts - Tipo ReservaRapida
 */

/**
 * Mapeamento de estilos por status da reserva
 * Cada status define:
 * - badge: classes para o selo de status
 * - border: classes para a borda esquerda do card
 */
const STATUS_MAP: Record<string, { badge: string; border: string }> = {
  reservada: {
    badge: 'bg-green-100 text-green-700 border-green-500',
    border: 'border-green-500',
  },
  concluida: {
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    border: 'border-blue-300',
  },
  ativa: {
    badge: 'bg-green-100 text-green-700 border-green-900',
    border: 'border-green-900',
  },
  removida: {
    badge: 'bg-red-100 text-red-700 border-red-500',
    border: 'border-red-500',
  },
  cancelada: {
    badge: 'bg-gray-100 text-gray-700 border-gray-300',
    border: 'border-gray-300',
  },
};

/**
 * Estilo padrão para status não mapeados
 */
const DEFAULT_STATUS = {
  badge: 'bg-gray-100 text-gray-700 border-gray-300',
  border: 'border-green-500',
};

/**
 * @function formatDate
 * @description Formata data ISO para o padrão brasileiro (dd/MM/yyyy)
 * @param isoString - Data em formato ISO string
 * @returns Data formatada
 */
function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('pt-BR');
}

/**
 * @function formatTime
 * @description Extrai e formata apenas o horário de uma data ISO
 * @param isoString - Data em formato ISO string
 * @returns Horário no formato HH:MM
 */
function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReservaRapidaCard({
  reserva,
  onCheckout,
}: ReservaRapidaCardProps) {
  // Obtém o status em minúsculas e busca no mapa de estilos
  const statusKey = reserva.status.toLowerCase();
  const statusStyle = STATUS_MAP[statusKey] ?? DEFAULT_STATUS;
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [modalAbertoCheckout, setModalAbertoCheckout] = useState(false);
  const podeFazerCheckout = reserva.status === 'ATIVA';

  const handleOpenCheckoutModal = () => {
    if (!podeFazerCheckout || isCheckingOut) return;
    setModalAbertoCheckout(true);
  };

  return (
    <article
      className={cn(
        // Layout: empilhado mobile, linha desktop
        'flex flex-col sm:flex-row justify-between bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 gap-4 w-full',
        statusStyle.border,
      )}
    >
      <section className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Header: placa e status */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {reserva.placa}
          </h3>
          <span
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full border',
              statusStyle.badge,
            )}
          >
            {reserva.status}
          </span>
        </div>

        {/* Detalhes da reserva */}
        <div className="flex flex-col gap-2">
          {/* Tipo do veículo */}
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Truck className="w-4 h-4 text-gray-400" />
            {reserva.tipoVeiculo}
          </span>

          {/* Localização */}
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            {reserva.logradouro}, {reserva.bairro}
          </span>
          
          {reserva.cidadeOrigem !== "Petrópolis - RJ" && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              Cidade de Origem: {reserva.cidadeOrigem}
            </span>
          )}

          {/* Data da reserva */}
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(reserva.inicio)}
          </span>

          {/* Horário */}
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            {formatTime(reserva.inicio)} - {formatTime(reserva.fim)}
          </span>
        </div>
        {podeFazerCheckout && (
          <button
            onClick={handleOpenCheckoutModal}
            disabled={isCheckingOut}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 transition',
              isCheckingOut && 'opacity-70 cursor-not-allowed',
            )}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparando...
              </>
            ) : (
              <>
                <CheckCheck className="w-4 h-4" />
                Checkout
              </>
            )}
          </button>
        )}

        {/* Modal de Checkout */}
        {modalAbertoCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setModalAbertoCheckout(false)}
            />
            <div className="relative bg-white rounded-2xl p-6 w-96 max-w-full shadow-2xl flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                Confirmar Checkout
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Tem certeza que deseja fazer Checkout? Esta ação não pode ser
                desfeita.
              </p>
              <div className="flex justify-center gap-3 w-full">
                <button
                  onClick={() => {
                    setModalAbertoCheckout(false);
                    setIsCheckingOut(false);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    setIsCheckingOut(true);
                    setModalAbertoCheckout(false);
                    await onCheckout?.(reserva.id);
                    setIsCheckingOut(false);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
