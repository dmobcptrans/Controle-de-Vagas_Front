'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalSucessoCadastroProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

/**
 * @component ModalSucessoCadastro
 * @version 1.0.0
 * 
 * @description Modal de sucesso exibido após o cadastro do usuário.
 * Informa que a conta foi criada e orienta sobre a ativação por email.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {boolean} isOpen - Controla a visibilidade do modal
 * @property {() => void} onClose - Função para fechar o modal
 * @property {string} [userEmail] - Email do usuário cadastrado (exibe no modal)
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. FECHAR COM ESC:
 *    - Pressionar ESC fecha o modal (cleanup no useEffect)
 * 
 * 2. FECHAR COM BOTÃO X:
 *    - Botão no canto superior direito
 * 
 * 3. FECHAR COM BOTÃO "Fechar":
 *    - Botão secundário no rodapé
 * 
 * 4. REDIRECIONAMENTOS:
 *    - "Ir para Ativar Conta": abre página de login com parâmetro ?ativar-conta=true
 *    - "Faça login agora": link para página de login
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - BACKDROP: Fundo escuro com blur (bg-black/50 backdrop-blur-sm)
 * - ANIMAÇÃO: animate-in fade-in-0 zoom-in-95 (Tailwind)
 * - PREVENÇÃO DE PROPAGAÇÃO: onClick={(e) => e.stopPropagation()}
 * - CLEANUP: Remove event listener de tecla ESC na desmontagem
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Button: Componente de botão do shadcn/ui
 * - Lucide icons: CheckCircle, Mail, X
 * 
 * @example
 * ```tsx
 * <ModalSucessoCadastro
 *   isOpen={showSuccessModal}
 *   onClose={closeModal}
 *   userEmail={userEmail}
 * />
 * ```
 */

export default function ModalSucessoCadastro({
  isOpen,
  onClose,
  userEmail = '',
}: ModalSucessoCadastroProps) {
  /**
   * @effect Fechar modal com tecla ESC
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================== BOTÃO DE FECHAR ==================== */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* ==================== CONTEÚDO DO MODAL ==================== */}
        <div className="p-6 sm:p-8">
          
          {/* Ícone de sucesso */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
            Cadastro Realizado com Sucesso! 🎉
          </h2>

          {/* Mensagem principal */}
          <p className="text-center text-gray-600 mb-6">
            Sua conta foi criada com sucesso. Agora você precisa ativá-la.
          </p>

          {/* Card de verificação de email */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-blue-800 text-lg mb-2">
                  📧 Verifique seu e-mail
                </h3>
                {userEmail && (
                  <p className="text-blue-600 text-sm break-all">
                    Enviamos um código de ativação para{' '}
                    <strong>{userEmail}</strong>
                  </p>
                )}
                <p className="text-blue-600 text-sm mt-3">
                  <strong>Use o código enviado para ativar sua conta.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* ==================== BOTÕES ==================== */}
          <div className="flex flex-col gap-3">
            
            {/* Botão principal - Ativar Conta */}
            <Button
              onClick={() => {
                window.location.href = '/autorizacao/login?ativar-conta=true';
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Ir para Ativar Conta
            </Button>

            {/* Botão secundário - Fechar */}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-3 rounded-lg font-medium text-base transition-colors"
            >
              Fechar
            </Button>

            {/* Link alternativo para login */}
            <p className="text-center text-gray-500 text-sm mt-2">
              Já ativou sua conta?{' '}
              <a
                href="/autorizacao/login"
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Faça login agora
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}