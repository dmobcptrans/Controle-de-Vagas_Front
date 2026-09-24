'use client';

import { useCallback, useEffect, useState } from 'react';

import { useVagasMap } from '@/features/vaga/vagas/hooks/useVagasMap';

import {
  ClusterMapa,
  TipoResultadoMapa,
  VagasMapa,
} from '@/features/vaga/vagas/types/vaga';

interface BoundsMapa {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

export function useVagasReserva() {
  const [tipo, setTipo] = useState<TipoResultadoMapa>('VAGAS');
  const [vagas, setVagas] = useState<VagasMapa[]>([]);
  const [clusters, setClusters] = useState<ClusterMapa[]>([]);
  const [limiteAtingido, setLimiteAtingido] = useState(false);

  const { buscar, vagasMap, loading, error } = useVagasMap({
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

  useEffect(() => {
    if (!vagasMap) {
      setTipo('VAGAS');
      setVagas([]);
      setClusters([]);
      setLimiteAtingido(false);
      return;
    }

    setTipo(vagasMap.tipo);
    setVagas(vagasMap.vagas);
    setClusters(vagasMap.clusters);
    setLimiteAtingido(vagasMap.limiteAtingido);
  }, [vagasMap]);

  return {
    tipo,
    vagas,
    clusters,
    limiteAtingido,
    loading,
    error,
    buscarVagas,
  };
}
