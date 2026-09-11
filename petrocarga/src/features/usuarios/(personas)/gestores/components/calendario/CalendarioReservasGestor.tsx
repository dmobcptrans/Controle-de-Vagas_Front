'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBr from '@fullcalendar/core/locales/pt-br';
import useReservas from '../../hooks/calendario/useReservas';
import { ReservaModal } from '@/features/usuarios/(personas)/gestores/components/modal/calendario/ReservaModal';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { toDateKey, dayStartISO } from '@/components/utils/gestor/calendario/utils';
import type { EventClickArg, EventInput } from '@fullcalendar/core';
import { getVagaById } from '@/features/vaga/vagas/service/vagaApi';
import type { Reserva } from '@/features/reserva/reservar-vaga/types/reserva';
import type { Vaga } from '@/features/vaga/vagas/types/vaga';
import { useCalendarioMes } from '@/contexts/CalendarioMesContext';

// ==================== TIPOS ====================

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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CalendarioReservasGestor() {
  const {
    reservasDoMes,
    reservasDoDia,
    actionLoading,
    finalizarReservaForcada,
    carregarReservas,
    carregarReservasDoDia,
  } = useReservas();
  const { ano, mes } = useCalendarioMes();
  const calendarRef = useRef<InstanceType<typeof FullCalendar>>(null);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.gotoDate(new Date(ano, mes, 1));
  }, [ano, mes]);

  useEffect(() => {
    carregarReservas(
      { mes: mes + 1, ano: ano }
    );

    carregarReservasDoDia();

    const interval = setInterval(() => {
      carregarReservasDoDia();
    }, 15000); // 15 segundos

    return () => clearInterval(interval);
  }, [mes, carregarReservas, carregarReservasDoDia]);

  const vagaCacheRef = useRef<Record<string, Vaga | null>>({});
  const [, forceUpdate] = useState(0);
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    data: null,
  });
  const historyRef = useRef<ModalState[]>([]);

  // ==================== NAVEGAÇÃO ====================

  const goBack = () => {
    setModalState(historyRef.current.pop() ?? { type: null, data: null });
  };

  const closeModal = () => {
    historyRef.current = [];
    setModalState({ type: null, data: null });
  };

  // ==================== DADOS ====================

  // Mescla reservasDoMes com reservasDoDia, priorizando os dados
  // frescos do dia atual (que vêm com TODOS os status, atualizados a cada 15s)
  const reservasCombinadas = useMemo(() => {
    const hojeKey = toDateKey(new Date().toISOString());
    const semHoje = reservasDoMes.filter(
      (r) => toDateKey(r.inicio) !== hojeKey,
    );
    return [...semHoje, ...reservasDoDia];
  }, [reservasDoMes, reservasDoDia]);

  const reservasPorDia = useMemo<ReservasPorDia>(() => {
    const map: ReservasPorDia = {};

    reservasCombinadas.forEach((r) => {
      const dateKey = toDateKey(r.inicio);

      if (!map[dateKey]) map[dateKey] = {};

      if (!map[dateKey][r.enderecoVaga.logradouro]) {
        map[dateKey][r.enderecoVaga.logradouro] = [];
      }

      map[dateKey][r.enderecoVaga.logradouro].push(r);
    });

    return map;
  }, [reservasCombinadas]);

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

  // ==================== CACHE ====================

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

  const handleCheckoutForcado = async (
    reservaId: string,
    reservaData: Reserva,
  ) => {
    if (actionLoading) return;
    try {
      await finalizarReservaForcada(reservaId, reservaData);
      closeModal();
    } catch {}
  };

  // ==================== RENDER ====================

  return (
    <div>
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

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        locale={ptBr}
        initialView="dayGridMonth"
        height="auto"
        dayMaxEventRows={3}
        eventDisplay="block"
        expandRows={true}
        showNonCurrentDates={false}
        fixedWeekCount={false}
        contentHeight="auto"
        events={eventosCalendario}
        eventClick={handleGroupClick}
        headerToolbar={{
          left: '',
          center: '',
          right: '',
        }}
      />
    </div>
  );
}