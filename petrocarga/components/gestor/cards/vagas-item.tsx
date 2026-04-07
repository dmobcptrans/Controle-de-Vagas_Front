import { Vaga } from '@/lib/types/vaga';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { MapPin, Ruler, ScanBarcodeIcon } from 'lucide-react';

type VagaItemProp = {
  vaga: Vaga;
};

/**
 * @component VagaItem
 * @version 1.0.0
 *
 * @description Card de exibição de vaga para listagem.
 * Exibe informações resumidas da vaga com cores diferenciadas por área.
 *
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 *
 * 1. HEADER:
 *    - Logradouro (nome da rua)
 *    - Status (Desktop: badge inline, Mobile: badge separado)
 *
 * 2. INFORMAÇÕES PRINCIPAIS:
 *    - Número da vaga (com ícone MapPin)
 *    - Código PMP (com ícone ScanBarcodeIcon)
 *    - Comprimento em metros (com ícone Ruler)
 *
 * 3. AÇÕES:
 *    - Botão "Ver mais" (link para página de detalhes)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - CORES POR ÁREA: Borda esquerda colorida conforme a área da vaga
 *   - VERMELHA: borda vermelha (border-red-500)
 *   - AMARELA: borda amarela (border-yellow-500)
 *   - AZUL: borda azul (border-blue-500)
 *   - BRANCA: borda cinza (border-gray-500)
 *
 * - CORES POR STATUS:
 *   - DISPONIVEL: badge verde (bg-green-100 text-green-800)
 *   - INDISPONIVEL: badge vermelho (bg-red-100 text-red-800)
 *   - MANUTENCAO: badge amarelo (bg-yellow-100 text-yellow-800)
 *
 * - RESPONSIVIDADE:
 *   - Mobile: coluna (flex-col)
 *   - Desktop: linha (flex-row)
 *   - Status: desktop (inline), mobile (badge separado)
 *
 * - LAYOUT: Flex com sombra, borda arredondada, transição suave
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES DA BORDA POR ÁREA:
 * ----------------------------------------------------------------------------
 *
 * | Área     | Cor da Borda       |
 * |----------|--------------------|
 * | VERMELHA | 🔴 Vermelho        |
 * | AMARELA  | 🟡 Amarelo         |
 * | AZUL     | 🔵 Azul            |
 * | BRANCA   | ⚪ Cinza           |
 *
 * 🎨 CORES DO STATUS:
 * ----------------------------------------------------------------------------
 *
 * | Status        | Cor do Badge      |
 * |---------------|-------------------|
 * | DISPONIVEL    | 🟢 Verde          |
 * | INDISPONIVEL  | 🔴 Vermelho       |
 * | MANUTENCAO    | 🟡 Amarelo        |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - VagaDetalhes: Página de detalhes (link "Ver mais")
 * - buttonVariants: Estilos de botão do shadcn/ui
 *
 * @example
 * ```tsx
 * <VagaItem vaga={vaga} />
 * ```
 */

export default function VagaItem({ vaga }: VagaItemProp) {
  const operacao = vaga.operacoesVaga[0];

  return (
    <article
      className={cn(
        'flex flex-col sm:flex-row justify-between bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 gap-4 w-full',
        vaga.area === 'AMARELA' && 'border-yellow-500',
        vaga.area === 'AZUL' && 'border-blue-500',
        vaga.area === 'VERMELHA' && 'border-red-500',
        vaga.area === 'BRANCA' && 'border-gray-500',
      )}
    >
      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Header: Logradouro + Status (desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {vaga.endereco.logradouro}
          </h3>
          <span
            className={cn(
              'hidden sm:inline-block px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm',
              vaga.status === 'DISPONIVEL' && 'bg-green-100 text-green-800',
              vaga.status === 'INDISPONIVEL' && 'bg-red-100 text-red-800',
              vaga.status === 'MANUTENCAO' && 'bg-yellow-100 text-yellow-800',
            )}
          >
            {vaga.status}
          </span>
        </div>

        {/* Número da vaga */}
        <p className="text-sm sm:text-base text-gray-500 flex items-center gap-1 truncate">
          <MapPin className="w-4 h-4 text-gray-400" />
          {vaga.numeroEndereco}
        </p>

        {/* Informações adicionais (Código PMP + Comprimento) */}
        <div className="flex flex-wrap gap-2 sm:gap-3 text-sm sm:text-gray-600">
          {operacao && (
            <span className="flex items-center gap-1">
              <ScanBarcodeIcon className="w-4 h-4 text-gray-400" />
              {vaga?.endereco?.codigoPmp?.toUpperCase()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler className="w-4 h-4 text-gray-400" />
            {vaga.comprimento} m
          </span>
        </div>
      </div>

      {/* ==================== AÇÕES ==================== */}
      <div className="flex flex-col items-stretch sm:items-end gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
        {/* Status (mobile) */}
        <span
          className={cn(
            'sm:hidden px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-center',
            vaga.status === 'DISPONIVEL' && 'bg-green-100 text-green-800',
            vaga.status === 'INDISPONIVEL' && 'bg-red-100 text-red-800',
            vaga.status === 'MANUTENCAO' && 'bg-yellow-100 text-yellow-800',
          )}
        >
          {vaga.status}
        </span>

        {/* Botão "Ver mais" */}
        <Link
          href={`/gestor/visualizar-vagas/${vaga.id}`}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'text-sm sm:text-base w-full sm:w-auto text-center',
          )}
        >
          Ver mais
        </Link>
      </div>
    </article>
  );
}
