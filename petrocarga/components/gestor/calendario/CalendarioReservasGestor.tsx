'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBr from '@fullcalendar/core/locales/pt-br';
import useReservas from '@/components/hooks/gestor/calendario/useReservas';
import { ReservaModal } from '@/components/modal/gestor/calendario/ReservaModal';
import { useState, useMemo, useRef, useCallback } from 'react';
import { toDateKey, dayStartISO } from '../../utils/gestor/calendario/utils';
import type { EventClickArg, EventInput } from '@fullcalendar/core';
import { getVagaById } from '@/lib/api/vagaApi';
import type { Reserva } from '@/lib/types/reserva';
import type { Vaga } from '@/lib/types/vaga';

// ============================================================================
// TIPOS
// ============================================================================

interface ReservasPorLogradouro {
  [logradouro: string]: Reserva[];
}

interface ReservasPorDia {
  [dateKey: string]: ReservasPorLogradouro;
}

/**
 * Estados do modal para navegação hierárquica
 * - group: Visualização por dia (logradouros)
 * - vagasLogradouro: Visualização por logradouro (vagas)
 * - vaga: Visualização por vaga (reservas)
 * - reserva: Detalhes da reserva
 */
type ModalState =
  | {
      type: 'group';
      data: { dateStr: string; logradouros: ReservasPorLogradouro };
    }
  | {
      type: 'vagasLogradouro';
      data: { logradouro: string; reservasDoLogradouro: Reserva[] };
    }
  | {
      type: 'vaga';
      data: { vagaId: string; vagaInfo: Vaga | null; reservas: Reserva[] };
    }
  | { type: 'reserva'; data: { reserva: Reserva; vagaInfo: Vaga | null } }
  | { type: null; data: null };

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * @component CalendarioReservasGestor
 * @version 1.0.0
 * 
 * @description Calendário interativo para gestores visualizarem reservas por dia.
 * Permite navegação hierárquica: Dia → Logradouro → Vaga → Reserva.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO DE NAVEGAÇÃO:
 * ----------------------------------------------------------------------------
 * 
 * 1. CALENDÁRIO:
 *    - Dias com reservas: marcados com ● e cor verde (se há ativas)
 *    - Dias apenas com finalizadas: cor vermelha
 *    - Clique no dia → abre modal com logradouros
 * 
 * 2. MODAL - LOGradouros:
 *    - Lista de ruas com reservas naquele dia
 *    - Contagem: "X em andamento" / "Y finalizada(s)"
 *    - Clique em "Ver vagas" → navega para vagas do logradouro
 * 
 * 3. MODAL - VAGAS:
 *    - Lista de vagas do logradouro
 *    - Indicador visual: 🟢 (ativa) / 🔴 (sem atividade)
 *    - Clique em "Ver reservas" → navega para reservas da vaga
 * 
 * 4. MODAL - RESERVAS DA VAGA:
 *    - Lista de reservas da vaga
 *    - Cada reserva exibe: horário, status, placa
 *    - Clique em "Detalhes" → navega para detalhes da reserva
 * 
 * 5. MODAL - DETALHES DA RESERVA:
 *    - Informações completas da reserva
 *    - Botão "Finalizar à força" (checkout forçado)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - CACHE DE VAGAS: vagaCacheRef evita chamadas repetidas à API
 * - NAVEGAÇÃO HIERÁRQUICA: historyRef permite voltar entre níveis
 * - EVENTOS CALENDÁRIO: Agrupados por dia, com cor verde/vermelha
 * - TIPAGEM FORTE: ModalState com union types para cada nível
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useReservas: Hook com dados e ações das reservas
 * - ReservaModal: Modal com navegação hierárquica
 * - FullCalendar: Biblioteca de calendário
 * 
 * @example
 * ```tsx
 * <CalendarioReservasGestor />
 * ```
 */

export default function CalendarioReservasGestor() {
  // ==================== HOOKS E ESTADOS ====================
  const { reservas, actionLoading, finalizarReservaForcada } = useReservas();
  const vagaCacheRef = useRef<Record<string, Vaga | null>>({});
  const [, forceUpdate] = useState(0);
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    data: null,
  });
  const historyRef = useRef<ModalState[]>([]);

  // ==================== FUNÇÕES DE NAVEGAÇÃO ====================
  
  /**
   * Volta para o estado anterior do modal
   */
  const goBack = () => {
    setModalState(historyRef.current.pop() ?? { type: null, data: null });
  };

  /**
   * Fecha completamente o modal e limpa o histórico
   */
  const closeModal = () => {
    historyRef.current = [];
    setModalState({ type: null, data: null });
  };

  // ==================== PROCESSAMENTO DE DADOS ====================
  
  /**
   * Agrupa reservas por dia e logradouro
   * Estrutura: { data: { logradouro: [reservas] } }
   */
  const reservasPorDia = useMemo<ReservasPorDia>(() => {
    const map: ReservasPorDia = {};
    reservas.forEach((r) => {
      const dateKey = toDateKey(r.inicio);
      if (!map[dateKey]) map[dateKey] = {};
      if (!map[dateKey][r.enderecoVaga.logradouro])
        map[dateKey][r.enderecoVaga.logradouro] = [];
      map[dateKey][r.enderecoVaga.logradouro].push(r);
    });
    return map;
  }, [reservas]);

  /**
   * Converte dados para eventos do FullCalendar
   * - Cor verde: há reservas ativas no dia
   * - Cor vermelha: apenas reservas finalizadas/canceladas
   */
  const eventosCalendario: EventInput[] = useMemo(() => {
    return Object.entries(reservasPorDia).map(([dateStr, logradouros]) => {
      const todasFinalizadas = Object.values(logradouros)
        .flat()
        .every(
          (reserva) =>
            reserva.status === 'CONCLUIDA' ||
            reserva.status === 'REMOVIDA' ||
            reserva.status === 'CANCELADA',
        );
      return {
        id: dateStr,
        title: '● Reservas',
        start: dayStartISO(dateStr),
        allDay: true,
        color: todasFinalizadas ? '#ef4444' : '#22c55e',
        extendedProps: { logradouros },
        classNames: ['evento-click'],
      };
    });
  }, [reservasPorDia]);

  // ==================== CACHE DE VAGAS ====================
  
  /**
   * Garante que as vagas estejam no cache antes de exibir
   * Busca apenas as que ainda não foram carregadas
   */
  const ensureVagasInCache = useCallback(async (vagaIds: string[]) => {
    const missing = vagaIds.filter((id) => !(id in vagaCacheRef.current));
    if (!missing.length) return;

    const newEntries: Record<string, Vaga | null> = {};
    await Promise.all(
      missing.map(async (id) => {
        try {
          const v = await getVagaById(id);
          newEntries[id] = v ?? null;
        } catch {
          newEntries[id] = null;
        }
      }),
    );

    if (Object.keys(newEntries).length) {
      vagaCacheRef.current = { ...vagaCacheRef.current, ...newEntries };
      forceUpdate((n) => n + 1);
    }
  }, []);

  // ==================== HANDLERS ====================
  
  /**
   * Ao clicar no evento do calendário, abre modal com logradouros
   */
  const handleGroupClick = async (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    info.jsEvent.stopPropagation();

    const logradouros = (
      info.event.extendedProps as { logradouros: ReservasPorLogradouro }
    ).logradouros;

    // Pré-carrega todas as vagas relacionadas ao dia
    const todosVagaIds = Array.from(
      new Set(
        Object.values(logradouros)
          .flat()
          .map((r) => r.vagaId),
      ),
    );

    await ensureVagasInCache(todosVagaIds);

    setModalState({
      type: 'group',
      data: { dateStr: info.event.startStr.slice(0, 10), logradouros },
    });
  };

  /**
   * Finaliza uma reserva à força (checkout forçado)
   */
  const handleCheckoutForcado = async (
    reservaId: string,
    reservaData: Reserva,
  ) => {
    if (actionLoading) return;
    try {
      await finalizarReservaForcada(reservaId, reservaData);
      closeModal();
    } catch {
      // erro já tratado pelo hook via toast
    }
  };

  // ==================== RENDERIZAÇÃO ====================
  return (
    <div className="p-2 md:p-4">
      
      {/* Modal com navegação hierárquica */}
      <ReservaModal
        modalState={modalState}
        vagaCache={vagaCacheRef.current}
        close={closeModal}
        goBack={goBack}
        openVagasLogradouro={(l, r) => {
          historyRef.current.push(modalState);
          setModalState({
            type: 'vagasLogradouro',
            data: { logradouro: l, reservasDoLogradouro: r },
          });
        }}
        openVagaModal={async (vagaId, reservasDoLogradouro) => {
          historyRef.current.push(modalState);
          await ensureVagasInCache([vagaId]);
          setModalState({
            type: 'vaga',
            data: {
              vagaId,
              vagaInfo: vagaCacheRef.current[vagaId] ?? null,
              reservas: reservasDoLogradouro.filter((r) => r.vagaId === vagaId),
            },
          });
        }}
        openReservaModal={async (reserva) => {
          historyRef.current.push(modalState);
          await ensureVagasInCache([reserva.vagaId]);
          setModalState({
            type: 'reserva',
            data: {
              reserva,
              vagaInfo: vagaCacheRef.current[reserva.vagaId] ?? null,
            },
          });
        }}
        checkoutForcado={(reservaId) => {
          if (modalState.type === 'reserva') {
            handleCheckoutForcado(reservaId, modalState.data.reserva);
          }
        }}
      />

      {/* Calendário FullCalendar */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        locale={ptBr}
        initialView="dayGridMonth"
        height="82vh"
        events={eventosCalendario}
        eventClick={handleGroupClick}
        headerToolbar={{
          left: 'prev next',
          center: 'title',
          right: 'today',
        }}
        buttonText={{ today: 'Hoje', month: 'Mês' }}
      />
    </div>
  );
}