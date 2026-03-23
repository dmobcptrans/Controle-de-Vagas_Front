'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBr from '@fullcalendar/core/locales/pt-br';
import { useState } from 'react';

import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';

import { AdicionarModal } from '../../modal/gestor/disponibilidade/AdicionarModal';
import { EditarModal } from '../../modal/gestor/disponibilidade/EditarModal';

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

/**
 * @component DisponibilidadeCalendario
 * @version 1.0.0
 * 
 * @description Calendário interativo para gerenciamento de disponibilidade de vagas.
 * Permite visualizar, adicionar e editar disponibilidades por dia e logradouro.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. CALENDÁRIO:
 *    - Visualização mensal (dayGridMonth)
 *    - Navegação por mês (prev/next)
 *    - Botão "Hoje" para voltar ao mês atual
 * 
 * 2. INTERAÇÕES:
 *    - Clique em um dia → abre modal para adicionar disponibilidade
 *    - Clique em um evento → abre modal para editar/excluir disponibilidade
 * 
 * 3. EVENTOS:
 *    - Eventos agrupados (múltiplos logradouros): cor verde (#22c55e)
 *    - Eventos individuais (único logradouro): cor azul (#3b82f6)
 * 
 * ----------------------------------------------------------------------------
 * 📋 HOOKS UTILIZADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useDisponibilidadesData: Dados de disponibilidades agrupadas
 * - useVagas: Lista de vagas e agrupamento por logradouro
 * - useCalendarEvents: Converte disponibilidades em eventos do FullCalendar
 * - useDisponibilidadeActions: Ações de CRUD (salvar, editar, remover)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - ESTADO CONSOLIDADO: modalState agrupa dados para os modais
 * - EVENTOS AGRUPADOS: Verdes quando há múltiplos logradouros no mesmo intervalo
 * - EVENTOS INDIVIDUAIS: Azuis quando apenas um logradouro
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
  // ==================== HOOKS ====================
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

  // ==================== ESTADOS DOS MODAIS ====================
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);

  // Estado consolidado para os modais
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

  // ==================== RENDERIZAÇÃO ====================
  return (
    <div className="p-4">
      
      {/* ==================== CALENDÁRIO ==================== */}
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