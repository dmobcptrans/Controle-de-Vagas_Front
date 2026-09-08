'use client';

import { useState, useMemo } from 'react';

import { ChevronDown, ChevronUp, Archive, CopyPlus } from 'lucide-react';

import ReservaCard from './ReservaCard';

import { ReservaGet } from '@/lib/types/reservas/reserva';

import { CTA } from '@/components/ui/CTA/CTA';

// ==================== CONSTANTES ====================

/**
 * Prioridade para ordenação das reservas
 *
 * Quanto menor o número, maior a prioridade.
 */
const PRIORIDADE: Record<string, number> = {
  ATIVA: 1,
  RESERVADA: 2,
  CONCLUIDA: 3,
  CANCELADA: 4,
  REMOVIDA: 5,
};

/**
 * Reservas visíveis
 *
 * Exibidas na seção principal.
 */
const VISIBLE_STATUSES = new Set(['ATIVA', 'RESERVADA']);

/**
 * Reservas ocultas
 *
 * Exibidas na seção de histórico.
 */
const HIDDEN_STATUSES = new Set(['CONCLUIDA', 'CANCELADA', 'REMOVIDA']);

/**
 * Ordena as reservas pela prioridade do status.
 */
const sortReservas = (a: ReservaGet, b: ReservaGet) => {
  const statusA = (a.status || '').toUpperCase();
  const statusB = (b.status || '').toUpperCase();

  const pa = PRIORIDADE[statusA] ?? 999;
  const pb = PRIORIDADE[statusB] ?? 999;

  return pa - pb;
};

// ==================== PROPS ====================

interface ReservaListaProps {
  reservas: ReservaGet[];

  permissao: string;

  onGerarDocumento: (reservaId: string) => void;

  onExcluir: (id: string) => void;

  onCheckout: (reserva: ReservaGet) => void;
}

// ==================== COMPONENTE ====================

export default function ReservaLista({
  reservas,
  permissao,
  onGerarDocumento,
  onExcluir,
  onCheckout,
}: ReservaListaProps) {
  const [mostrarOcultas, setMostrarOcultas] = useState(true);

  // ==================== CTA ====================

  const href =
    permissao === 'AGENTE' ? '/agente/reserva-rapida' : '/reservar-vaga';

  const descricao =
    permissao === 'AGENTE' ? 'Criar Reserva Rápida' : 'Fazer Reserva';

  // ==================== SEPARAÇÃO ====================

  const { visiveis, ocultas } = useMemo(() => {
    const buckets = reservas.reduce(
      (acc, reserva) => {
        const status = (reserva.status || '').toUpperCase();

        if (VISIBLE_STATUSES.has(status)) {
          acc.visiveis.push(reserva);
        } else if (HIDDEN_STATUSES.has(status)) {
          acc.ocultas.push(reserva);
        }

        return acc;
      },
      {
        visiveis: [] as ReservaGet[],
        ocultas: [] as ReservaGet[],
      },
    );

    return {
      visiveis: buckets.visiveis.sort(sortReservas),

      ocultas: buckets.ocultas.sort(sortReservas),
    };
  }, [reservas]);

  // ==================== RENDER ====================

  return (
    <div>
      {/* =====================================================
          SEÇÃO PRINCIPAL
      ===================================================== */}

      <section
        className="
          flex
          flex-col
          gap-4
        "
      >
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
          <CTA
            href={href}
            title="Nenhuma Reserva Ativa"
            description={descricao}
            icon={<CopyPlus className="h-5 w-5 text-white" />}
          />
        )}
      </section>

      {/* =====================================================
          SEÇÃO DE HISTÓRICO
      ===================================================== */}

      {ocultas.length > 0 && (
        <div className="border-t border-gray-100">
          {/* ==================== TOGGLE ==================== */}

          <button
            type="button"
            onClick={() => setMostrarOcultas((estado) => !estado)}
            className="
              group
              flex
              w-full
              items-center
              justify-between
              rounded-lg
              border
              border-gray-200
              bg-gray-50
              px-4
              py-3
              transition-all
              hover:bg-gray-100
              active:scale-[0.99]
            "
            aria-expanded={mostrarOcultas}
            aria-controls="lista-ocultas"
          >
            <div className="flex items-center gap-3 text-gray-600">
              <Archive
                className="
                  h-4
                  w-4
                  text-gray-400
                  transition-colors
                  group-hover:text-blue-500
                "
              />

              <span className="text-sm font-medium">
                {mostrarOcultas ? 'Ocultar histórico' : 'Ver histórico'}
              </span>

              <span
                className="
                  rounded-full
                  bg-gray-200
                  px-2
                  py-0.5
                  text-xs
                  text-gray-600
                "
              >
                {ocultas.length}
              </span>
            </div>

            {mostrarOcultas ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {/* ==================== CONTEÚDO ==================== */}

          <div
            id="lista-ocultas"
            className={`
              grid
              transition-[grid-template-rows]
              duration-300
              ease-out
              ${mostrarOcultas ? 'mt-4 grid-rows-[1fr]' : 'grid-rows-[0fr]'}
            `}
          >
            <div
              className="
                min-h-0
                overflow-hidden
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  pb-2
                "
              >
                {ocultas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="
                      opacity-75
                      transition-opacity
                      hover:opacity-100
                      mt-2
                    "
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
