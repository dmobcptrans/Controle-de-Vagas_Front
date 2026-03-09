'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBr from '@fullcalendar/core/locales/pt-br';
import { useState } from 'react';

import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';

import { AdicionarModal } from './AdicionarModal';
import { EditarModal } from './EditarModal';

import { useDisponibilidadesData } from '../../hooks/gestor/disponibilidade/useDisponibilidadesData';
import { useDisponibilidadeActions } from '../../hooks/gestor/disponibilidade/useDisponibilidadeActions';
import { useVagas } from '../../hooks/gestor/disponibilidade/useVagas';
import { useCalendarEvents } from '../../hooks/gestor/disponibilidade/useCalendarEvents';

import type { Disponibilidade } from '@/lib/types/disponibilidadeVagas';

/* --------------------------------------------------------------------- */
/* ----------------------- TIPOS (Manutenção) -------------------------- */
/* --------------------------------------------------------------------- */

interface ExtendedPropsDisponibilidade {
  logradouro: string | null;
  intervalo: string | null;
  disps?: Disponibilidade[];
  grupos?: Record<string, Disponibilidade[]>;
  isGrouped: boolean;
}

/* --------------------------------------------------------------------- */
/* --------------------------- COMPONENTE ------------------------------ */
/* --------------------------------------------------------------------- */

export default function DisponibilidadeCalendario() {
  const { disponibilidadesAgrupadas, setDisponibilidades } =
    useDisponibilidadesData();

  const { vagas, vagasPorLogradouro } = useVagas();

  const { eventos } = useCalendarEvents({
    disponibilidadesAgrupadas,
    vagas,
  });

  const actions = useDisponibilidadeActions({
    vagasPorLogradouro,
    disponibilidadesAgrupadas,
    setDisponibilidades,
  });

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);

  // Estado consolidado para a informação do modal de edição/adição
  const [modalState, setModalState] = useState<{
    dataSelecionada: string | null;
    logradouroSelecionado: string | null;
    intervaloSelecionado: string | null;
    gruposAgrupados: Record<string, Disponibilidade[]> | null;
  }>({
    dataSelecionada: null,
    logradouroSelecionado: null,
    intervaloSelecionado: null,
    gruposAgrupados: null,
  });

  /* --------------------------------------------------------------------- */
  /* ------------------- CLIQUE EM UM DIA  -------------------------- */
  /* --------------------------------------------------------------------- */

  const handleDateClick = (info: DateClickArg) => {
    setModalState((prev) => ({ ...prev, dataSelecionada: info.dateStr }));
    setModalAddOpen(true);
  };

  /* --------------------------------------------------------------------- */
  /* ------------------- CLIQUE EM UM EVENTO ----------------- */
  /* --------------------------------------------------------------------- */

  const handleEventClick = (info: EventClickArg) => {
    const props = info.event.extendedProps as ExtendedPropsDisponibilidade;

    if (props.isGrouped) {
      setModalState({
        dataSelecionada: null,
        logradouroSelecionado: null,
        intervaloSelecionado: null,
        gruposAgrupados: props.grupos ?? null,
      });
    } else {
      const disposDoUnicoLogradouro = props.disps || [];

      if (props.logradouro && disposDoUnicoLogradouro.length > 0) {
        const gruposParaModal: Record<string, Disponibilidade[]> = {
          [props.logradouro]: disposDoUnicoLogradouro,
        };

        setModalState({
          dataSelecionada: null,
          logradouroSelecionado: props.logradouro,
          intervaloSelecionado: props.intervalo,
          gruposAgrupados: gruposParaModal,
        });
      } else {
        console.error('Erro: Evento individual sem dados de disponibilidade.');
        setModalState((prev) => ({ ...prev, gruposAgrupados: null }));
        setModalEditOpen(false);
        return;
      }
    }
    setModalEditOpen(true);
  };

  /* --------------------------------------------------------------------- */
  /* ----------------------------- RENDER -------------------------------- */
  /* --------------------------------------------------------------------- */

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        timeZone="local"
        locale={ptBr}
        height="80vh"
        events={eventos}
        timeZoneParam="UTC"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev next',
          center: 'title',
          right: 'today',
        }}
      />

      <AdicionarModal
        open={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        vagasPorLogradouro={vagasPorLogradouro}
        dataInicialPredefinida={modalState.dataSelecionada}
        onSalvar={actions.salvar}
      />
      <EditarModal
        open={modalEditOpen}
        onClose={() => {
          setModalEditOpen(false);

          setModalState((prev) => ({ ...prev, gruposAgrupados: null }));
        }}
        gruposAgrupados={modalState.gruposAgrupados}
        onEditarIntervalo={actions.editarIntervalo}
        onRemoverVaga={actions.removerVagaDisponibilidade}
      />
    </div>
  );
}
