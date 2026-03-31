// components/ui/paginacao.tsx
'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginacaoProps {
  /**
   * Página atual (1-indexed)
   */
  paginaAtual: number;

  /**
   * Total de páginas
   */
  totalPaginas: number;

  /**
   * Total de itens filtrados
   */
  totalItens: number;

  /**
   * Itens por página
   */
  itensPorPagina: number;

  /**
   * Label para o item (ex: "agente", "motorista")
   * @default "item"
   */
  itemLabel?: string;

  /**
   * Label para o plural do item
   * @default "itens"
   */
  itemLabelPlural?: string;

  /**
   * Função chamada ao mudar de página
   */
  onPageChange: (pagina: number) => void;

  /**
   * Classes CSS adicionais para o container
   */
  className?: string;
}

/**
 * @component Paginacao
 * @description Componente reutilizável de paginação com controles completos
 *
 * @example
 * ```tsx
 * <Paginacao
 *   paginaAtual={paginaAtual}
 *   totalPaginas={totalPaginas}
 *   totalItens={itensFiltrados.length}
 *   itensPorPagina={ITENS_POR_PAGINA}
 *   itemLabel="agente"
 *   itemLabelPlural="agentes"
 *   onPageChange={setPaginaAtual}
 * />
 * ```
 */
export function Paginacao({
  paginaAtual,
  totalPaginas,
  totalItens,
  itensPorPagina,
  itemLabel = 'item',
  itemLabelPlural = 'itens',
  onPageChange,
  className = '',
}: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  const irParaPagina = (pagina: number) => {
    onPageChange(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  const irParaPrimeiraPagina = () => irParaPagina(1);
  const irParaUltimaPagina = () => irParaPagina(totalPaginas);
  const irParaPaginaAnterior = () => irParaPagina(paginaAtual - 1);
  const irParaProximaPagina = () => irParaPagina(paginaAtual + 1);

  // Determina quais números de página mostrar
  const getPaginasVisiveis = () => {
    const paginas = [];

    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 ||
        i === totalPaginas ||
        (i >= paginaAtual - 1 && i <= paginaAtual + 1)
      ) {
        paginas.push(i);
      } else if (
        (i === paginaAtual - 2 && paginaAtual - 2 > 1) ||
        (i === paginaAtual + 2 && paginaAtual + 2 < totalPaginas)
      ) {
        paginas.push(null); // Representa as reticências
      }
    }

    // Remove duplicatas de reticências consecutivas
    return paginas.filter((pagina, index, arr) => {
      if (pagina === null && arr[index - 1] === null) return false;
      return true;
    });
  };

  const paginasVisiveis = getPaginasVisiveis();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 ${className}`}
    >
      {/* Informação de itens visíveis */}
      <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
        Mostrando{' '}
        <span className="font-medium text-blue-600">
          {inicio} - {fim}
        </span>{' '}
        de <span className="font-medium">{totalItens}</span>{' '}
        {totalItens === 1 ? itemLabel : itemLabelPlural}
      </div>

      {/* Controles de página */}
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
        <button
          onClick={irParaPrimeiraPagina}
          disabled={paginaAtual === 1}
          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Primeira página"
        >
          <ChevronsLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Primeira</span>
        </button>

        <button
          onClick={irParaPaginaAnterior}
          disabled={paginaAtual === 1}
          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números das páginas (escondido em mobile) */}
        <div className="hidden sm:flex items-center gap-1">
          {paginasVisiveis.map((paginaNumero, index) => {
            if (paginaNumero === null) {
              return (
                <span key={`ellipsis-${index}`} className="px-1 text-gray-400">
                  ...
                </span>
              );
            }

            return (
              <button
                key={paginaNumero}
                onClick={() => irParaPagina(paginaNumero)}
                className={`min-w-7 h-7 sm:min-w-8 sm:h-8 flex items-center justify-center px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  paginaAtual === paginaNumero
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={`Ir para página ${paginaNumero}`}
                aria-current={paginaAtual === paginaNumero ? 'page' : undefined}
              >
                {paginaNumero}
              </button>
            );
          })}
        </div>

        {/* Seletor de página dropdown (visível em todos os tamanhos) */}
        <span className="text-xs sm:text-sm text-gray-700 px-1 sm:px-2">
          Página{' '}
          <select
            value={paginaAtual}
            onChange={(e) => irParaPagina(Number(e.target.value))}
            className="ml-1 px-1.5 sm:px-2 py-1 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm cursor-pointer"
            aria-label="Selecionar página"
          >
            {[...Array(totalPaginas)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>{' '}
          de {totalPaginas}
        </span>

        <button
          onClick={irParaProximaPagina}
          disabled={paginaAtual === totalPaginas}
          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        <button
          onClick={irParaUltimaPagina}
          disabled={paginaAtual === totalPaginas}
          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Última página"
        >
          <span className="hidden sm:inline">Última</span>
          <ChevronsRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
}
