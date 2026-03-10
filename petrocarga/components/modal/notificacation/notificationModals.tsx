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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>

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
