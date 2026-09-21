'use client';

import { useEffect, useMemo, useState } from 'react';

import { useDisponibilidade } from './useDisponibilidade';

import {
  DisponibildadeVagaResponse,
  DisponibilidadesParam,
} from './../types/disponibilidadeVaga2';

export function useDisponibilidadesData({ mes, ano }: DisponibilidadesParam) {
  const params: DisponibilidadesParam = {
    mes,
    ano,
  };

  const { disponibilidades, loading, error, buscar, recarregar } =
    useDisponibilidade({
      params,
      buscarAutomaticamente: false,
    });

  const [disponibilidadesLocais, setDisponibilidades] = useState<
    DisponibildadeVagaResponse[]
  >([]);

  useEffect(() => {
    buscar(params);
  }, [mes, ano]);

  useEffect(() => {
    setDisponibilidades(disponibilidades);
  }, [disponibilidades]);

  const disponibilidadesAgrupadas = useMemo(() => {
    if (disponibilidadesLocais.length === 0) {
      return {};
    }

    return disponibilidadesLocais.reduce(
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
  }, [disponibilidadesLocais]);

  return {
    disponibilidades: disponibilidadesLocais,
    disponibilidadesAgrupadas,
    setDisponibilidades,
    loading,
    error,
    buscar,
    recarregar,
  };
}
