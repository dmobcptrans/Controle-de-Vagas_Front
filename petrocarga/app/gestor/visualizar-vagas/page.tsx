'use client';

import { ViewMap } from '@/components/map/viewMap';
import { useEffect, useState } from 'react';
import { ListaVagas } from '@/components/lista/listaVagas';
import { Search, X } from 'lucide-react';

/**
 * @component Page
 * @version 1.1.0
 *
 * @description Página de visualização de vagas com mapa interativo.
 * Apresenta um layout dividido com mapa à esquerda e lista de vagas à direita.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ESTRUTURA DA PÁGINA:
 *    - Layout responsivo em duas colunas (flex-col no mobile, flex-row no desktop)
 *    - Mapa interativo (ViewMap) na coluna esquerda
 *    - Lista de vagas (ListaVagas) na coluna direita
 *
 * 2. BARRA DE PESQUISA:
 *    - Busca por logradouro, bairro ou referência
 *    - Filtro aplicado via estado (searchQuery)
 *    - Acionado por Enter ou botão de busca
 *
 * 3. INTERAÇÕES:
 *    - selectedPlace: estado compartilhado para destacar uma vaga
 *    - searchQuery: filtro de busca passado para ListaVagas
 *    - Ao selecionar um local no mapa, a lista pode refletir a seleção
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - useState (controle de seleção e busca)
 *   - Interatividade entre mapa e lista
 *
 * - LAYOUT RESPONSIVO:
 *   - Mobile: empilhamento vertical (flex-col)
 *   - Desktop: duas colunas lado a lado (md:flex-row)
 *   - Mapa fixo à esquerda, lista à direita
 *
 * - ESTADO COMPARTILHADO:
 *   - selectedPlace passado para o mapa via props
 *   - searchQuery passado para ListaVagas para filtragem
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ViewMap: Componente de mapa interativo
 * - ListaVagas: Componente de listagem de vagas
 *
 * @example
 * ```tsx
 * <Page />
 * ```
 */

export default function Page() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const [selectedPlace, setSelectedPlace] = useState(null);

  /** Valor atual do input de busca (ainda não confirmado) */
  const [inputValue, setInputValue] = useState('');

  /** Query confirmada — passada para ListaVagas ao pressionar Enter ou clicar em buscar */
  const [searchQuery, setSearchQuery] = useState('');

  const [searchFocused, setSearchFocused] = useState(false);

  const [firstCoord, setFirstCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
 

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  function handleSearch() {
    setSearchQuery(inputValue.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleClear() {
    setInputValue('');
    setSearchQuery('');
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputValue]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ── */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Visualizar Vagas
          </h1>
          <p className="text-xs text-white/50 capitalize">
            gerenciamento de vagas e mapa interativo
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        {/* ── Barra de Pesquisa ── */}
        <div className="-mt-4 mb-5 max-w-4xl mx-auto">
          <div
            className="bg-[#071D41] rounded-2xl border-l-4 border-[#FFCD07] px-5 py-4"
            style={{ boxShadow: '0 4px 16px rgba(7,29,65,0.18)' }}
          >
            <div className="relative">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{
                  background: searchFocused
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(255,255,255,0.10)',
                  border: searchFocused
                    ? '1.5px solid rgba(255,205,7,0.6)'
                    : '1.5px solid rgba(255,255,255,0.12)',
                }}
              >
                <Search
                  className="h-4 w-4 flex-shrink-0 transition-colors"
                  style={{
                    color: searchFocused ? '#FFCD07' : 'rgba(255,255,255,0.45)',
                  }}
                />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Buscar por logradouro, bairro ou referência..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none min-w-0"
                  style={{ caretColor: '#FFCD07' }}
                />
                {inputValue && (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleClear();
                    }}
                    className="flex-shrink-0 rounded-full p-0.5 transition-colors hover:bg-white/20"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                    aria-label="Limpar"
                  >
                    <X className="h-3 w-3 text-white/70" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Layout principal: Mapa (esquerda) + Lista (direita) ── */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Coluna esquerda — Mapa */}
          <div className="flex-1 h-[70vh] min-h-[300px]">
            <ViewMap
              selectedPlace={selectedPlace}
              searchQuery={searchQuery}
              firstCoord={firstCoord}
            />
          </div>

          {/* Coluna direita — Lista de Vagas */}
          <div className="flex-1 flex flex-col bg-white border border-gray-100 h-[70vh] min-h-[300px] p-4 rounded-2xl shadow-md overflow-y-auto">
            <ListaVagas
              searchQuery={searchQuery}
              onSelectFirstCoordinate={(coord) => setFirstCoord(coord)}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
