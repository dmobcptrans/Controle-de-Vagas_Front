import { calcularDiasDisponiveis } from './../reservaHelpers';
import { useCallback, useMemo } from 'react';
import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import { useDisponibilidade } from '@/features/vaga/disponibilidadeVaga/hooks/useDisponibilidade';
import type { DisponibilidadesParam } from '@/features/vaga/disponibilidadeVaga/types/disponibilidadeVaga';


export function useDiasDisponiveis(vaga: VagaResponse | null) {
  const { disponibilidades, loading, buscar } = useDisponibilidade({ buscarAutomaticamente: false });

  // derivado: sem useEffect + useState
  const availableDates = useMemo(
    () => (vaga ? calcularDiasDisponiveis(disponibilidades ?? [], vaga) : []),
    [disponibilidades, vaga],
  );

  const fetchDias = useCallback(
    async (mesReferencia: Date) => {
      if (!vaga?.operacoesVaga?.length) return;
      await buscar({
        vagaId: vaga.id,
        mes: mesReferencia.getMonth() + 1,
        ano: mesReferencia.getFullYear(),
      } as DisponibilidadesParam);
    },
    [vaga, buscar],
  );

  return { availableDates, loadingDias: loading, fetchDias };
}