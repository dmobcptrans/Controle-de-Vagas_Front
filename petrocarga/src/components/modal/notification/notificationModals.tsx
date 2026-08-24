'use client';

interface NotificationModalsProps {
  showDeleteModal: boolean;
  showMarkReadModal: boolean;
  onCloseDeleteModal: () => void;
  onCloseMarkReadModal: () => void;
  onConfirmDelete: () => void;
  onConfirmMarkRead: () => void;
  selectedCount: number;
  allSelected: boolean;
}

/**
 * @component NotificationModals
 * @version 1.0.0
 * 
 * @description Componente que gerencia os modais de confirmação para ações em lote de notificações.
 * Fornece modais para exclusão e marcação como lida com mensagens dinâmicas.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {boolean} showDeleteModal - Controla visibilidade do modal de exclusão
 * @property {boolean} showMarkReadModal - Controla visibilidade do modal de marcação como lida
 * @property {() => void} onCloseDeleteModal - Fecha modal de exclusão
 * @property {() => void} onCloseMarkReadModal - Fecha modal de marcação como lida
 * @property {() => void} onConfirmDelete - Confirma exclusão das notificações
 * @property {() => void} onConfirmMarkRead - Confirma marcação como lida das notificações
 * @property {number} selectedCount - Quantidade de notificações selecionadas
 * @property {boolean} allSelected - Indica se todas as notificações estão selecionadas
 * 
 * ----------------------------------------------------------------------------
 * 📋 MODAIS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. MODAL DE EXCLUSÃO:
 *    - Título: "Remover notificações"
 *    - Botão confirmar: "Remover" (vermelho)
 *    - Mensagem: adaptada conforme allSelected
 * 
 * 2. MODAL DE MARCAÇÃO COMO LIDA:
 *    - Título: "Marcar como lidas"
 *    - Botão confirmar: "Marcar como lidas" (verde)
 *    - Mensagem: adaptada conforme allSelected
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - COMPONENTE INTERNO: ConfirmModal encapsulado no mesmo arquivo
 * - MENSAGENS DINÂMICAS: Ajustam texto baseado em allSelected e selectedCount
 * - RESPONSIVIDADE: Botões se reorganizam (flex-col sm:flex-row)
 * - BACKDROP: Fundo escuro com blur (bg-black/50 backdrop-blur-sm)
 * - CORES: Exclusão (vermelho), Marcar lidas (verde)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - NotificationHeader: Barra superior com ações em lote
 * - NotificationList: Lista de notificações com seleção
 * 
 * @example
 * ```tsx
 * <NotificationModals
 *   showDeleteModal={showDeleteModal}
 *   showMarkReadModal={showMarkReadModal}
 *   onCloseDeleteModal={() => setShowDeleteModal(false)}
 *   onCloseMarkReadModal={() => setShowMarkReadModal(false)}
 *   onConfirmDelete={handleDeleteSelected}
 *   onConfirmMarkRead={handleMarkSelectedAsRead}
 *   selectedCount={selectedIds.length}
 *   allSelected={allSelected}
 * />
 * ```
 */

export function NotificationModals({
  showDeleteModal,
  showMarkReadModal,
  onCloseDeleteModal,
  onCloseMarkReadModal,
  onConfirmDelete,
  onConfirmMarkRead,
  selectedCount,
  allSelected,
}: NotificationModalsProps) {
  
  /**
   * @component ConfirmModal
   * @description Modal de confirmação reutilizável para ações em lote
   */
  const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    confirmColor = 'bg-red-600 hover:bg-red-700',
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          
          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          
          {/* Mensagem */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Botões (responsivos) */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white ${confirmColor} rounded-lg transition-colors order-1 sm:order-2`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ==================== MODAL DE EXCLUSÃO ==================== */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Remover notificações"
        message={`Tem certeza que deseja remover ${
          allSelected
            ? 'todas as notificações'
            : `${selectedCount} notificação(ões) selecionada(s)`
        }? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* ==================== MODAL DE MARCAÇÃO COMO LIDA ==================== */}
      <ConfirmModal
        isOpen={showMarkReadModal}
        onClose={onCloseMarkReadModal}
        onConfirm={onConfirmMarkRead}
        title="Marcar como lidas"
        message={`Deseja marcar ${
          allSelected
            ? 'todas as notificações'
            : `${selectedCount} notificação(ões) selecionada(s)`
        } como lida(s)?`}
        confirmText="Marcar como lidas"
        confirmColor="bg-green-600 hover:bg-green-700"
      />
    </>
  );
}