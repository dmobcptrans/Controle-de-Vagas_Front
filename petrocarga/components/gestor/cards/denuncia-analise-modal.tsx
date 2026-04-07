'use client';

import { Denuncia } from '@/lib/types/denuncias';
import { useState, useEffect, useCallback, memo } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Send,
  MapPin,
  User,
  Phone,
  CarFront,
  AlignLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { finalizarAnaliseDenuncia } from '@/lib/api/denunciaApi';
import toast from 'react-hot-toast';

const RESPOSTA_LIMITE = 300;

interface DenunciaAnaliseModalProps {
  isOpen: boolean;
  onClose: () => void;
  denuncia: Denuncia;
  onFinalizado: (status: 'PROCEDENTE' | 'IMPROCEDENTE') => void;
}

/**
 * @component DenunciaAnaliseModal
 * @version 1.0.0
 *
 * @description Modal para análise e finalização de denúncias por gestores.
 * Permite selecionar parecer (procedente/improcedente) e adicionar resposta justificada.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ABERTURA DO MODAL:
 *    - Exibe dados da denúncia (ocorrência, motorista, veículo, localização)
 *    - Seção de dados é expansível/colapsável
 *    - Limpa estados anteriores ao abrir
 *
 * 2. SELEÇÃO DO PARECER:
 *    - PROCEDENTE: ícone verde, fundo verde claro
 *    - IMPROCEDENTE: ícone vermelho, fundo vermelho claro
 *    - Botões com feedback visual e acessibilidade (aria-pressed)
 *
 * 3. RESPOSTA JUSTIFICADA:
 *    - Campo texto obrigatório
 *    - Limite de 300 caracteres
 *    - Contador de caracteres com cor de alerta no limite
 *    - Placeholder informativo
 *
 * 4. FINALIZAÇÃO:
 *    - Valida formulário (parecer + resposta)
 *    - Chama API finalizarAnaliseDenuncia
 *    - Em sucesso: notifica pai e fecha modal
 *    - Em erro: toast de erro
 *
 * 5. ACESSIBILIDADE:
 *    - Fechamento com tecla ESC
 *    - ARIA labels e roles
 *    - foco gerenciado
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - memo: Otimização para evitar re-renders desnecessários
 * - useCallback: Memoização de funções (toggleExpanded, collapseOnFocus, handleSubmit)
 * - EXPANSÃO: Seção de dados colapsável para melhor UX em mobile
 * - VALIDAÇÃO: Botão desabilitado até preenchimento completo
 * - LIMITE DE CARACTERES: 300 para resposta justificada
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES E ESTILOS:
 * ----------------------------------------------------------------------------
 *
 * | Elemento           | Cor                                   |
 * |--------------------|---------------------------------------|
 * | PROCEDENTE         | 🟢 Verde (emerald)                    |
 * | IMPROCEDENTE       | 🔴 Vermelho (rose)                    |
 * | Botão finalizar    | 🔵 Azul (blue-600)                    |
 * | Fundo modal        | ⚪ Cinza claro (slate-50)              |
 * | Cards de dados     | 🟦 Azul/Amarelo/Roxo (ícones)         |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - finalizarAnaliseDenuncia: API de finalização
 * - DenunciaCard: Card que abre este modal
 * - DenunciaLista: Lista de denúncias
 *
 * @example
 * ```tsx
 * <DenunciaAnaliseModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   denuncia={denuncia}
 *   onFinalizado={(status) => {
 *     toast.success(`Denúncia ${status.toLowerCase()}`);
 *     refetch();
 *   }}
 * />
 * ```
 */

function DenunciaAnaliseModalInner({
  isOpen,
  onClose,
  denuncia,
  onFinalizado,
}: DenunciaAnaliseModalProps) {
  const [resultado, setResultado] = useState<
    'PROCEDENTE' | 'IMPROCEDENTE' | ''
  >('');
  const [resposta, setResposta] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormIncompleto = !resultado || !resposta.trim();

  // ==================== RESET AO ABRIR ====================
  useEffect(() => {
    if (isOpen) {
      setResultado('');
      setResposta('');
      setIsExpanded(true);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // ==================== FECHAR COM ESC ====================
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ==================== HANDLERS ====================
  const toggleExpanded = useCallback(() => setIsExpanded((prev) => !prev), []);
  const collapseOnFocus = useCallback(() => setIsExpanded(false), []);

  const handleSubmit = useCallback(async () => {
    if (isFormIncompleto || !resultado) return;

    setIsSubmitting(true);
    try {
      const response = await finalizarAnaliseDenuncia(denuncia.id, {
        status: resultado as 'PROCEDENTE' | 'IMPROCEDENTE',
        resposta,
      });
      if (response?.success) {
        onFinalizado(resultado as 'PROCEDENTE' | 'IMPROCEDENTE');
        onClose();
      }
    } catch {
      toast.error('Erro ao finalizar análise. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    denuncia.id,
    resultado,
    resposta,
    isFormIncompleto,
    onFinalizado,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/70"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div
        className="relative bg-slate-50 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] shadow-xl flex flex-col overflow-hidden"
        role="dialog"
        aria-labelledby="analise-modal-title"
        aria-describedby="analise-modal-desc"
      >
        {/* ==================== HEADER ==================== */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100 shrink-0">
          <div>
            <h2
              id="analise-modal-title"
              className="text-lg font-extrabold text-slate-800"
            >
              Análise Técnica
            </h2>
            <p
              id="analise-modal-desc"
              className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block uppercase"
            >
              Protocolo: {denuncia.id.slice(0, 8)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* ==================== CONTEÚDO ==================== */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Seção: Dados da Ocorrência (expansível) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={toggleExpanded}
              className="w-full flex items-center justify-between px-2 text-slate-500 hover:text-slate-700 transition-colors"
              aria-expanded={isExpanded}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Dados da Ocorrência
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform',
                  !isExpanded && '-rotate-90',
                )}
                aria-hidden
              />
            </button>

            {isExpanded && (
              <div className="space-y-3">
                {/* Card: Localização */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <MapPin className="w-5 h-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Localização
                    </p>
                    <p className="text-sm font-semibold text-slate-700 leading-snug">
                      {denuncia.enderecoVaga.logradouro},{' '}
                      {denuncia.numeroEndereco}
                    </p>
                  </div>
                </div>

                {/* Card: Motorista */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <User className="w-5 h-5" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Motorista
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {denuncia.nomeMotorista}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-slate-500">
                      <Phone className="w-3 h-3" aria-hidden />
                      <span className="text-xs">
                        {denuncia.telefoneMotorista}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card: Veículo */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <CarFront className="w-5 h-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Veículo
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {denuncia.marcaVeiculo} {denuncia.modeloVeiculo}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded shadow-sm tracking-widest">
                      {denuncia.placaVeiculo}
                    </span>
                  </div>
                </div>

                {/* Card: Descrição */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    <AlignLeft className="w-3 h-3" aria-hidden /> Descrição do
                    Relato
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed break-words italic">
                    {denuncia.descricao}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-200 mx-2" />

          {/* ==================== SEÇÃO DE ANÁLISE ==================== */}
          <div className="space-y-6 pb-6">
            {/* Parecer Final */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase ml-2">
                Parecer Final
              </span>
              <div
                className="grid grid-cols-2 gap-3"
                role="group"
                aria-labelledby="parecer-label"
              >
                <span id="parecer-label" className="sr-only">
                  Selecionar parecer
                </span>

                {/* Botão PROCEDENTE */}
                <button
                  type="button"
                  onClick={() => setResultado('PROCEDENTE')}
                  className={cn(
                    'group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95',
                    resultado === 'PROCEDENTE'
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-white bg-white text-slate-400',
                  )}
                  aria-pressed={resultado === 'PROCEDENTE'}
                >
                  <CheckCircle2
                    className={cn(
                      'w-6 h-6',
                      resultado === 'PROCEDENTE'
                        ? 'text-emerald-600'
                        : 'text-slate-300',
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'text-xs font-bold',
                      resultado === 'PROCEDENTE'
                        ? 'text-emerald-700'
                        : 'text-slate-500',
                    )}
                  >
                    Procedente
                  </span>
                </button>

                {/* Botão IMPROCEDENTE */}
                <button
                  type="button"
                  onClick={() => setResultado('IMPROCEDENTE')}
                  className={cn(
                    'group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95',
                    resultado === 'IMPROCEDENTE'
                      ? 'border-rose-500 bg-rose-50 shadow-md'
                      : 'border-white bg-white text-slate-400',
                  )}
                  aria-pressed={resultado === 'IMPROCEDENTE'}
                >
                  <XCircle
                    className={cn(
                      'w-6 h-6',
                      resultado === 'IMPROCEDENTE'
                        ? 'text-rose-600'
                        : 'text-slate-300',
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'text-xs font-bold',
                      resultado === 'IMPROCEDENTE'
                        ? 'text-rose-700'
                        : 'text-slate-500',
                    )}
                  >
                    Improcedente
                  </span>
                </button>
              </div>
            </div>

            {/* Resposta Justificada */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label
                  htmlFor="resposta-analise"
                  className="text-[11px] font-bold text-slate-500 uppercase"
                >
                  Resposta Justificada
                </label>
                <span
                  className={cn(
                    'text-[10px] font-mono px-2 py-0.5 rounded-full',
                    resposta.length >= RESPOSTA_LIMITE
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-slate-200 text-slate-500',
                  )}
                >
                  {resposta.length}/{RESPOSTA_LIMITE}
                </span>
              </div>
              <textarea
                id="resposta-analise"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                onFocus={collapseOnFocus}
                maxLength={RESPOSTA_LIMITE}
                rows={4}
                placeholder="Informe ao cidadão o motivo da decisão..."
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
                aria-invalid={resposta.length >= RESPOSTA_LIMITE}
              />
            </div>
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isFormIncompleto || isSubmitting}
            className={cn(
              'w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-extrabold text-sm transition-all shadow-lg',
              isFormIncompleto || isSubmitting
                ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-200',
            )}
          >
            <Send className="w-4 h-4" aria-hidden />
            {isSubmitting ? 'Finalizando...' : 'Finalizar Análise'}
          </button>
        </div>
      </div>
    </div>
  );
}

export const DenunciaAnaliseModal = memo(DenunciaAnaliseModalInner);
