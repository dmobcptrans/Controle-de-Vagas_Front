'use client';

import { Denuncia } from '@/lib/types/denuncias';
import { cn } from '@/lib/utils';
import { X, MapPin, Calendar, FileText, MessageSquare } from 'lucide-react';
import { ComponentType } from 'react';

interface DenunciaDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  denuncia: Denuncia;
}

/**
 * @component DenunciaDetalhes
 * @version 1.0.0
 * 
 * @description Modal de detalhes de denúncia.
 * Exibe informações completas da denúncia com visualização em etapas (stepper).
 * 
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 * 
 * 1. STEPPER (Barra de Progresso):
 *    - Etapas: ABERTA → EM_ANALISE → VERIFICADA/PROCEDENTE/IMPROCEDENTE
 *    - Barra de progresso animada
 *    - Círculos numerados (1, 2, 3) com cores ativas/inativas
 * 
 * 2. OCORRÊNCIA:
 *    - Tipo da denúncia (formatado)
 *    - Descrição completa
 * 
 * 3. LOCALIZAÇÃO:
 *    - Logradouro e número
 *    - Bairro
 * 
 * 4. HISTÓRICO:
 *    - Data de criação
 *    - Data de atualização (se houver)
 *    - Data de encerramento (se houver)
 * 
 * 5. RESPOSTA (opcional):
 *    - Texto de resposta da análise
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - STEPPER DINÂMICO:
 *   - statusIndex determina etapa atual (0, 1, 2)
 *   - finalLabel adapta conforme status (PROCEDENTE/IMPROCEDENTE/VERIFICADA)
 *   - Barra de progresso com width calculada: (statusIndex / 2) * 100%
 * 
 * - FORMATAÇÃO DE DATAS:
 *   - toLocaleString('pt-BR') para exibição localizada
 * 
 * - COMPONENTES INTERNOS:
 *   - SectionTitle: título com ícone
 *   - DateItem: par label/valor para datas
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Denuncia: Tipo de denúncia
 * - DenunciaCard: Card que abre este modal
 * 
 * @example
 * ```tsx
 * <DenunciaDetalhes
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   denuncia={denuncia}
 * />
 * ```
 */

export function DenunciaDetalhes({
  denuncia,
  isOpen,
  onClose,
}: DenunciaDetalhesProps) {
  if (!isOpen) return null;

  // Etapas do fluxo de análise
  const statusSteps = ['ABERTA', 'EM_ANALISE', 'VERIFICADA'];

  // Índice da etapa atual (0, 1, 2)
  const statusIndex =
    denuncia.status === 'ABERTA' ? 0 : denuncia.status === 'EM_ANALISE' ? 1 : 2;

  // Rótulo final baseado no status (PROCEDENTE/IMPROCEDENTE/VERIFICADA)
  const finalLabel =
    denuncia.status === 'PROCEDENTE'
      ? 'PROCEDENTE'
      : denuncia.status === 'IMPROCEDENTE'
        ? 'IMPROCEDENTE'
        : 'VERIFICADA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            Detalhes da Denúncia
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* ==================== STEPPER (BARRA DE PROGRESSO) ==================== */}
        <div className="px-8 pt-6 shrink-0">
          <div className="relative flex items-center justify-between">
            {/* Linha de fundo (cinza) */}
            <div className="absolute left-0 right-0 top-5 h-[2px] bg-slate-200" />

            {/* Barra de progresso azul (animada) */}
            <div
              className="absolute left-0 top-5 h-[2px] bg-blue-600 transition-all duration-500"
              style={{
                width: `${(statusIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />

            {/* Círculos de etapa */}
            {statusSteps.map((step, index) => {
              const isActive = index <= statusIndex;

              return (
                <div
                  key={step}
                  className="relative flex flex-col items-center gap-2 w-full"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500',
                    )}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold text-center',
                      isActive ? 'text-blue-600' : 'text-slate-400',
                    )}
                  >
                    {step === 'VERIFICADA'
                      ? finalLabel
                      : step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== CONTEÚDO (SCROLLÁVEL) ==================== */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          
          {/* Seção: Ocorrência */}
          <div className="space-y-2">
            <SectionTitle icon={FileText} title="Ocorrência" />
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="text-sm font-semibold text-slate-700 capitalize mb-2">
                {denuncia.tipo.replaceAll('_', ' ').toLowerCase()}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed break-words">
                {denuncia.descricao}
              </p>
            </div>
          </div>

          {/* Seção: Localização */}
          <div className="space-y-2">
            <SectionTitle icon={MapPin} title="Localização" />
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="text-sm font-medium text-slate-700">
                {denuncia.enderecoVaga.logradouro}, {denuncia.numeroEndereco}
              </p>
              <p className="text-sm text-slate-500">
                {denuncia.enderecoVaga.bairro}
              </p>
            </div>
          </div>

          {/* Seção: Histórico */}
          <div className="space-y-2">
            <SectionTitle icon={Calendar} title="Histórico" />
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <DateItem label="Criado em" value={denuncia.criadoEm} />
              {denuncia.atualizadoEm && (
                <DateItem label="Atualizado em" value={denuncia.atualizadoEm} />
              )}
              {denuncia.encerradoEm && (
                <DateItem label="Encerrado em" value={denuncia.encerradoEm} />
              )}
            </div>
          </div>

          {/* Seção: Resposta (opcional) */}
          {denuncia.resposta && (
            <div className="space-y-2">
              <SectionTitle icon={MessageSquare} title="Resposta" />
              <div className="bg-slate-50 rounded-xl p-4 border">
                <p className="text-sm text-slate-700 leading-relaxed break-words">
                  {denuncia.resposta}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================== SUBCOMPONENTES ==================== */

/**
 * @component SectionTitle
 * @description Título de seção com ícone
 */
function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
      <Icon className="w-4 h-4 text-blue-600" />
      {title}
    </div>
  );
}

/**
 * @component DateItem
 * @description Item de data com label e valor formatado
 */
function DateItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <span className="text-sm text-slate-700">
        {new Date(value).toLocaleString('pt-BR')}
      </span>
    </div>
  );
}