'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBr from '@fullcalendar/core/locales/pt-br';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';

import { AdicionarModal } from '@/features/usuarios/(personas)/gestores/components/modal/disponibilidade/AdicionarModal';
import { EditarModal } from '@/features/usuarios/(personas)/gestores/components/modal/disponibilidade/EditarModal';

import { useDisponibilidade } from '../hooks/useDisponibilidade';
import { useDisponibilidadeActions } from '../hooks/useDisponibilidadeActions';
import { useVagas } from '../../vagas/hooks/useVagas';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

import type { DisponibildadeVagaResponse } from '../types/disponibilidadeVaga';
import type { VagaResponse } from '../../vagas/types/vaga';
import { useCalendarioMes } from '@/contexts/CalendarioMesContext';

/* --------------------------------------------------------------------- */
/* ----------------------- TIPOS (Manutenção) -------------------------- */
/* --------------------------------------------------------------------- */

interface ExtendedPropsDisponibilidade {
  logradouro: string | null;
  intervalo: string | null;
  disps?: DisponibildadeVagaResponse[];
  grupos?: Record<string, DisponibildadeVagaResponse[]>;
  isGrouped: boolean;
}

/**
 * @component DisponibilidadeCalendario
 * @version 1.1.0
 *
 * @description Calendário interativo para gerenciamento de disponibilidade de vagas.
 * Permite visualizar, adicionar e editar disponibilidades por dia e logradouro.
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS (v1.1):
 * ----------------------------------------------------------------------------
 *
 * - useVagas (novo padrão): Não retorna mais "vagasPorLogradouro" pronto.
 *   Agora buscamos a lista completa via "buscarTodas()" e agrupamos
 *   localmente com useMemo, igual ao que o hook antigo fazia internamente.
 * - buscarAutomaticamente: false → evitamos a busca paginada automática
 *   (buscaPaginada) do hook, pois aqui precisamos de TODAS as vagas para
 *   montar o agrupamento por logradouro, não de uma página.
 * - useEffect: Dispara "buscarTodas()" uma vez na montagem.
 *
 * ----------------------------------------------------------------------------
 * 📋 HOOKS UTILIZADOS:
 * ----------------------------------------------------------------------------
 *
 * - useDisponibilidadesData: Dados de disponibilidades agrupadas
 * - useVagas: Lista de vagas (agrupamento por logradouro feito aqui)
 * - useCalendarEvents: Converte disponibilidades em eventos do FullCalendar
 * - useDisponibilidadeActions: Ações de CRUD (salvar, editar, remover)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - AdicionarModal: Modal para criar nova disponibilidade
 * - EditarModal: Modal para editar/excluir disponibilidade
 * - FullCalendar: Biblioteca de calendário
 *
 * @example
 * ```tsx
 * <DisponibilidadeCalendario />
 * ```
 */

export default function DisponibilidadeCalendario() {
  const { ano, mes } = useCalendarioMes();

  // ==================== HOOKS ====================

  const { disponibilidades,recarregar } = useDisponibilidade({
    params: {
      ano,
      mes: mes + 1,
    },
  });

  const calendarRef = useRef<FullCalendar>(null);

  const { vagas, buscarTodas } = useVagas({
    buscarAutomaticamente: false,
  });

  // ==================== BUSCAR VAGAS ====================

  useEffect(() => {
    buscarTodas();
  }, [buscarTodas]);

  // ==================== AGRUPAR VAGAS POR LOGRADOURO ====================

  const vagasPorLogradouro = useMemo(() => {
    return vagas.reduce(
      (acc, vaga) => {
        const log = vaga?.endereco?.logradouro ?? 'Sem Logradouro';

        (acc[log] ??= []).push(vaga);

        return acc;
      },
      {} as Record<string, VagaResponse[]>,
    );
  }, [vagas]);

  // ==================== AGRUPAR DISPONIBILIDADES ====================

  const disponibilidadesAgrupadas = useMemo(() => {
    return disponibilidades.reduce(
      (acc, disp) => {
        if (!disp) {
          return acc;
        }

        const log = disp.endereco?.logradouro ?? 'Logradouro Não Identificado';

        const intervalo = `${disp.inicio} → ${disp.fim}`;

        acc[log] ??= {};
        acc[log][intervalo] ??= [];
        acc[log][intervalo].push(disp);

        return acc;
      },
      {} as Record<string, Record<string, DisponibildadeVagaResponse[]>>,
    );
  }, [disponibilidades]);

  // ==================== EVENTOS DO CALENDÁRIO ====================

  const { eventos } = useCalendarEvents({
    disponibilidadesAgrupadas,
  });

  // ==================== ACTIONS ====================

  const actions = useDisponibilidadeActions({
    vagasPorLogradouro,
    disponibilidadesAgrupadas,
    recarregar,
  });

  // ==================== ESTADOS DOS MODAIS ====================

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);

  const [modalState, setModalState] = useState<{
    dataSelecionada: string | null;
    logradouroSelecionado: string | null;
    intervaloSelecionado: string | null;
    gruposAgrupados: Record<string, DisponibildadeVagaResponse[]> | null;
  }>({
    dataSelecionada: null,
    logradouroSelecionado: null,
    intervaloSelecionado: null,
    gruposAgrupados: null,
  });

  // ==================== SINCRONIZAR CALENDÁRIO ====================

  useEffect(() => {
    const api = calendarRef.current?.getApi();

    if (!api) return;

    api.gotoDate(new Date(ano, mes, 1));
  }, [ano, mes]);

  // ==================== HANDLERS ====================

  const handleDateClick = (info: DateClickArg) => {
    setModalState((prev) => ({
      ...prev,
      dataSelecionada: info.dateStr,
    }));

    setModalAddOpen(true);
  };

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
        const gruposParaModal: Record<string, DisponibildadeVagaResponse[]> = {
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

        setModalState((prev) => ({
          ...prev,
          gruposAgrupados: null,
        }));

        setModalEditOpen(false);

        return;
      }
    }

    setModalEditOpen(true);
  };

  // ==================== RENDER ====================

  return (
    <div>
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
        events={eventos}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        headerToolbar={{
          left: '',
          center: '',
          right: '',
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

          setModalState((prev) => ({
            ...prev,
            gruposAgrupados: null,
          }));
        }}
        gruposAgrupados={modalState.gruposAgrupados}
        onEditarIntervalo={actions.editarIntervalo}
        onRemoverVaga={actions.removerVagaDisponibilidade}
      />
    </div>
  );
}
