'use client';

import { ReactNode, useState } from 'react';

import { Menu, Search, X, MapPin } from 'lucide-react';

import { CTA } from '../CTA';

export interface SuggestionWithCoords {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

interface CTASearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;

  /**
   * Executa a pesquisa.
   */
  onSearch?: () => void | Promise<void>;

  /**
   * Indica que a pesquisa está sendo executada.
   */
  loading?: boolean;

  /**
   * Sugestões exibidas abaixo da barra de pesquisa.
   */
  suggestions?: SuggestionWithCoords[];

  /**
   * Callback executado ao selecionar uma sugestão.
   */
  onSuggestionSelect?: (suggestion: SuggestionWithCoords) => void;

  filters?: ReactNode;

  onClearFilters?: () => void;

  hasActiveFilters?: boolean;

  filterSummary?: ReactNode;
}

export function CTASearch({
  value,
  onChange,
  placeholder = 'Pesquisar...',
  onSearch,
  loading = false,
  suggestions = [],
  onSuggestionSelect,
  filters,
  onClearFilters,
  hasActiveFilters = false,
  filterSummary,
}: CTASearchProps) {
  const [focused, setFocused] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const hasFilters = hasActiveFilters || Boolean(value.trim());

  const hasSuggestions =
    focused && suggestions.length > 0 && Boolean(onSuggestionSelect);

  const handleClear = () => {
    onChange('');
  };

  const handleClearFilters = () => {
    onClearFilters?.();
  };

  const handleSuggestionSelect = (suggestion: SuggestionWithCoords) => {
    onSuggestionSelect?.(suggestion);
  };

  return (
    <CTA className="block overflow-visible p-0" unstyled>
      {/* =========================================================
          BARRA PRINCIPAL
      ========================================================= */}

      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          {/* =====================================================
              BUSCA
          ===================================================== */}

          <div className="relative flex-1">
            <div
              className={`
                flex
                items-center
                gap-2
                rounded-xl
                px-3
                py-2.5
                transition-all
                ${
                  focused
                    ? 'bg-white/15 border border-[#FFCD07]/60'
                    : 'bg-white/10 border border-white/10'
                }
              `}
            >
              <Search
                className={`
                  h-4
                  w-4
                  flex-shrink-0
                  transition-colors
                  ${focused ? 'text-[#FFCD07]' : 'text-white/45'}
                `}
              />

              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setTimeout(() => setFocused(false), 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    onSearch?.();
                  }
                }}
                placeholder={placeholder}
                disabled={loading}
                className="
    flex-1
    min-w-0
    bg-transparent
    text-sm
    text-white
    placeholder:text-white/35
    outline-none
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
              />

              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Limpar pesquisa"
                  className="
                    flex
                    h-7
                    w-7
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    hover:bg-white/10
                  "
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              )}
            </div>

            {/* ===================================================
                SUGESTÕES
            =================================================== */}

            {hasSuggestions && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-full
                  z-50
                  mt-2
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/10
                  bg-[#071D41]
                  shadow-xl
                "
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSuggestionSelect(suggestion);
                      setFocused(false);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-left
                      transition-colors
                      hover:bg-white/10
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        flex-shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-white/10
                      "
                    >
                      <MapPin
                        className="
                          h-4
                          w-4
                          text-[#FFCD07]
                        "
                      />
                    </div>

                    <span className="min-w-0 text-sm text-white">
                      {suggestion.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =====================================================
              MENU DE FILTROS
          ===================================================== */}

          {filters && (
            <button
              type="button"
              onClick={() => setFiltrosAbertos((prev) => !prev)}
              aria-label={filtrosAbertos ? 'Fechar filtros' : 'Abrir filtros'}
              className={`
                relative
                h-11
                w-11
                flex
                items-center
                justify-center
                rounded-xl
                transition-all
                duration-300
                ${
                  filtrosAbertos
                    ? 'bg-[#FFCD07]/18 border border-[#FFCD07]/50'
                    : 'bg-white/10 border border-white/10'
                }
              `}
            >
              <Menu
                className={`
                  h-5
                  w-5
                  text-white
                  transition-transform
                  duration-300
                  ${filtrosAbertos ? 'rotate-90' : ''}
                `}
              />

              {hasFilters && (
                <span
                  className="
                    absolute
                    top-2
                    right-2
                    h-2
                    w-2
                    rounded-full
                    bg-[#FFCD07]
                  "
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          DRAWER DE FILTROS
      ========================================================= */}

      {filters && (
        <div
          className={`
            overflow-hidden
            transition-all
            duration-300
            ease-in-out
            ${
              filtrosAbertos ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }
          `}
        >
          <div
            className="
              border-t
              border-white/10
              px-5
              py-5
              space-y-5
            "
          >
            {filters}

            {hasFilters && onClearFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-[#071D41]
                  transition-colors
                  hover:bg-gray-100
                "
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </button>
            )}

            {filterSummary && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-white/10
                  pt-4
                "
              >
                {filterSummary}
              </div>
            )}
          </div>
        </div>
      )}
    </CTA>
  );
}
