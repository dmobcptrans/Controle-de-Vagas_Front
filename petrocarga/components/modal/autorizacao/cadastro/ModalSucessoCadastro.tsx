'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalSucessoCadastroProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function ModalSucessoCadastro({
  isOpen,
  onClose,
  userEmail = '',
}: ModalSucessoCadastroProps) {
  // Fechar modal ao pressionar ESC
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
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Conteúdo do Modal */}
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

          {/* Botões */}
          <div className="flex flex-col gap-3">
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

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-3 rounded-lg font-medium text-base transition-colors"
            >
              Fechar
            </Button>

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
