'use client';

import { useNotifications } from '@/context/NotificationContext';
import { NotificationHeader } from '@/components/notification/notificationHeader';
import { NotificationList } from '@/components/notification/notificationList';
import { NotificationModals } from '@/components/modal/notificacation/notificationModals';
import { useState } from 'react';
import { Car, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificacoesMotoristaPage() {
  const {
    notifications,
    isConnected,
    isLoading,
    error,
    removeNotification,
    markAsRead,
    markSelectedAsRead,
    deleteSelectedNotifications,
    reconnect,
  } = useNotifications();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMarkReadModal, setShowMarkReadModal] = useState(false);

  // Funções específicas do motorista
  const handleVerViagens = () => {
    toast.success('Redirecionando para viagens...');
    // Lógica para redirecionar para página de viagens
  };

  const handleVerVeiculo = () => {
    toast.success('Redirecionando para detalhes do veículo...');
    // Lógica para redirecionar para página do veículo
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteSelectedNotifications(selectedIds);
      setSelectedIds([]);
      setShowDeleteModal(false);
      toast.success('Notificações removidas com sucesso!');
    } catch {
      toast.error('Erro ao remover notificações. Por favor, tente novamente.');
    }
  };

  const handleMarkSelectedAsRead = async () => {
    try {
      await markSelectedAsRead(selectedIds);
      setSelectedIds([]);
      setShowMarkReadModal(false);
      toast.success('Notificações marcadas como lidas!');
    } catch {
      toast.error(
        'Erro ao marcar notificações como lidas. Por favor, tente novamente.',
      );
    }
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const allSelected =
    selectedIds.length === notifications.length && notifications.length > 0;

  // Filtra apenas notificações relevantes para motorista
  const motoristaNotifications = notifications.filter((n) =>
    ['RESERVA', 'VEICULO', 'SISTEMA'].includes(n.tipo),
  );

  const reservasCount = notifications.filter(
    (n) => n.tipo === 'RESERVA' && !n.lida,
  ).length;
  const veiculoCount = notifications.filter(
    (n) => n.tipo === 'VEICULO' && !n.lida,
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Ações rápidas do Motorista */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleVerViagens}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>Minhas Viagens</span>
          </button>
          <button
            onClick={handleVerVeiculo}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Car className="h-4 w-4" />
            <span>Meu Veículo</span>
          </button>
        </div>

        <NotificationHeader
          notifications={motoristaNotifications}
          isConnected={isConnected}
          error={error}
          reconnect={reconnect}
          selectedIds={selectedIds}
          allSelected={allSelected}
          onToggleSelectAll={toggleSelectAll}
          onOpenMarkReadModal={() => setShowMarkReadModal(true)}
          onOpenDeleteModal={() => setShowDeleteModal(true)}
          onClearSelection={() => setSelectedIds([])}
          showBulkActions={true}
          title="Minhas Notificações"
          subtitle="Fique por dentro das suas reservas e atualizações do veículo"
        />

        <NotificationList
          notifications={motoristaNotifications}
          selectedIds={selectedIds}
          isLoading={isLoading}
          onSelectNotification={toggleSelectNotification}
          onMarkAsRead={markAsRead}
          onRemove={removeNotification}
          showCheckboxes={true}
          showActions={true}
          emptyMessage="Você não tem notificações no momento. Fique tranquilo!"
        />

        {/* Alertas importantes para o motorista */}
        {(reservasCount > 0 || veiculoCount > 0) && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Ações Pendentes
                </h3>
                <div className="space-y-2">
                  {reservasCount > 0 && (
                    <p className="text-sm text-gray-600">
                      • Você tem {reservasCount} nova(s) reserva(s) para
                      visualizar
                    </p>
                  )}
                  {veiculoCount > 0 && (
                    <p className="text-sm text-gray-600">
                      • Há {veiculoCount} atualização(ões) sobre seu veículo
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumo rápido para o motorista */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter((n) => n.tipo === 'RESERVA').length}
            </div>
            <div className="text-xs text-gray-600">Total de Reservas</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter((n) => n.tipo === 'VEICULO').length}
            </div>
            <div className="text-xs text-gray-600">Atualizações do Veículo</div>
          </div>
        </div>
      </div>

      <NotificationModals
        showDeleteModal={showDeleteModal}
        showMarkReadModal={showMarkReadModal}
        onCloseDeleteModal={() => setShowDeleteModal(false)}
        onCloseMarkReadModal={() => setShowMarkReadModal(false)}
        onConfirmDelete={handleDeleteSelected}
        onConfirmMarkRead={handleMarkSelectedAsRead}
        selectedCount={selectedIds.length}
        allSelected={allSelected}
      />
    </div>
  );
}
