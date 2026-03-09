'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBr from '@fullcalendar/core/locales/pt-br';
import useReservas from '@/components/hooks/gestor/calendario/useReservas';
import { ReservaModal } from './ReservaModal';
import { useState, useMemo, useRef } from 'react';
import { toDateKey, dayStartISO } from './utils/utils';
import type { EventClickArg, EventInput } from '@fullcalendar/core';
import { getVagaById } from '@/lib/api/vagaApi';
import type { Reserva } from '@/lib/types/reserva';
import type { Vaga } from '@/lib/types/vaga';
import { Toaster } from 'sonner';

/* -------------------- Tipos -------------------- */
interface ReservasPorLogradouro {
  [logradouro: string]: Reserva[];
}

interface ReservasPorDia {
  [dateKey: string]: ReservasPorLogradouro;
}

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

/* -------------------- Componente -------------------- */
export default function CalendarioReservasGestor() {
  const { reservas, actionLoading, finalizarReservaForcada } = useReservas();
  const [vagaCache, setVagaCache] = useState<Record<string, Vaga | null>>({});
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    data: null,
  });

  /* -------------------- Histórico para VOLTAR -------------------- */
  const lastGroupRef = useRef<ModalState>({ type: null, data: null });
  const lastVagasLogradouroRef = useRef<ModalState>({ type: null, data: null });
  const lastVagaRef = useRef<ModalState>({ type: null, data: null });

  const goBack = () => {
    setModalState((prev) => {
      switch (prev.type) {
        case 'vagasLogradouro':
          return lastGroupRef.current;

        case 'vaga':
          return lastVagasLogradouroRef.current;

        case 'reserva':
          return lastVagaRef.current;

        default:
          return prev;
      }
    });
  };

  /* -------------------- Agrupar reservas -------------------- */
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

  /* -------------------- Garantir que vagas estejam no cache -------------------- */
  const ensureVagasInCache = async (vagaIds: string[]) => {
    const missing = vagaIds.filter((id) => !vagaCache[id]);
    if (!missing.length) return;

    await Promise.all(
      missing.map(async (id) => {
        try {
          const v = await getVagaById(id);
          if (v) setVagaCache((prev) => ({ ...prev, [id]: v }));
        } catch (err) {
          console.error('Erro ao buscar vaga', id, err);
        }
      }),
    );
  };

  /* -------------------- Ao clicar no evento do calendário -------------------- */
  const handleGroupClick = async (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    info.jsEvent.stopPropagation();

    const logradouros = (
      info.event.extendedProps as { logradouros: ReservasPorLogradouro }
    ).logradouros;

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

  const closeModal = () => setModalState({ type: null, data: null });

  /* -------------------- Checkout forçado (SIMPLIFICADO) -------------------- */
  const handleCheckoutForcado = async (
    reservaId: string,
    reservaData: Reserva,
  ) => {
    if (actionLoading) return;

    try {
      // ✅ Chama a função do hook que já gerencia tudo:
      // - Confirmação
      // - Checkout no backend
      // - Notificação ao motorista
      // - Feedback com toast
      // - Atualização do estado
      await finalizarReservaForcada(reservaId, reservaData);

      // Fecha o modal após sucesso (o feedback já foi mostrado pelo hook)
      closeModal();
    } catch (error) {
      console.error('Erro no checkout forçado:', error);
    }
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="p-2 md:p-4">
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          className: 'text-sm font-medium',
        }}
      />

      <ReservaModal
        modalState={modalState}
        vagaCache={vagaCache}
        close={closeModal}
        goBack={goBack}
        openVagasLogradouro={(l, r) => {
          lastGroupRef.current = modalState;
          setModalState({
            type: 'vagasLogradouro',
            data: { logradouro: l, reservasDoLogradouro: r },
          });
        }}
        openVagaModal={async (vagaId, reservasDoLogradouro) => {
          lastVagasLogradouroRef.current = modalState;

          await ensureVagasInCache([vagaId]);

          setModalState({
            type: 'vaga',
            data: {
              vagaId,
              vagaInfo: vagaCache[vagaId] ?? null,
              reservas: reservasDoLogradouro.filter((r) => r.vagaId === vagaId),
            },
          });
        }}
        openReservaModal={async (reserva) => {
          lastVagaRef.current = modalState;

          if (!vagaCache[reserva.vagaId]) {
            const v = await getVagaById(reserva.vagaId);
            if (v) setVagaCache((prev) => ({ ...prev, [reserva.vagaId]: v }));
          }

          setModalState({
            type: 'reserva',
            data: { reserva, vagaInfo: vagaCache[reserva.vagaId] ?? null },
          });
        }}
        checkoutForcado={(reservaId) => {
          if (modalState.type === 'reserva') {
            handleCheckoutForcado(reservaId, modalState.data.reserva);
          }
        }}
      />

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
