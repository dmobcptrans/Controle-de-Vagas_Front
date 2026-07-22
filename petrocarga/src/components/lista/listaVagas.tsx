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

type ListaVagasProps = {
  searchQuery: string;
  onSelectFirstCoordinate?: (coord: { lat: number; lng: number }) => void;
};

const TAMANHO_PAGINA = 10;

export function ListaVagas({ searchQuery, onSelectFirstCoordinate }: ListaVagasProps) {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [disponiveisPrimeiro, setDisponiveisPrimeiro] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== PAGINAÇÃO ====================
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const filtroDebounced = useDebounce(filtro, 300);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Reseta para a primeira página sempre que a busca mudar
  useEffect(() => {
    setPaginaAtual(0);
  }, [debouncedSearchQuery]);

  // ==================== CARREGAMENTO ====================
  useEffect(() => {
    const fetchVagas = async () => {
      setLoading(true);
      try {
        const resultado = await vagaActions.getVagasFiltradas({
          logradouro: debouncedSearchQuery,
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
  }, [debouncedSearchQuery, paginaAtual]);

  // ==================== FILTRO (em memória, na página atual) ====================
  const vagasFiltradas = vagas.filter((vaga) => {
    const filtroLower = filtroDebounced.toLowerCase();
    return (
      vaga.area?.toLowerCase().includes(filtroLower) ||
      vaga.referenciaEndereco?.toLowerCase().includes(filtroLower) ||
      vaga.endereco?.logradouro?.toLowerCase().includes(filtroLower) ||
      vaga.endereco?.bairro?.toLowerCase().includes(filtroLower)
    );
  });

  // ==================== ORDENAÇÃO ====================
  const vagasOrdenadas = [...vagasFiltradas].sort((a, b) => {
    if (disponiveisPrimeiro) {
      return a.status === 'DISPONIVEL' && b.status !== 'DISPONIVEL'
        ? -1
        : b.status === 'DISPONIVEL' && a.status !== 'DISPONIVEL'
        ? 1
        : 0;
    } else {
      return a.status !== 'DISPONIVEL' && b.status === 'DISPONIVEL'
        ? -1
        : b.status !== 'DISPONIVEL' && a.status === 'DISPONIVEL'
        ? 1
        : 0;
    }
  });

  const podeVoltar = paginaAtual > 0;
  const podeAvancar = paginaAtual + 1 < totalPaginas;

  return (
    <div className="flex flex-col">
      {/* ==================== LISTA SCROLLÁVEL ==================== */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {loading ? (
          <p className="text-center text-gray-500 mt-4">Carregando vagas...</p>
        ) : vagasOrdenadas.length > 0 ? (
          vagasOrdenadas.map((vaga) => <VagaItem key={vaga.id} vaga={vaga} />)
        ) : (
          <p className="text-gray-500 text-center mt-4">
            Nenhuma vaga encontrada.
          </p>
        )}
      </div>

      {/* ==================== CONTROLES DE PAGINAÇÃO ==================== */}
      {!loading && totalPaginas > 1 && (
        <div className="flex items-center justify-between border-t pt-3 mt-2 px-1">
          <button
            onClick={() => setPaginaAtual((p) => Math.max(0, p - 1))}
            disabled={!podeVoltar}
            className="px-3 py-1 text-sm rounded-md border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {paginaAtual + 1} de {totalPaginas}
            {totalElementos > 0 && ` · ${totalElementos} vagas`}
          </span>

          <button
            onClick={() => setPaginaAtual((p) => p + 1)}
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