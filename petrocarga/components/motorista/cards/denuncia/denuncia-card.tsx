'use client';

import { Denuncia } from '@/lib/types/denuncias';
import { DenunciaDetalhes } from './denuncia-detalhes';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, FileText, Tag, ChevronRight } from 'lucide-react';

interface DenunciaCardProps {
  denuncia: Denuncia;
}

/**
 * Mapeamento de estilos por status da denúncia
 * Define cores e rótulos para cada status
 */
const statusStyles: Record<
  string,
  { label: string; class: string; border: string }
> = {
  ABERTA: {
    label: 'Aberta',
    class: 'bg-blue-100 text-blue-700',
    border: 'border-l-blue-500',
  },
  EM_ANALISE: {
    label: 'Em Análise',
    class: 'bg-yellow-100 text-yellow-700',
    border: 'border-l-yellow-500',
  },
  PROCEDENTE: {
    label: 'Procedente',
    class: 'bg-green-100 text-green-700',
    border: 'border-l-green-500',
  },
  IMPROCEDENTE: {
    label: 'Improcedente',
    class: 'bg-red-100 text-red-700',
    border: 'border-l-red-500',
  },
  DEFAULT: {
    label: 'Outro',
    class: 'bg-slate-100 text-slate-700',
    border: 'border-l-slate-400',
  },
};

/**
 * @component DenunciaCard
 * @version 1.0.0
 * 
 * @description Card de exibição de denúncia.
 * Exibe informações resumidas da denúncia e abre modal de detalhes ao clicar.
 * 
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 * 
 * 1. HEADER:
 *    - ID da denúncia (primeiros 5 caracteres)
 *    - Badge de status colorido
 * 
 * 2. INFORMAÇÕES PRINCIPAIS:
 *    - Local: logradouro, número e bairro (com ícone MapPin)
 *    - Tipo: descrição do tipo de denúncia (com ícone Tag)
 *    - Descrição: texto resumido (com ícone FileText)
 * 
 * 3. AÇÃO:
 *    - Botão "Detalhes" com ícone ChevronRight
 *    - Ao clicar no card, abre modal de detalhes (DenunciaDetalhes)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - CORES POR STATUS:
 *   - ABERTA: azul
 *   - EM_ANALISE: amarelo
 *   - PROCEDENTE: verde
 *   - IMPROCEDENTE: vermelho
 *   - DEFAULT: cinza (fallback)
 * 
 * - BORDA ESQUERDA: Cor diferenciada por status (border-l-[cor])
 * 
 * - INTERAÇÃO:
 *   - Card inteiro é clicável (onClick no article)
 *   - Abre modal de detalhes
 * 
 * - ANIMAÇÕES:
 *   - Hover: shadow-md, border-slate-300
 *   - Botão "Detalhes": translate-x-1 no hover do grupo
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - DenunciaDetalhes: Modal com informações completas
 * - Denuncia: Tipo de denúncia
 * 
 * @example
 * ```tsx
 * <DenunciaCard denuncia={denuncia} />
 * ```
 */

export default function DenunciaCard({ denuncia }: DenunciaCardProps) {
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);

  const currentStatus = statusStyles[denuncia.status] || statusStyles.DEFAULT;

  return (
    <>
      <article
        onClick={() => setIsDetalhesModalOpen(true)}
        className={cn(
          'group relative flex flex-col sm:flex-row justify-between items-start sm:items-center',
          'bg-white p-5 rounded-xl border border-slate-200 border-l-4 shadow-sm',
          'hover:shadow-md hover:border-slate-300 transition-all cursor-pointer gap-4 w-full',
          currentStatus.border,
        )}
      >
        <div className="space-y-3 flex-1">
          
          {/* ==================== HEADER ==================== */}
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900">
              Denúncia #{denuncia.id.slice(0, 5).toUpperCase()}
            </h2>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
                currentStatus.class,
              )}
            >
              {currentStatus.label}
            </span>
          </div>

          {/* ==================== INFORMAÇÕES ==================== */}
          <div className="grid grid-cols-1 gap-2">
            
            {/* Localização */}
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
              <span>
                {denuncia.enderecoVaga.logradouro}, {denuncia.numeroEndereco} —{' '}
                {denuncia.enderecoVaga.bairro}
              </span>
            </div>

            {/* Tipo da denúncia */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="capitalize">
                {denuncia.tipo.toLowerCase().replaceAll('_', ' ')}
              </span>
            </div>

            {/* Descrição (resumida) */}
            <div className="flex items-start gap-2 text-sm text-slate-500 italic">
              <FileText className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
              <p className="line-clamp-1 italic">{denuncia.descricao}</p>
            </div>
          </div>
        </div>

        {/* ==================== BOTÃO DE AÇÃO ==================== */}
        <div className="flex items-center self-end sm:self-center">
          <div className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
            Detalhes
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </article>

      {/* Modal de detalhes */}
      <DenunciaDetalhes
        isOpen={isDetalhesModalOpen}
        onClose={() => setIsDetalhesModalOpen(false)}
        denuncia={denuncia}
      />
    </>
  );
}