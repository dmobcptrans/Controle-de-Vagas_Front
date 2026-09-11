'use client';

import { useState, useMemo } from 'react';

import { ChevronDown, ChevronUp, Archive, CopyPlus } from 'lucide-react';

import ReservaCard from './ReservaCard';

import ReservaRapidaCard from '@/features/usuarios/(personas)/agentes/components/cards/reservaRapida-card';

import { ReservaGet } from '../../reservar-vaga/types/reserva';
import { ReservaRapida } from '../../reservar-vaga/types/reservaRapida';

import { CTA } from '@/components/ui/CTA/CTA';

// ============================================================
// CONSTANTES
// ============================================================

/**
 * Prioridade para ordenação das reservas.
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
 * Reservas exibidas na seção principal.
 */
const VISIBLE_STATUSES = new Set(['ATIVA', 'RESERVADA']);

/**
 * Reservas exibidas no histórico.
 */
const HIDDEN_STATUSES = new Set(['CONCLUIDA', 'CANCELADA', 'REMOVIDA']);

// ============================================================
// ORDENAÇÃO
// ============================================================

const sortReservas = (a: ReservaGet, b: ReservaGet) => {
  const statusA = (a.status || '').toUpperCase();
  const statusB = (b.status || '').toUpperCase();

  const pa = PRIORIDADE[statusA] ?? 999;
  const pb = PRIORIDADE[statusB] ?? 999;

  return pa - pb;
};

const sortReservasRapidas = (a: ReservaRapida, b: ReservaRapida) => {
  const statusA = (a.status || '').toUpperCase();
  const statusB = (b.status || '').toUpperCase();

  const pa = PRIORIDADE[statusA] ?? 999;
  const pb = PRIORIDADE[statusB] ?? 999;

  return pa - pb;
};

// ============================================================
// PROPS
// ============================================================

interface ReservaListaProps {
  /**
   * Reservas normais.
   *
   * Utilizadas pelos usuários comuns.
   */
  reservas?: ReservaGet[];

  /**
   * Reservas rápidas.
   *
   * Utilizadas pelos agentes.
   */
  reservasRapidas?: ReservaRapida[];

  /**
   * Permissão do usuário.
   *
   * AGENTE -> ReservaRapida
   * demais -> Reserva normal
   */
  permissao: string;

  /**
   * Ações das reservas normais.
   */
  onGerarDocumento?: (reservaId: string) => void;

  onExcluir?: (id: string) => void;

  onCheckout?: (reserva: ReservaGet) => void;

  /**
   * Ação específica das reservas rápidas.
   */
  onCheckoutRapido?: (reservaId: string) => void;
}

// ============================================================
// COMPONENTE
// ============================================================

export default function ReservaLista({
  reservas = [],
  reservasRapidas = [],
  permissao,
  onGerarDocumento,
  onExcluir,
  onCheckout,
  onCheckoutRapido,
}: ReservaListaProps) {
  const [mostrarOcultas, setMostrarOcultas] = useState(true);

  const isAgente = permissao === 'AGENTE';

  // ============================================================
  // CTA
  // ============================================================

  const href = isAgente ? '/agente/reserva-rapida' : '/reservar-vaga';

  const descricao = isAgente ? 'Criar Reserva Rápida' : 'Fazer Reserva';

  // ============================================================
  // RESERVAS NORMAIS
  // ============================================================

  const reservasNormais = useMemo(() => {
    const buckets = reservas.reduce(
      (acc, reserva) => {
        const status = (reserva.status || '').toUpperCase();

        if (VISIBLE_STATUSES.has(status)) {
          acc.visiveis.push(reserva);
        }

        if (HIDDEN_STATUSES.has(status)) {
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

  // ============================================================
  // RESERVAS RÁPIDAS
  // ============================================================

  const reservasRapidasProcessadas = useMemo(() => {
    const buckets = reservasRapidas.reduce(
      (acc, reserva) => {
        const status = (reserva.status || '').toUpperCase();

        if (VISIBLE_STATUSES.has(status)) {
          acc.visiveis.push(reserva);
        }

        if (HIDDEN_STATUSES.has(status)) {
          acc.ocultas.push(reserva);
        }

        return acc;
      },
      {
        visiveis: [] as ReservaRapida[],
        ocultas: [] as ReservaRapida[],
      },
    );

    return {
      visiveis: buckets.visiveis.sort(sortReservasRapidas),

      ocultas: buckets.ocultas.sort(sortReservasRapidas),
    };
  }, [reservasRapidas]);

  // ============================================================
  // LISTA QUE SERÁ EXIBIDA
  // ============================================================

  const visiveis = isAgente
    ? reservasRapidasProcessadas.visiveis
    : reservasNormais.visiveis;

  const ocultas = isAgente
    ? reservasRapidasProcessadas.ocultas
    : reservasNormais.ocultas;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      {/* ======================================================
          RESERVAS ATIVAS
      ====================================================== */}

      <section className="flex flex-col gap-4">
        {visiveis.length > 0 ? (
          visiveis.map((reserva) => {
            // ==================================================
            // AGENTE
            // ==================================================

            if (isAgente) {
              const reservaRapida = reserva as ReservaRapida;

              return (
                <ReservaRapidaCard
                  key={reservaRapida.id}
                  reserva={reservaRapida}
                  onCheckout={onCheckoutRapido}
                />
              );
            }

            // ==================================================
            // USUÁRIO NORMAL
            // ==================================================

            const reservaNormal = reserva as ReservaGet;

            return (
              <ReservaCard
                key={reservaNormal.id}
                reserva={reservaNormal}
                onGerarDocumento={onGerarDocumento}
                onExcluir={onExcluir}
                onCheckout={onCheckout}
              />
            );
          })
        ) : (
          <CTA
            href={href}
            title="Nenhuma Reserva Ativa"
            description={descricao}
            icon={<CopyPlus className="h-5 w-5 text-white" />}
          />
        )}
      </section>

      {/* ======================================================
          HISTÓRICO
      ====================================================== */}

      {ocultas.length > 0 && (
        <div className="border-t border-gray-100">
          {/* ==================================================
              TOGGLE
          ================================================== */}

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

          {/* ==================================================
              CONTEÚDO DO HISTÓRICO
          ================================================== */}

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
                {ocultas.map((reserva) => {
                  // ==========================================
                  // AGENTE
                  // ==========================================

                  if (isAgente) {
                    const reservaRapida = reserva as ReservaRapida;

                    return (
                      <div
                        key={reservaRapida.id}
                        className="
                          mt-2
                          opacity-75
                          transition-opacity
                          hover:opacity-100
                        "
                      >
                        <ReservaRapidaCard reserva={reservaRapida} />
                      </div>
                    );
                  }

                  // ==========================================
                  // USUÁRIO NORMAL
                  // ==========================================

                  const reservaNormal = reserva as ReservaGet;

                  return (
                    <div
                      key={reservaNormal.id}
                      className="
                        mt-2
                        opacity-75
                        transition-opacity
                        hover:opacity-100
                      "
                    >
                      <ReservaCard
                        reserva={reservaNormal}
                        onGerarDocumento={onGerarDocumento}
                        onExcluir={onExcluir}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
