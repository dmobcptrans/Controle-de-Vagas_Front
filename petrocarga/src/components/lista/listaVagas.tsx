'use client';

import { useEffect, useState } from 'react';

import VagaItem from '@/components/gestor/cards/vagas-item';
import { Vaga } from '@/lib/types/vaga';

import * as vagaActions from '@/services/api/vagaApi';

function useDebounce(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export type FiltroVaga = 'todas' | 'disponiveis' | 'indisponiveis';

type ListaVagasProps = {
  searchQuery: string;

  filtro: FiltroVaga;

  onSelectFirstCoordinate?: (coord: { lat: number; lng: number }) => void;
};

const TAMANHO_PAGINA = 10;

export function ListaVagas({
  searchQuery,
  filtro,
  onSelectFirstCoordinate,
}: ListaVagasProps) {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== PAGINAÇÃO ====================

  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ==================== CARREGAMENTO ====================

  useEffect(() => {
    const fetchVagas = async () => {
      setLoading(true);
      setError(null);

      try {
        const resultado = await vagaActions.getVagasFiltradas({
          logradouro: debouncedSearchQuery || undefined,
          status:
            filtro === 'todas'
              ? undefined
              : filtro === 'disponiveis'
                ? 'DISPONIVEL'
                : 'INDISPONIVEL',
          numeroPagina: paginaAtual,
          tamanhoPagina: TAMANHO_PAGINA,
        });

        setVagas(resultado.vagas);
        setTotalPaginas(resultado.totalPaginas);
        setTotalElementos(resultado.totalElementos);

        if (
          resultado.vagas.length > 0 &&
          onSelectFirstCoordinate &&
          debouncedSearchQuery !== ''
        ) {
          const primeira = resultado.vagas[0];

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
      } catch (err) {
        console.error('Erro ao carregar vagas:', err);

        setError(err instanceof Error ? err.message : 'Erro desconhecido');

        setVagas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVagas();
  }, [debouncedSearchQuery, paginaAtual, filtro]);

  // ==================== ORDENAÇÃO ====================

  const vagasOrdenadas = [...vagas].sort((a, b) => {
    return a.status === 'DISPONIVEL' && b.status !== 'DISPONIVEL'
      ? -1
      : b.status === 'DISPONIVEL' && a.status !== 'DISPONIVEL'
        ? 1
        : 0;
  });

  // ==================== PAGINAÇÃO ====================

  const podeVoltar = paginaAtual > 0;

  const podeAvancar = paginaAtual + 1 < totalPaginas;

  // ==================== RENDER ====================

  return (
    <div className="flex flex-col h-full">
      {/* ==================== LISTA ==================== */}

      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 mt-4">Carregando vagas...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-4">{error}</p>
        ) : vagasOrdenadas.length > 0 ? (
          vagasOrdenadas.map((vaga) => <VagaItem key={vaga.id} vaga={vaga} />)
        ) : (
          <p className="text-gray-500 text-center mt-4">
            Nenhuma vaga encontrada.
          </p>
        )}
      </div>

      {/* ==================== PAGINAÇÃO ==================== */}

      {!loading && totalPaginas > 1 && (
        <div className="flex items-center justify-between border-t pt-3 mt-2 px-1">
          <button
            type="button"
            onClick={() => setPaginaAtual((p) => Math.max(0, p - 1))}
            disabled={!podeVoltar}
            className="
              px-3 py-1
              text-sm
              rounded-md
              border
              disabled:opacity-40
              disabled:cursor-not-allowed
              hover:bg-gray-100
            "
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {paginaAtual + 1} de {totalPaginas}
            {totalElementos > 0 && ` · ${totalElementos} vagas`}
          </span>

          <button
            type="button"
            onClick={() => setPaginaAtual((p) => p + 1)}
            disabled={!podeAvancar}
            className="
              px-3 py-1
              text-sm
              rounded-md
              border
              disabled:opacity-40
              disabled:cursor-not-allowed
              hover:bg-gray-100
            "
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
