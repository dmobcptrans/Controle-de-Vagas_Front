'use client';

import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ModalConfirmacaoEnvioProps {
  isOpen: boolean;
  onClose: () => void;
  mensagem: string;
  status: 'success' | 'error' | null;
}

/**
 * @component ModalConfirmacaoEnvio
 * @version 1.0.0
 * 
 * @description Modal de confirmação exibido após solicitação de recuperação de senha.
 * Informa o usuário sobre o status do envio do código de recuperação.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {boolean} isOpen - Controla a visibilidade do modal
 * @property {() => void} onClose - Função para fechar o modal
 * @property {string} mensagem - Mensagem descritiva a ser exibida
 * @property {'success' | 'error' | null} status - Status da operação
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. BLOQUEIO DE SCROLL:
 *    - Impede rolagem da página enquanto modal está aberto
 *    - Restaura rolagem ao fechar
 * 
 * 2. FECHAR COM ESC:
 *    - Pressionar ESC fecha o modal
 *    - Cleanup no useEffect
 * 
 * 3. FEEDBACK VISUAL:
 *    - Status success: ícone verde (CheckCircle2), fundo verde claro
 *    - Status error: ícone vermelho (AlertCircle), fundo vermelho claro
 * 
 * 4. REDIRECIONAMENTO:
 *    - Botão "Voltar para o login" fecha o modal
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - BACKDROP: Fundo escuro com blur (bg-black/30 backdrop-blur-sm)
 * - ANIMAÇÃO: animate-fadeIn (Tailwind)
 * - CORES DINÂMICAS: Baseadas no status (success/error)
 * - ÍCONES: CheckCircle2 para sucesso, AlertCircle para erro
 * - BLOQUEIO DE SCROLL: document.body.style.overflow = 'hidden'
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - CheckCircle2: Ícone de sucesso do Lucide
 * - AlertCircle: Ícone de alerta/erro do Lucide
 * 
 * @example
 * ```tsx
 * // Modal de sucesso
 * <ModalConfirmacaoEnvio
 *   isOpen={mostrarModal}
 *   onClose={fecharModal}
 *   mensagem="Se este email/CPF estiver cadastrado, você receberá um código"
 *   status="success"
 * />
 * 
 * // Modal de erro
 * <ModalConfirmacaoEnvio
 *   isOpen={mostrarModal}
 *   onClose={fecharModal}
 *   mensagem="Erro ao solicitar recuperação. Tente novamente."
 *   status="error"
 * />
 * ```
 */

export default function ModalConfirmacaoEnvio({
  isOpen,
  onClose,
  mensagem,
  status,
}: ModalConfirmacaoEnvioProps) {
  // ==================== BLOQUEIO DE SCROLL ====================
  /**
   * @effect Bloqueia/desbloqueia scroll da página
   * Executa quando isOpen muda
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // ==================== FECHAR COM ESC ====================
  /**
   * @effect Fecha modal ao pressionar tecla ESC
   * Adiciona listener e faz cleanup na desmontagem
   */
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm sm:backdrop-blur-lg flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-5 sm:p-6 md:p-8 max-w-sm sm:max-w-md w-full mx-3 animate-fadeIn">
        
        {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
        <div className="text-center">
          
          {/* Ícone de sucesso (fixo - sempre verde) */}
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600" />
          </div>
          
          {/* Título */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            Solicitação recebida
          </h2>

          {/* Mensagem de status (sucesso ou erro) */}
          {status && (
            <div
              className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 border ${
                status === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {/* Ícone dinâmico baseado no status */}
              {status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-xs sm:text-sm">{mensagem}</p>
            </div>
          )}

          {/* Botão de retorno */}
          <div className="space-y-4 sm:space-y-6">
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-200 transition"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}