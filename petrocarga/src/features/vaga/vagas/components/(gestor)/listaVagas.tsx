'use client';

import { useEffect, useMemo, useState } from 'react';

import VagaItem from '@/features/vaga/vagas/components/cards/vagas-item';

import { useVagas } from '../../hooks/useVagas';

import {
  FiltroVaga,
  StatusVaga,
  VagasFiltradasParams,
} from '../../types/vaga2';

function useDebounce(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

type ListaVagasProps = {
  searchQuery: string;
  filtro: FiltroVaga;
  onSelectFirstCoordinate?: (coord: {
    lat: number;
    lng: number;
  }) => void;
};

export function ListaVagas({
  searchQuery,
  filtro,
  onSelectFirstCoordinate,
}: ListaVagasProps) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [paginaAtual, setPaginaAtual] = useState(0);

  // ==================== STATUS ====================

  const status: StatusVaga | undefined =
    filtro === 'todas'
      ? undefined
      : filtro === 'disponiveis'
        ? 'DISPONIVEL'
        : 'INDISPONIVEL';

  // ==================== PARAMETROS ====================

  const params = useMemo<VagasFiltradasParams>(
    () => ({
      pagina: paginaAtual,
      tamanhoPagina: 10,
      status,
      logradouro: debouncedSearchQuery || undefined,
    }),
    [paginaAtual, status, debouncedSearchQuery],
  );

  // ==================== VAGAS ====================

  const {
    vagas,
    loading,
    error,
    totalElementos,
    totalPaginas,
    buscaPaginada,
  } = useVagas({
    params,
    buscarAutomaticamente: true,
  });

  // ==================== FOCO NO MAPA ====================

  useEffect(() => {
    if (
      vagas.length > 0 &&
      onSelectFirstCoordinate &&
      debouncedSearchQuery !== ''
    ) {
      const primeira = vagas[0];

      if (
        primeira?.latitudeInicio !== undefined &&
        primeira?.longitudeInicio !== undefined
      ) {
        onSelectFirstCoordinate({
          lat: primeira.latitudeInicio,
          lng: primeira.longitudeInicio,
        });
      }
    }
  }, [
    vagas,
    debouncedSearchQuery,
    onSelectFirstCoordinate,
  ]);

  // ==================== RESET PAGINAÇÃO ====================

  useEffect(() => {
    setPaginaAtual(0);
  }, [debouncedSearchQuery, filtro]);

  // ==================== ORDENAÇÃO ====================

  const vagasOrdenadas = useMemo(() => {
    return [...vagas].sort((a, b) => {
      if (
        a.status === 'DISPONIVEL' &&
        b.status !== 'DISPONIVEL'
      ) {
        return -1;
      }

      if (
        b.status === 'DISPONIVEL' &&
        a.status !== 'DISPONIVEL'
      ) {
        return 1;
      }

      return 0;
    });
  }, [vagas]);

  // ==================== PAGINAÇÃO ====================

  const podeVoltar = paginaAtual > 0;
  const podeAvancar = paginaAtual + 1 < totalPaginas;

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina < 0 || novaPagina >= totalPaginas) {
      return;
    }

    setPaginaAtual(novaPagina);
  };

  // ==================== RENDER ====================

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 mt-4">
            Carregando vagas...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 mt-4">
            {error}
          </p>
        ) : vagasOrdenadas.length > 0 ? (
          vagasOrdenadas.map((vaga) => (
            <VagaItem
              key={vaga.id}
              vaga={vaga}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center mt-4">
            Nenhuma vaga encontrada.
          </p>
        )}
      </div>

      {!loading && totalPaginas > 1 && (
        <div className="flex items-center justify-between border-t pt-3 mt-2 px-1">
          <button
            type="button"
            onClick={() =>
              mudarPagina(paginaAtual - 1)
            }
            disabled={!podeVoltar}
            className="px-3 py-1 text-sm rounded-md border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {paginaAtual + 1} de {totalPaginas}

            {totalElementos > 0 &&
              ` · ${totalElementos} vagas`}
          </span>

          <button
            type="button"
            onClick={() =>
              mudarPagina(paginaAtual + 1)
            }
            disabled={!podeAvancar}
            className="px-3 py-1 text-sm rounded-md border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

