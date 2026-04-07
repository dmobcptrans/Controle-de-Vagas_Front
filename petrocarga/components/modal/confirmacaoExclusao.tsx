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

/**
 * @component ModalConfirmacaoExclusao
 * @version 1.0.0
 *
 * @description Modal de confirmação para ações destrutivas ou de ativação.
 * Suporta dois tipos: exclusão (vermelho) e ativação (verde).
 *
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 *
 * @property {boolean} isOpen - Controla a visibilidade do modal
 * @property {() => void} onClose - Função para fechar o modal
 * @property {() => void} onConfirm - Função para confirmar a ação
 * @property {string} [titulo] - Título do modal (padrão: "Confirmar exclusão")
 * @property {string} [mensagem] - Mensagem descritiva (opcional)
 * @property {string} [textoCancelar] - Texto do botão cancelar (padrão: "Cancelar")
 * @property {string} [textoConfirmar] - Texto do botão confirmar (padrão: "Excluir")
 * @property {'exclusao' | 'ativacao'} [tipo] - Tipo da ação (padrão: 'exclusao')
 *
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
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
 * 3. CORES DINÂMICAS:
 *    - tipo 'exclusao': botão confirmar vermelho (bg-red-500)
 *    - tipo 'ativacao': botão confirmar verde (bg-green-500)
 *
 * 4. LAYOUT RESPONSIVO:
 *    - Mobile: empilhamento de botões (flex-col)
 *    - Desktop: botões lado a lado (flex-row)
 *    - Largura adaptativa (max-w-sm → sm:max-w-md → md:max-w-lg)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - BACKDROP BLUR: bg-black/40 backdrop-blur-sm
 * - ANIMAÇÃO: scaleIn com duração de 300ms
 * - RESPONSIVIDADE: Botões em ordem flexível (order-1/order-2)
 * - ACESSIBILIDADE: Fechamento com tecla ESC
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES POR TIPO:
 * ----------------------------------------------------------------------------
 *
 * | Tipo       | Botão Confirmar | Cor                       |
 * |------------|-----------------|---------------------------|
 * | exclusao   | "Excluir"       | 🔴 Vermelho (bg-red-500)  |
 * | ativacao   | "Ativar"        | 🟢 Verde (bg-green-500)   |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - AgenteCard: Utiliza para exclusão de agente
 * - GestorCard: Utiliza para exclusão de gestor
 * - MotoristaCard: Utiliza para exclusão de motorista
 *
 * @example
 * ```tsx
 * // Modal de exclusão (padrão)
 * <ModalConfirmacaoExclusao
 *   isOpen={modalAberto}
 *   onClose={() => setModalAberto(false)}
 *   onConfirm={handleExcluir}
 *   mensagem="Tem certeza que deseja excluir este item?"
 * />
 *
 * // Modal de ativação
 * <ModalConfirmacaoExclusao
 *   isOpen={modalAberto}
 *   onClose={() => setModalAberto(false)}
 *   onConfirm={handleAtivar}
 *   titulo="Confirmar ativação"
 *   mensagem="Tem certeza que deseja ativar este usuário?"
 *   textoConfirmar="Ativar"
 *   tipo="ativacao"
 * />
 * ```
 */

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
  // ==================== BLOQUEIO DE SCROLL ====================
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

  // Cores dinâmicas baseadas no tipo
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
        {/* Título */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
          {titulo}
        </h3>

        {/* Mensagem */}
        <p className="text-sm sm:text-base text-gray-600 mb-6">{mensagem}</p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {/* Botão Cancelar */}
          <button
            onClick={onClose}
            className="px-6 py-3 h-11 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition text-sm sm:text-base order-2 sm:order-1 min-w-[120px] font-medium"
          >
            {textoCancelar}
          </button>

          {/* Botão Confirmar (cor dinâmica) */}
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
