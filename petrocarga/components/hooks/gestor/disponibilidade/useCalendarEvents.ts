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

function addOneDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().substring(0, 10); // Retorna YYYY-MM-DD
}

export function useCalendarEvents({
  disponibilidadesAgrupadas,
  vagas,
}: UseCalendarEventsProps) {
  const eventos: EventoDisponibilidade[] = useMemo(() => {
    /* 1. ESTRUTURAS DE AGRUPAMENTO */
    const unifiedByInterval: Record<string, Disponibilidade[]> = {};
    const logradouroGroupsByInterval: Record<
      string,
      Record<string, Disponibilidade[]>
    > = {};

    /* 2. POPULAÇÃO DOS GRUPOS (UNIFICAÇÃO) */
    Object.entries(disponibilidadesAgrupadas).forEach(
      ([logradouro, intervalos]) => {
        Object.entries(intervalos).forEach(([intervaloKey, disps]) => {
          unifiedByInterval[intervaloKey] ??= [];
          unifiedByInterval[intervaloKey].push(...disps);

          logradouroGroupsByInterval[intervaloKey] ??= {};
          logradouroGroupsByInterval[intervaloKey][logradouro] = disps;
        });
      },
    );

    /* 3. MAPEAMENTO PARA EVENTOS DO FULLCALENDAR */
    return Object.entries(unifiedByInterval).map(([intervaloKey, disps]) => {
      const [inicioISO, fimISO] = intervaloKey.split(' → ');

      // 1. Início: Pegamos apenas a parte da data. Ex: "2025-12-08"
      const inicioDate = inicioISO.split('T')[0];

      // 2. Fim: Adiciona mais um dia à data exclusiva do banco para exibir corretamente
      const fimDateAjustada = addOneDay(fimISO.split('T')[0]);

      const logradouroGroups = logradouroGroupsByInterval[intervaloKey];
      const logradouroCount = Object.keys(logradouroGroups).length;

      // Um evento é agrupado se houver mais de um logradouro no mesmo intervalo de tempo.
      const isGrouped = logradouroCount > 1;

      // Determina o nome do logradouro para eventos não agrupados
      const singleLogradouro = isGrouped
        ? null
        : (Object.keys(logradouroGroups)[0] ?? 'Disponibilidade Única');

      const uniqueEventId = isGrouped
        ? intervaloKey
        : `${intervaloKey}::${singleLogradouro}`;

      // Título
      const title = isGrouped
        ? `${logradouroCount} Logradouros Disponíveis`
        : (singleLogradouro ?? 'Disponibilidade Única');

      // Cor
      const color = isGrouped ? '#22c55e' : '#3b82f6'; // Verde para agrupados, Azul para únicos

      return {
        id: uniqueEventId,
        title: title,
        start: inicioDate,
        end: fimDateAjustada,
        allDay: true,
        color: color,
        extendedProps: {
          // Logradouro é preenchido apenas se for um evento único
          logradouro: singleLogradouro,
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
