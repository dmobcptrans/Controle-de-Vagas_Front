'use client';

import { useCallback } from 'react';

import { useVagasMap } from '@/features/vaga/vagas/hooks/useVagasMap';

import { BoundsMapa } from '../types/map';

export function useVagasReserva() {
  const {
    buscar,
    vagasMap,
    loading,
    error,
  } = useVagasMap({
    buscarAutomaticamente: false,
  });

  const buscarVagas = useCallback(
    async (bounds: BoundsMapa) => {
      await buscar({
        ...bounds,
        status: 'DISPONIVEL',
      });
    },
    [buscar],
  );

  return {
    tipo: vagasMap?.tipo ?? 'VAGAS',
    vagas: vagasMap?.vagas ?? [],
    clusters: vagasMap?.clusters ?? [],
    limiteAtingido:
      vagasMap?.limiteAtingido ?? false,
    loading,
    error,
    buscarVagas,
  };
}