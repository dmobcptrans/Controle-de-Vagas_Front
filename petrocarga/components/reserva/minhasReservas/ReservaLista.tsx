'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Archive, CopyPlus } from 'lucide-react';
import Link from 'next/link';
import ReservaCard from './ReservaCard';
import { ReservaGet } from '@/lib/types/reserva';

// ==================== CONSTANTES (Fora do componente) ====================
/**
 * Prioridade para ordenação das reservas
 * Quanto menor o número, maior a prioridade
 */
const PRIORIDADE: Record<string, number> = {
  ATIVA: 1,
  RESERVADA: 2,
  CONCLUIDA: 3,
  CANCELADA: 4,
  REMOVIDA: 5,
};

/**
 * Reservas visíveis (não arquivadas)
 * Exibidas na seção principal
 */
const VISIBLE_STATUSES = new Set(['ATIVA', 'RESERVADA']);

/**
 * Reservas ocultas (arquivadas/histórico)
 * Exibidas em seção colapsável
 */
const HIDDEN_STATUSES = new Set(['CONCLUIDA', 'CANCELADA', 'REMOVIDA']);

/**
 * @function sortReservas
 * @description Ordena reservas por prioridade (ATIVA > RESERVADA > CONCLUIDA > CANCELADA > REMOVIDA)
 */
const sortReservas = (a: ReservaGet, b: ReservaGet) => {
  const statusA = (a.status || '').toUpperCase();
  const statusB = (b.status || '').toUpperCase();
  const pa = PRIORIDADE[statusA] ?? 999;
  const pb = PRIORIDADE[statusB] ?? 999;
  return pa - pb;
};

interface ReservaListaProps {
  reservas: ReservaGet[];
  onGerarDocumento: (reservaId: string) => void;
  onExcluir: (id: string) => void;
  onCheckout: (reserva: ReservaGet) => void;
}

/**
 * @component ReservaLista
 * @version 1.0.0
 * 
 * @description Lista de reservas com separação entre ativas e histórico.
 * Reservas ativas (ATIVA/RESERVADA) são exibidas sempre.
 * Reservas encerradas (CONCLUIDA/CANCELADA/REMOVIDA) ficam em seção colapsável.
 * 
 * ----------------------------------------------------------------------------
 * 📋 ESTRUTURA:
 * ----------------------------------------------------------------------------
 * 
 * 1. SEÇÃO PRINCIPAL (RESERVAS ATIVAS):
 *    - Exibe reservas com status ATIVA ou RESERVADA
 *    - Ordenadas por prioridade (ATIVA primeiro)
 *    - Estado vazio: botão "Fazer Reserva"
 * 
 * 2. SEÇÃO DE HISTÓRICO (COLAPSÁVEL):
 *    - Exibe reservas com status CONCLUIDA, CANCELADA ou REMOVIDA
 *    - Mostra contador de itens no botão
 *    - Pode ser expandido/recolhido
 *    - Transição suave com grid-rows
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - SEPARAÇÃO POR STATUS: VISIBLE_STATUSES e HIDDEN_STATUSES definem onde cada status aparece
 * - ORDENAÇÃO: PRIORIDADE mapeia ordem de exibição (ATIVA > RESERVADA > CONCLUIDA > CANCELADA > REMOVIDA)
 * - COLLAPSE: grid-rows-[1fr]/[0fr] + transition-all para animação suave
 * - MEMO: useMemo para processamento da lista (evita recálculos desnecessários)
 * - EMPTY STATE: Exibido quando não há reservas ativas, com botão para fazer nova reserva
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - ReservaCard: Card individual de reserva
 * - ReservaGet: Tipo de reserva
 * 
 * @example
 * ```tsx
 * <ReservaLista
 *   reservas={reservas}
 *   onGerarDocumento={gerarComprovante}
 *   onExcluir={excluirReserva}
 *   onCheckout={checkoutReserva}
 * />
 * ```
 */

export default function ReservaLista({
  reservas,
  onGerarDocumento,
  onExcluir,
  onCheckout,
}: ReservaListaProps) {
  const [mostrarOcultas, setMostrarOcultas] = useState(true);

  /**
   * Separa reservas em visíveis (ativas) e ocultas (histórico)
   * Ordena ambas por prioridade
   */
  const { visiveis, ocultas } = useMemo(() => {
    const buckets = reservas.reduce(
      (acc, r) => {
        const status = (r.status || '').toUpperCase();
        if (VISIBLE_STATUSES.has(status)) {
          acc.visiveis.push(r);
        } else if (HIDDEN_STATUSES.has(status)) {
          acc.ocultas.push(r);
        }
        return acc;
      },
      { visiveis: [] as ReservaGet[], ocultas: [] as ReservaGet[] },
    );

    return {
      visiveis: buckets.visiveis.sort(sortReservas),
      ocultas: buckets.ocultas.sort(sortReservas),
    };
  }, [reservas]);

  return (
    <div className="-mt-4 mb-5">

      {/* ==================== SEÇÃO PRINCIPAL (RESERVAS ATIVAS) ==================== */}
      <section className="flex flex-col gap-4 animate-in fade-in duration-200">
        {visiveis.length > 0 ? (
          visiveis.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              onGerarDocumento={onGerarDocumento}
              onExcluir={onExcluir}
              onCheckout={onCheckout}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </section>

      {/* ==================== SEÇÃO DE HISTÓRICO (COLAPSÁVEL) ==================== */}
      {ocultas.length > 0 && (
        <div className="border-t border-gray-100 pt-6">

          {/* Botão de toggle */}
          <button
            onClick={() => setMostrarOcultas((s) => !s)}
            className="group w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all active:scale-[0.99]"
            aria-expanded={mostrarOcultas}
            aria-controls="lista-ocultas"
          >
            <div className="flex items-center gap-3 text-gray-600">
              <Archive className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium">
                {mostrarOcultas ? 'Ocultar histórico' : 'Ver histórico'}
              </span>
              <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">
                {ocultas.length}
              </span>
            </div>

            {mostrarOcultas ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Conteúdo colapsável (transição suave) */}
          <div
            id="lista-ocultas"
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${mostrarOcultas ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'
              }`}
          >
            <div className="overflow-hidden min-h-0">
              <div className="flex flex-col gap-3 pb-2">
                {ocultas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <ReservaCard
                      reserva={reserva}
                      onGerarDocumento={onGerarDocumento}
                      onExcluir={onExcluir}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @component EmptyState
 * @description Componente exibido quando não há reservas ativas
 */
function EmptyState() {
  return (

    <Link href="/motorista/reservar-vaga" className="flex items-center justify-between bg-[#071D41] hover:bg-[#0C3D8A] transition-colors rounded-2xl px-5 py-4 border-l-4 border-[#FFCD07]">
      <div>
        <p className="text-white font-semibold text-[15px] mb-0.5">
          Nenhuma Reserva Ativa
        </p>
        <p className="text-white/60 text-xs">
          Fazer Reserva
        </p>
      </div>
      <div className="bg-white/15 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
        <CopyPlus className="h-5 w-5 text-white" />
      </div>
    </Link>
  );
}