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

import { useDisponibilidadesData } from '../hooks/useDisponibilidadesData';
import { useDisponibilidadeActions } from '../hooks/useDisponibilidadeActions';
import { useVagas } from '../../vagas/hooks/useVagas';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

import type { DisponibildadeVagaResponse } from '../types/disponibilidadeVaga2';
import type { VagaResponse } from '../../vagas/types/vaga2';
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
  const calendarRef = useRef<FullCalendar>(null);

  // ==================== HOOKS ====================
  const { disponibilidadesAgrupadas, setDisponibilidades } =
    useDisponibilidadesData({ mes: mes + 1, ano: ano });

  const { vagas, buscarTodas } = useVagas({ buscarAutomaticamente: false });

  useEffect(() => {
    buscarTodas();
  }, [buscarTodas]);

  // ==================== AGRUPAR VAGAS POR LOGRADOURO ====================
  const vagasPorLogradouro = useMemo(() => {
    return vagas.reduce((acc, vaga) => {
      const log = vaga?.endereco?.logradouro ?? 'Sem Logradouro';
      (acc[log] ??= []).push(vaga);
      return acc;
    }, {} as Record<string, VagaResponse[]>);
  }, [vagas]);

  const { eventos } = useCalendarEvents({
    disponibilidadesAgrupadas,
  });

  const actions = useDisponibilidadeActions({
    vagasPorLogradouro,
    disponibilidadesAgrupadas,
    setDisponibilidades,
  });

  // ==================== ESTADOS DOS MODAIS ====================
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);

  // Estado consolidado para os modais
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

  // ==================== EFFECTS ====================

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.gotoDate(new Date(ano, mes, 1));
  }, [ano, mes]);

  // ==================== HANDLERS ====================

  /**
   * @function handleDateClick
   * @description Abre modal de adição ao clicar em um dia do calendário
   */
  const handleDateClick = (info: DateClickArg) => {
    setModalState((prev) => ({ ...prev, dataSelecionada: info.dateStr }));
    setModalAddOpen(true);
  };

  /**
   * @function handleEventClick
   * @description Abre modal de edição ao clicar em um evento
   *
   * Comportamento:
   * - Se evento agrupado (múltiplos logradouros): abre modal com grupos
   * - Se evento individual (único logradouro): abre modal com aquele logradouro
   */
  const handleEventClick = (info: EventClickArg) => {
    const props = info.event.extendedProps as ExtendedPropsDisponibilidade;

    if (props.isGrouped) {
      // Evento agrupado: abre com todos os grupos
      setModalState({
        dataSelecionada: null,
        logradouroSelecionado: null,
        intervaloSelecionado: null,
        gruposAgrupados: props.grupos ?? null,
      });
    } else {
      // Evento individual: cria grupo com o logradouro único
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
        setModalState((prev) => ({ ...prev, gruposAgrupados: null }));
        setModalEditOpen(false);
        return;
      }
    }
    setModalEditOpen(true);
  };

  // ==================== RENDERIZAÇÃO ====================
  return (
    <div>
      {/* ==================== CALENDÁRIO ==================== */}
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

      {/* ==================== MODAL DE ADIÇÃO ==================== */}
      <AdicionarModal
        open={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        vagasPorLogradouro={vagasPorLogradouro}
        dataInicialPredefinida={modalState.dataSelecionada}
        onSalvar={actions.salvar}
      />

      {/* ==================== MODAL DE EDIÇÃO ==================== */}
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