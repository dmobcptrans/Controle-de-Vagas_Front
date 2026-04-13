'use client';

import { Denuncia } from '@/lib/types/denuncias';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, FileText, Tag, Clock } from 'lucide-react';
import { DenunciaAnaliseModal } from './denuncia-analise-modal';
import { iniciarAnaliseDenuncia } from '@/lib/api/denunciaApi';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Mapeamento de estilos por status da denúncia
 * Define cores, rótulos e bordas para cada status
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

interface DenunciaCardProps {
  denuncia: Denuncia;
  /** Chamado quando a análise é finalizada, para o parent refazer o fetch */
  onRefresh?: () => void;
}

/**
 * @component DenunciaCard
 * @version 1.0.0
 *
 * @description Card de exibição de denúncia com ações de análise para gestores.
 * Permite iniciar análise, continuar análise e finalizar com parecer.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. VISUALIZAÇÃO:
 *    - Exibe ID, status, localização, tipo, data e descrição
 *    - Cores diferenciadas por status
 *    - Borda esquerda colorida conforme status
 *
 * 2. AÇÕES POR STATUS:
 *    - ABERTA: Botão "Iniciar Análise" → abre modal de confirmação
 *    - EM_ANALISE: Botão "Continuar Análise" → abre modal de análise
 *    - PROCEDENTE/IMPROCEDENTE: Nenhum botão (análise concluída)
 *
 * 3. INÍCIO DA ANÁLISE:
 *    - Modal de confirmação (Dialog)
 *    - Chama API iniciarAnaliseDenuncia
 *    - Atualiza status para EM_ANALISE
 *    - Abre modal de análise automaticamente
 *
 * 4. ANÁLISE:
 *    - Abre DenunciaAnaliseModal
 *    - Gestor seleciona parecer (procedente/improcedente)
 *    - Adiciona resposta justificada
 *    - Finaliza análise e atualiza status
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - STATUS LOCAL: useState mantém status atualizado sem recarregar lista
 * - MEMO: denunciaParaModal evita recriação desnecessária
 * - useCallback: Memoização de funções para performance
 * - CONFIRMAÇÃO: Dialog para evitar ações acidentais
 * - FLUXO CONTÍNUO: Após iniciar análise, modal de análise abre automaticamente
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES POR STATUS:
 * ----------------------------------------------------------------------------
 *
 * | Status        | Label          | Cor da Badge | Borda Esquerda |
 * |---------------|----------------|--------------|----------------|
 * | ABERTA        | Aberta         | 🔵 Azul      | 🔵 Azul        |
 * | EM_ANALISE    | Em Análise     | 🟡 Amarelo   | 🟡 Amarelo     |
 * | PROCEDENTE    | Procedente     | 🟢 Verde     | 🟢 Verde       |
 * | IMPROCEDENTE  | Improcedente   | 🔴 Vermelho  | 🔴 Vermelho    |
 * | DEFAULT       | Outro          | ⚪ Cinza     | ⚪ Cinza       |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - DenunciaAnaliseModal: Modal de análise com parecer
 * - iniciarAnaliseDenuncia: API para iniciar análise
 * - Dialog: Modal de confirmação do shadcn/ui
 *
 * @example
 * ```tsx
 * <DenunciaCard
 *   denuncia={denuncia}
 *   onRefresh={() => fetchDenuncias()}
 * />
 * ```
 */

export default function DenunciaCard({
  denuncia,
  onRefresh,
}: DenunciaCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingInicio, setLoadingInicio] = useState(false);
  const [statusAtual, setStatusAtual] = useState(denuncia.status);

  const currentStatus = statusStyles[statusAtual] ?? statusStyles.DEFAULT;
  const podeAnalisar = statusAtual === 'ABERTA' || statusAtual === 'EM_ANALISE';

  // ==================== HANDLER DE INÍCIO ====================
  const iniciarAnalise = useCallback(() => {
    if (statusAtual === 'ABERTA') setConfirmOpen(true);
    if (statusAtual === 'EM_ANALISE') setModalOpen(true);
  }, [statusAtual]);

  // ==================== CONFIRMAR INÍCIO DA ANÁLISE ====================
  const confirmarInicio = useCallback(async () => {
    setLoadingInicio(true);
    try {
      await iniciarAnaliseDenuncia(denuncia.id);
      setConfirmOpen(false);
      setStatusAtual('EM_ANALISE');
      setModalOpen(true);
    } catch {
      toast.error('Erro ao iniciar análise. Tente novamente.');
    } finally {
      setLoadingInicio(false);
    }
  }, [denuncia.id]);

  // ==================== HANDLER DE FINALIZAÇÃO ====================
  const handleFinalizado = useCallback(
    (novoStatus: 'PROCEDENTE' | 'IMPROCEDENTE') => {
      setStatusAtual(novoStatus);
      setModalOpen(false);
      onRefresh?.();
    },
    [onRefresh],
  );

  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  // ==================== DENÚNCIA ATUALIZADA PARA O MODAL ====================
  const denunciaParaModal = useMemo(
    () => ({ ...denuncia, status: statusAtual }),
    [denuncia, statusAtual],
  );

  return (
    <>
      <article
        className={cn(
          'flex flex-col sm:flex-row justify-between items-start sm:items-center',
          'bg-white p-5 rounded-xl border border-slate-200 border-l-4 shadow-sm',
          'hover:shadow-md hover:border-slate-300 transition-all gap-4 w-full',
          currentStatus.border,
        )}
      >
        {/* ==================== CONTEÚDO DO CARD ==================== */}
        <div className="space-y-3 flex-1">
          {/* Header: ID + Status Badge */}
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

          {/* Informações da denúncia */}
          <div className="grid grid-cols-1 gap-2">
            {/* Localização */}
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin
                className="w-4 h-4 mt-0.5 text-slate-400 shrink-0"
                aria-hidden
              />
              <span>
                {denuncia.enderecoVaga.logradouro}, {denuncia.numeroEndereco} —{' '}
                {denuncia.enderecoVaga.bairro}
              </span>
            </div>

            {/* Tipo */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
              <span className="capitalize">
                {denuncia.tipo.toLowerCase().replaceAll('_', ' ')}
              </span>
            </div>

            {/* Data de criação */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
              <span>
                {new Date(denuncia.criadoEm).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Descrição */}
            <div className="flex items-start gap-2 text-sm text-slate-500 italic">
              <FileText
                className="w-4 h-4 mt-0.5 text-slate-400 shrink-0"
                aria-hidden
              />
              <p className="line-clamp-2 italic">{denuncia.descricao}</p>
            </div>
          </div>
        </div>

        {/* ==================== BOTÃO DE AÇÃO ==================== */}
        {podeAnalisar && (
          <div className="flex self-end sm:self-center">
            <Button
              onClick={iniciarAnalise}
              disabled={loadingInicio}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {statusAtual === 'ABERTA'
                ? loadingInicio
                  ? 'Iniciando...'
                  : 'Iniciar Análise'
                : 'Continuar Análise'}
            </Button>
          </div>
        )}
      </article>

      {/* ==================== MODAL DE CONFIRMAÇÃO (INÍCIO DA ANÁLISE) ==================== */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Início</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja iniciar esta denúncia? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarInicio} disabled={loadingInicio}>
              {loadingInicio ? 'Iniciando...' : 'Iniciar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL DE ANÁLISE ==================== */}
      <DenunciaAnaliseModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        denuncia={denunciaParaModal}
        onFinalizado={handleFinalizado}
      />
    </>
  );
}
