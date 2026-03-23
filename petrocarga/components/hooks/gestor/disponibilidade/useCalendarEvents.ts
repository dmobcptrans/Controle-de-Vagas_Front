import { useMemo } from 'react';
import type { EventInput } from '@fullcalendar/core';

// Importando tipos necessários
import type { Disponibilidade } from '@/lib/types/disponibilidadeVagas';
import type { Vaga } from '@/lib/types/vaga';

/* ----------------------- TIPOS DO EVENTO DO CALENDÁRIO ------------------- */

interface ExtendedPropsDisponibilidade {
  logradouro: string | null;
  intervalo: string | null;
  disps?: Disponibilidade[];
  grupos?: Record<string, Disponibilidade[]>;
  isGrouped: boolean;
}

interface EventoDisponibilidade extends EventInput {
  extendedProps: ExtendedPropsDisponibilidade;
}

/* ----------------------- INTERFACE DE PROPS DO HOOK ---------------------- */

interface UseCalendarEventsProps {
  disponibilidadesAgrupadas: Record<string, Record<string, Disponibilidade[]>>;
  vagas: Vaga[];
}

/* --------------------------- HOOK PRINCIPAL  ------------------------------ */

/**
 * @function addOneDay
 * @description Adiciona um dia à data para ajuste do intervalo exclusivo
 * @param dateStr - Data no formato YYYY-MM-DD
 * @returns Data com um dia adicionado (YYYY-MM-DD)
 */
function addOneDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().substring(0, 10); // Retorna YYYY-MM-DD
}

/**
 * @hook useCalendarEvents
 * @version 1.0.0
 * 
 * @description Hook para converter disponibilidades agrupadas em eventos do FullCalendar.
 * Agrupa disponibilidades por intervalo de data e logradouro, gerando eventos coloridos.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. AGRUPAMENTO POR INTERVALO:
 *    - Agrupa todas as disponibilidades pelo mesmo intervalo de data
 *    - Mantém também agrupamento por logradouro dentro de cada intervalo
 * 
 * 2. CRIAÇÃO DE EVENTOS:
 *    - Para cada intervalo, cria um evento no calendário
 *    - Se há mais de um logradouro no mesmo intervalo → evento agrupado (🟢 verde)
 *    - Se há apenas um logradouro → evento individual (🔵 azul)
 * 
 * 3. TÍTULO E COR:
 *    - Agrupado: "X Logradouros Disponíveis" (verde)
 *    - Individual: Nome do logradouro (azul)
 * 
 * 4. DATAS:
 *    - Início: extraído do intervalo (YYYY-MM-DD)
 *    - Fim: adiciona +1 dia (para exibir corretamente no calendário)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - ESTRUTURA DE DADOS: disponibilidadesAgrupadas → { logradouro: { intervalo: [] } }
 * - AGRUPAMENTO: unifiedByInterval (todas disponibilidades) + logradouroGroupsByInterval (por logradouro)
 * - CORES: Verde (#22c55e) para agrupados, Azul (#3b82f6) para únicos
 * - AJUSTE DE FIM: addOneDay para compensar intervalo exclusivo do banco
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - FullCalendar: Biblioteca de calendário
 * - Disponibilidade: Tipo de disponibilidade de vaga
 * 
 * @example
 * ```tsx
 * const { eventos } = useCalendarEvents({
 *   disponibilidadesAgrupadas: disponibilidades,
 *   vagas: vagas
 * });
 * 
 * return (
 *   <FullCalendar
 *     events={eventos}
 *     // ... outras props
 *   />
 * );
 * ```
 */

export function useCalendarEvents({
  disponibilidadesAgrupadas,
  vagas,
}: UseCalendarEventsProps) {
  const eventos: EventoDisponibilidade[] = useMemo(() => {
    /* ==================== 1. ESTRUTURAS DE AGRUPAMENTO ==================== */
    const unifiedByInterval: Record<string, Disponibilidade[]> = {};
    const logradouroGroupsByInterval: Record<
      string,
      Record<string, Disponibilidade[]>
    > = {};

    /* ==================== 2. POPULAÇÃO DOS GRUPOS (UNIFICAÇÃO) ==================== */
    Object.entries(disponibilidadesAgrupadas).forEach(
      ([logradouro, intervalos]) => {
        Object.entries(intervalos).forEach(([intervaloKey, disps]) => {
          // Agrupa todas disponibilidades por intervalo
          unifiedByInterval[intervaloKey] ??= [];
          unifiedByInterval[intervaloKey].push(...disps);

          // Mantém agrupamento por logradouro dentro de cada intervalo
          logradouroGroupsByInterval[intervaloKey] ??= {};
          logradouroGroupsByInterval[intervaloKey][logradouro] = disps;
        });
      },
    );

    /* ==================== 3. MAPEAMENTO PARA EVENTOS DO FULLCALENDAR ==================== */
    return Object.entries(unifiedByInterval).map(([intervaloKey, disps]) => {
      const [inicioISO, fimISO] = intervaloKey.split(' → ');

      // Início: extrai apenas a parte da data (YYYY-MM-DD)
      const inicioDate = inicioISO.split('T')[0];

      // Fim: adiciona +1 dia (intervalo exclusivo do banco)
      const fimDateAjustada = addOneDay(fimISO.split('T')[0]);

      const logradouroGroups = logradouroGroupsByInterval[intervaloKey];
      const logradouroCount = Object.keys(logradouroGroups).length;

      // Um evento é agrupado se houver mais de um logradouro no mesmo intervalo
      const isGrouped = logradouroCount > 1;

      // Determina o nome do logradouro para eventos não agrupados
      const singleLogradouro = isGrouped
        ? null
        : (Object.keys(logradouroGroups)[0] ?? 'Disponibilidade Única');

      const uniqueEventId = isGrouped
        ? intervaloKey
        : `${intervaloKey}::${singleLogradouro}`;

      // Título do evento
      const title = isGrouped
        ? `${logradouroCount} Logradouros Disponíveis`
        : (singleLogradouro ?? 'Disponibilidade Única');

      // Cor do evento
      const color = isGrouped ? '#22c55e' : '#3b82f6'; // Verde para agrupados, Azul para únicos

      return {
        id: uniqueEventId,
        title: title,
        start: inicioDate,
        end: fimDateAjustada,
        allDay: true,
        color: color,
        extendedProps: {
          logradouro: singleLogradouro, // null se agrupado
          intervalo: intervaloKey,
          disps: disps, // Todas as disponibilidades brutas no intervalo
          grupos: logradouroGroups, // Grupos por logradouro para o modal
          isGrouped: isGrouped,
        },
      } as EventoDisponibilidade;
    });
  }, [disponibilidadesAgrupadas, vagas]);

  return { eventos };
}