'use client';

import { useEffect, useState } from 'react';
import VagaItem from '@/components/gestor/cards/vagas-item';
import { Vaga } from '@/lib/types/vaga';
import * as vagaActions from '@/lib/api/vagaApi';

/**
 * @function useDebounce
 * @description Hook customizado para debounce de valores de input.
 * Atrasa a atualização do valor para reduzir chamadas desnecessárias.
 * 
 * @param value - Valor a ser debounced
 * @param delay - Tempo de atraso em milissegundos (padrão: 300ms)
 * @returns Valor debounced
 */
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
/**
 * @component ListaVagas
 * @version 1.0.0
 * 
 * @description Componente de listagem de vagas com filtro e ordenação.
 * Exibe vagas com busca em tempo real e ordenação por disponibilidade.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. BUSCA/FILTRO:
 *    - Campo de texto para filtrar vagas
 *    - Filtra por: área, logradouro, bairro, referência de endereço
 *    - Debounce de 300ms para evitar chamadas excessivas
 * 
 * 2. ORDENAÇÃO:
 *    - Botão toggle para ordenar por disponibilidade
 *    - ChevronUp: disponíveis primeiro
 *    - ChevronDown: disponíveis por último
 * 
 * 3. CARREGAMENTO:
 *    - Estado de loading durante busca inicial
 *    - Tratamento de erro com mensagem
 *    - Lista vazia com mensagem amigável
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - DEBOUNCE: Reduz chamadas de re-render durante digitação
 * - FILTRO EM MEMÓRIA: Filtra os dados já carregados (não faz requisição extra)
 * - ORDENAÇÃO CUSTOMIZADA: Prioriza status 'DISPONIVEL' conforme toggle
 * - LAYOUT: Lista com scroll (overflow-y-auto) e altura flexível
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - VagaItem: Card individual de vaga
 * - getVagas: API de listagem de vagas
 * 
 * @example
 * ```tsx
 * <ListaVagas />
 * ```
 */

export function ListaVagas({ searchQuery, onSelectFirstCoordinate }: ListaVagasProps) {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [disponiveisPrimeiro, setDisponiveisPrimeiro] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtroDebounced = useDebounce(filtro, 300);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ==================== CARREGAMENTO INICIAL ====================
useEffect(() => {
  const fetchVagas = async () => {
    setLoading(true);
    try {
      const data: Vaga[] = await vagaActions.getVagasFiltradas({
        logradouro: debouncedSearchQuery,
      });

      setVagas(data);

     if (
  data.length > 0 &&
  onSelectFirstCoordinate &&
  debouncedSearchQuery !== ''
) {
  const primeira = data[0];

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
}, [debouncedSearchQuery]);

  // ==================== FILTRO ====================
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
      // Disponíveis primeiro
      return a.status === 'DISPONIVEL' && b.status !== 'DISPONIVEL'
        ? -1
        : b.status === 'DISPONIVEL' && a.status !== 'DISPONIVEL'
        ? 1
        : 0;
    } else {
      // Disponíveis por último
      return a.status !== 'DISPONIVEL' && b.status === 'DISPONIVEL'
        ? -1
        : b.status !== 'DISPONIVEL' && a.status === 'DISPONIVEL'
        ? 1
        : 0;
    }
  });

  return (
    <div className="flex flex-col h-full">
      
      {/* ==================== LISTA SCROLLÁVEL ==================== */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        
        {/* Estado: Carregando */}
        {loading ? (
          <p className="text-center text-gray-500 mt-4">Carregando vagas...</p>
        ) : vagasOrdenadas.length > 0 ? (
          /* Estado: Com dados */
          vagasOrdenadas.map((vaga) => <VagaItem key={vaga.id} vaga={vaga} />)
        ) : (
          /* Estado: Sem dados */
          <p className="text-gray-500 text-center mt-4">
            Nenhuma vaga encontrada.
          </p>
        )}
      </div>
    </div>
  );
}