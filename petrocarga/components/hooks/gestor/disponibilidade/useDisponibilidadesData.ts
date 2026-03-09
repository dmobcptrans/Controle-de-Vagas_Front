import { useMemo } from 'react';
import { useDisponibilidade } from './useDisponibilidade';
import { Disponibilidade } from '@/lib/types/disponibilidadeVagas';

export function useDisponibilidadesData() {
  // Pega o estado e o setter do hook principal (useDisponibilidade)
  const { disponibilidades, setDisponibilidades, loading } =
    useDisponibilidade();

  /** Agrupar disponibilidades por logradouro e intervalo */
  const disponibilidadesAgrupadas = useMemo(() => {
    if (!disponibilidades || disponibilidades.length === 0) {
      return {};
    }

    return disponibilidades.reduce(
      (acc, disp) => {
        const log = disp.endereco?.logradouro ?? 'Logradouro Não Identificado';
        const intervalo = `${disp.inicio} → ${disp.fim}`;

        // Cria a estrutura de agrupamento: { [logradouro]: { [intervalo]: [disp1, disp2, ...] } }
        acc[log] ??= {};
        acc[log][intervalo] ??= [];
        acc[log][intervalo].push(disp);

        return acc;
      },
      {} as Record<string, Record<string, Disponibilidade[]>>,
    );
  }, [disponibilidades]);

  return {
    disponibilidades,
    disponibilidadesAgrupadas,
    setDisponibilidades,
    loadingDisponibilidades: loading,
  };
}
