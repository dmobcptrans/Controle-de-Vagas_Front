'use client';

import { useTransition } from 'react';

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
    <div className="p-4 border rounded shadow-md">
      
      {/* ==================== TÍTULO ==================== */}
      <h3 className="text-lg font-semibold mb-2">Resumo da Reserva</h3>
      
      {/* ==================== DADOS DA RESERVA ==================== */}
      <p>
        <strong>Data:</strong> {day.toLocaleDateString()}
      </p>
      <p>
        <strong>Horário:</strong> {startHour} - {endHour}
      </p>
      
      {/* Campos opcionais */}
      {origin && (
        <p>
          <strong>Endereço de Entrada:</strong> {origin}
        </p>
      )}
      {destination && (
        <p>
          <strong>Endereço da Vaga:</strong> {destination}
        </p>
      )}
      {vehicleName && (
        <p>
          <strong>Veículo:</strong> {vehicleName}
        </p>
      )}

      {/* ==================== BOTÕES ==================== */}
      <div className="mt-4 flex gap-2">
        
        {/* Botão Confirmar (com loading) */}
        <button
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] transition-all"
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 align-middle"></div>
              Confirmando...
            </>
          ) : (
            'Confirmar'
          )}
        </button>
        
        {/* Botão Reiniciar */}
        <button
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
          onClick={onReset}
          disabled={isPending}
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}