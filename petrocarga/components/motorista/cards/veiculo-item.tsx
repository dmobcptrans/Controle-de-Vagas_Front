'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';

interface VeiculoCardProps {
  veiculo: Veiculo;
}

/**
 * @component VeiculoCard
 * @version 1.0.0
 * 
 * @description Card de exibição de veículo para motoristas.
 * Exibe informações resumidas do veículo e link para detalhes.
 * 
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 * 
 * 1. HEADER:
 *    - Marca e modelo (ex: "Fiat Uno")
 *    - Tipo do veículo (ex: "AUTOMOVEL") - desktop
 * 
 * 2. INFORMAÇÕES:
 *    - Placa com ícone Truck
 * 
 * 3. AÇÕES:
 *    - Botão "Ver mais" (link para página de detalhes)
 *    - Tipo do veículo (mobile - badge)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - LAYOUT RESPONSIVO:
 *   - Mobile: coluna (flex-col)
 *   - Desktop: linha (flex-row)
 * 
 * - BORDA LATERAL: Azul (border-blue-500) para destaque
 * - BADGE DE TIPO:
 *   - Desktop: inline-block
 *   - Mobile: badge separado com fundo azul
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Veiculo: Tipo de veículo
 * - buttonVariants: Estilos de botão do shadcn/ui
 * - Link: Navegação Next.js
 * 
 * @example
 * ```tsx
 * <VeiculoCard veiculo={veiculo} />
 * ```
 */

export default function VeiculoCard({ veiculo }: VeiculoCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col sm:flex-row justify-between bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 gap-4 w-full',
        'border-blue-500',
      )}
    >
      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        
        {/* Header com marca/modelo e tipo (desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {veiculo.marca} {veiculo.modelo}
          </h3>

          {/* Badge de tipo (desktop) */}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm bg-blue-100 text-blue-800">
            {veiculo.tipo}
          </span>
        </div>

        {/* Informações do veículo */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-gray-400" />
            Placa: {veiculo.placa}
          </span>
        </div>
      </div>

      {/* ==================== AÇÕES ==================== */}
      <div className="flex flex-col items-stretch sm:items-end gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
        
        {/* Badge de tipo (mobile) */}
        <span className="sm:hidden px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-center bg-blue-100 text-blue-800">
          {veiculo.tipo}
        </span>

        {/* Botão "Ver mais" - link para detalhes */}
        <Link
          href={`/motorista/veiculos/meus-veiculos/${veiculo.id}`}
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