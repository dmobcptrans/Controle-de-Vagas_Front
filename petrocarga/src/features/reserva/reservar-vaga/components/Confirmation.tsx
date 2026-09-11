'use client';

import { useTransition } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Truck,
  Loader2,
} from 'lucide-react';

interface ConfirmationProps {
  day: Date;
  startHour: string;
  endHour: string;
  origin?: string;
  entryCity?: string | null;
  destination?: string;
  vehicleName?: string;
  onConfirm: () => Promise<void> | void;
  onReset?: () => void;
}

/**
 * @component Confirmation
 * @version 1.0.0
 *
 * @description Tela de resumo e confirmação da reserva.
 * Exibe os dados selecionados e permite confirmar ou reiniciar o processo.
 *
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 *
 * @property {Date} day - Data da reserva
 * @property {string} startHour - Horário de início
 * @property {string} endHour - Horário de fim
 * @property {string} [origin] - Cidade/local de origem
 * @property {string | null} [entryCity] - Ponto de entrada na cidade
 * @property {string} [destination] - Endereço da vaga
 * @property {string} [vehicleName] - Nome/placa do veículo
 * @property {() => Promise<void> | void} onConfirm - Callback de confirmação
 * @property {() => void} [onReset] - Callback para reiniciar o processo
 *
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 *
 * 1. RESUMO:
 *    - Data formatada (toLocaleDateString)
 *    - Horário (HH:MM - HH:MM)
 *    - Origem (se fornecida)
 *    - Destino/Endereço da vaga (se fornecido)
 *    - Veículo (se fornecido)
 *
 * 2. AÇÕES:
 *    - CONFIRMAR: Executa onConfirm com useTransition (loading)
 *    - REINICIAR: Reseta o fluxo de reserva (volta ao início)
 *
 * 3. ESTADO DE LOADING:
 *    - Botão desabilitado durante confirmação
 *    - Spinner animado no lugar do texto
 *    - Botão "Reiniciar" também desabilitado
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - useTransition: Gerencia estado de loading sem bloquear UI
 * - SPINNER: Animação customizada com border e animate-spin
 * - ESTILOS: Botão verde (confirmar), cinza (reiniciar)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ReservaComponent: Pai que usa este componente
 * - useReserva: Hook com lógica de confirmação
 *
 * @example
 * ```tsx
 * <Confirmation
 *   day={selectedDay}
 *   startHour={startHour}
 *   endHour={endHour}
 *   origin={origin}
 *   destination={destination}
 *   vehicleName={`${marca} ${modelo} - ${placa}`}
 *   onConfirm={handleConfirm}
 *   onReset={reset}
 * />
 * ```
 */

export default function Confirmation({
  day,
  startHour,
  endHour,
  origin,
  destination,
  vehicleName,
  onConfirm,
  onReset,
}: ConfirmationProps) {
  // useTransition gerencia o estado de loading sem bloquear UI
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    // Envolve a ação em startTransition para feedback de loading
    startTransition(async () => {
      await onConfirm();
    });
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto">
      {/* ==================== TÍTULO ==================== */}
      <div className="text-center mb-4">
        <p className="font-semibold text-lg text-gray-900">Resumo da Reserva</p>
        <p className="text-sm text-gray-500">
          Confira os dados antes de confirmar
        </p>
      </div>

      {/* ==================== CARD DE DADOS ==================== */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 divide-y divide-gray-200 overflow-hidden">
        {/* Data */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-800" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Data</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {day.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Horário */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-800" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Horário</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {startHour} - {endHour}
            </p>
          </div>
        </div>

        {/* Endereço de entrada (opcional) */}
        {origin && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-yellow-800" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Endereço de Entrada</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {origin}
              </p>
            </div>
          </div>
        )}

        {/* Endereço da vaga (opcional) */}
        {destination && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-yellow-800" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Endereço da Vaga</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {destination}
              </p>
            </div>
          </div>
        )}

        {/* Veículo (opcional) */}
        {vehicleName && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <Truck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Veículo</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {vehicleName}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ==================== BOTÕES ==================== */}
      <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2">
        {/* Botão Reiniciar */}
        <button
          className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          onClick={onReset}
          disabled={isPending}
        >
          Reiniciar
        </button>

        {/* Botão Confirmar (com loading) */}
        <button
          className="w-full sm:flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirmando...
            </>
          ) : (
            'Confirmar Reserva'
          )}
        </button>
      </div>
    </div>
  );
}
