'use client';

import { cn } from '@/lib/utils';
import { Award, Truck } from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';

interface VeiculoCardProps {
  veiculo: Veiculo;
}

/**
 * @component VeiculoCard
 * @version 1.0.0
 *
 * @description Card de exibição de veículo para gestores.
 * Exibe informações resumidas do veículo em formato compacto.
 *
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 *
 * 1. HEADER:
 *    - Modelo do veículo (título)
 *    - Tipo do veículo (desktop: badge azul)
 *
 * 2. INFORMAÇÕES:
 *    - Placa (com ícone Truck)
 *    - Marca (com ícone Award)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - BORDA LATERAL: Azul (border-blue-500) para destaque
 * - LAYOUT: Flex responsivo (coluna mobile, linha desktop)
 * - BADGE DE TIPO:
 *   - Desktop: inline-block com fundo azul
 *   - Mobile: não exibido (apenas no card de detalhes)
 * - ÍCONES: Truck (placa), Award (marca)
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES:
 * ----------------------------------------------------------------------------
 *
 * | Elemento          | Cor                                   |
 * |-------------------|---------------------------------------|
 * | Borda lateral     | 🔵 Azul (border-blue-500)             |
 * | Badge tipo        | 🔵 Azul (bg-blue-100 text-blue-800)   |
 * | Ícones            | ⚪ Cinza (text-gray-400)              |
 * | Título            | ⚫ Cinza escuro (text-gray-800)       |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Veiculo: Tipo de veículo
 * - /gestor/motoristas/veiculos/:id: Página de veículos do motorista
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
        {/* Header: Modelo + Tipo (desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {veiculo.modelo}
          </h3>

          {/* Badge de tipo (apenas desktop) */}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm bg-blue-100 text-blue-800">
            {veiculo.tipo}
          </span>
        </div>

        {/* Informações do veículo */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
          {/* Placa */}
          <span className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-gray-400" />
            {veiculo.placa}
          </span>

          {/* Marca */}
          <span className="flex items-center gap-1">
            <Award className="w-4 h-4 text-gray-400" />
            {veiculo.marca}
          </span>
        </div>
      </div>
    </article>
  );
}
