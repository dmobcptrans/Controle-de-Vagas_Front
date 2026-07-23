// components/ui/paginacao.tsx
'use client';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { cn } from "@/lib/utils";

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
  onPageChange,
  className = '',
}: PaginacaoProps) {
  if (totalItens === 0) return null;

  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  const irParaPagina = (pagina: number) => {
    onPageChange(Math.max(1, Math.min(pagina, totalPaginas)));
  };


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
    className={cn(
      "flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3",
      className
    )}
  >
    <span className="text-sm text-gray-500">
      {inicio}-{fim} de{" "}
      <span className="font-medium text-gray-800">{totalItens}</span>
    </span>

    <div className="flex items-center gap-2">
      <button
        onClick={irParaPaginaAnterior}
        disabled={paginaAtual === 1}
        className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="min-w-[56px] text-center text-sm font-medium text-gray-700">
        {paginaAtual} / {totalPaginas}
      </span>

      <button
        onClick={irParaProximaPagina}
        disabled={paginaAtual === totalPaginas}
        className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </div>
);
}
