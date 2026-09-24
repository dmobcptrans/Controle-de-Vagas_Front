'use client';

import { useVeiculo } from '@/features/veiculos/hooks/useVeiculo';
import { useVaga } from '@/features/vaga/vagas/hooks/useVaga';

/**
 * @hook useReservaData
 * @version 2.0.0
 *
 * @description
 * Hook responsável por centralizar os dados relacionados
 * a uma reserva, utilizando os hooks específicos de veículo e vaga.
 */
export function useReservaData(veiculoId: string, vagaId: string) {
  const {
    veiculo,
    loading: loadingVeiculo,
    error: errorVeiculo,
    buscar: buscarVeiculo,
  } = useVeiculo({
    veiculoId,
  });

  const {
    vaga,
    loading: loadingVaga,
    error: errorVaga,
    buscar: buscarVaga,
  } = useVaga({
    vagaId,
  });

  const loading = loadingVeiculo || loadingVaga;

  const error = errorVeiculo || errorVaga;

  return {
    veiculo,
    vaga,

    loading,
    error,

    loadingVeiculo,
    loadingVaga,

    errorVeiculo,
    errorVaga,

    buscarVeiculo,
    buscarVaga,
  };
}
