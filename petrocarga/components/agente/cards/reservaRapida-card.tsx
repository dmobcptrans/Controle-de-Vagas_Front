'use client';

import { ReservaRapida } from '@/lib/types/reservaRapida';
import { cn } from '@/lib/utils';
import { Calendar, Clock, MapPin, Truck } from 'lucide-react';

interface ReservaRapidaCardProps {
  reserva: ReservaRapida;
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

export default function ReservaRapidaCard({ reserva }: ReservaRapidaCardProps) {
  // Obtém o status em minúsculas e busca no mapa de estilos
  const statusKey = reserva.status.toLowerCase();
  const statusStyle = STATUS_MAP[statusKey] ?? DEFAULT_STATUS;

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
      </section>
    </article>
  );
}