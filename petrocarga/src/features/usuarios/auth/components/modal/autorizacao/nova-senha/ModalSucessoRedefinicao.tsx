'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

interface ModalSucessoRedefinicaoProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRedirect: () => void;
}

/**
 * @component ModalSucessoRedefinicao
 * @version 1.0.0
 * 
 * @description Modal de sucesso exibido após a redefinição de senha.
 * Informa que a senha foi alterada com sucesso e oferece redirecionamento para login.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {boolean} isOpen - Controla a visibilidade do modal
 * @property {() => void} onClose - Função para fechar o modal
 * @property {() => void} onLoginRedirect - Função para redirecionar para página de login
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
 * 3. REDIRECIONAMENTO:
 *    - Botão "Ir para o Login" chama onLoginRedirect
 * 
 * 4. INDICADOR DE PROGRESSO:
 *    - Mostra as 3 etapas do fluxo de redefinição:
 *      - Código (verificado)
 *      - Redefinir (concluído)
 *      - Concluído (destacado)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - BACKDROP: Fundo escuro com blur (bg-black/30 backdrop-blur-sm)
 * - ANIMAÇÃO: animate-fadeIn (Tailwind)
 * - BLOQUEIO DE SCROLL: document.body.style.overflow = 'hidden'
 * - CLEANUP: Restaura scroll e remove event listener na desmontagem
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - CheckCircle2: Ícone de sucesso do Lucide
 * 
 * @example
 * ```tsx
 * <ModalSucessoRedefinicao
 *   isOpen={mostrarModalSucesso}
 *   onClose={fecharModal}
 *   onLoginRedirect={irParaLogin}
 * />
 * ```
 */

export default function ModalSucessoRedefinicao({
  isOpen,
  onClose,
  onLoginRedirect,
}: ModalSucessoRedefinicaoProps) {
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
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-5 sm:p-6 md:p-8 max-w-md w-full mx-3 animate-fadeIn">
        
        {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
        <div className="text-center">
          
          {/* Ícone de sucesso */}
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600" />
          </div>
          
          {/* Título */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            Senha alterada com sucesso!
          </h2>
          
          {/* Mensagem */}
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            Sua senha foi redefinida com sucesso. Agora você pode fazer login
            com sua nova senha.
          </p>
          
          {/* Botão de redirecionamento */}
          <button
            onClick={onLoginRedirect}
            className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition"
          >
            Ir para o Login
          </button>
        </div>

        {/* ==================== INDICADOR DE PROGRESSO ==================== */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            
            {/* Etapa 1: Código */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
              <span className="hidden xs:inline">Código</span>
            </div>
            
            {/* Etapa 2: Redefinir */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
              <span className="hidden xs:inline">Redefinir</span>
            </div>
            
            {/* Etapa 3: Concluído (destacado) */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
              <span className="hidden xs:inline font-medium">Concluído</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}