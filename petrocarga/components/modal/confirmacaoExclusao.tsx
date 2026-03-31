'use client';

import { useEffect } from 'react';

interface ModalConfirmacaoExclusaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo?: string;
  mensagem?: string;
  textoCancelar?: string;
  textoConfirmar?: string;
  tipo?: 'exclusao' | 'ativacao';
}

export default function ModalConfirmacaoExclusao({
  isOpen,
  onClose,
  onConfirm,
  titulo = 'Confirmar exclusão',
  mensagem = '',
  textoCancelar = 'Cancelar',
  textoConfirmar = 'Excluir',
  tipo = 'exclusao',
}: ModalConfirmacaoExclusaoProps) {
  // Bloqueia scroll quando modal está aberto
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

  // CORES DINÂMICAS BASEADAS NO TIPO
  const corConfirmar =
    tipo === 'exclusao'
      ? 'bg-red-500 hover:bg-red-600'
      : 'bg-green-500 hover:bg-green-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay com backdrop blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Conteúdo do Modal */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg shadow-2xl transform transition-all duration-300 scale-95 sm:scale-100 animate-scaleIn">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
          {titulo}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">{mensagem}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 h-11 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition text-sm sm:text-base order-2 sm:order-1 min-w-[120px] font-medium"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 h-11 ${corConfirmar} text-white rounded-lg transition text-sm sm:text-base order-1 sm:order-2 min-w-[120px] font-medium`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
