'use client';

import { useNotifications } from '@/context/NotificationContext';
import { NotificationHeader } from '@/components/notification/notificationHeader';
import { NotificationList } from '@/components/notification/notificationList';
import { NotificationModals } from '@/components/modal/notification/notificationModals';
import { useState } from 'react';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * @component NotificacoesGestorPage
 * @version 1.0.0
 *
 * @description Página de gerenciamento de notificações para gestores.
 * Visão consolidada de todas as notificações do sistema com estatísticas.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. CONTEXTO DE NOTIFICAÇÕES:
 *    - useNotifications() fornece estado global das notificações
 *    - Gerencia conexão WebSocket em tempo real
 *    - Oferece funções CRUD para notificações
 *
 * 2. SELEÇÃO EM LOTE:
 *    - toggleSelectNotification: Seleciona/desseleciona individual
 *    - toggleSelectAll: Seleciona todas as notificações
 *    - allSelected: Calcula se todas estão selecionadas
 *
 * 3. AÇÕES EM LOTE:
 *    - Marcar como lidas (com modal de confirmação)
 *    - Excluir notificações (com modal de confirmação)
 *    - Feedback com toast para sucesso/erro
 *
 * 4. ESTATÍSTICAS DO SISTEMA:
 *    - Total de notificações (azul)
 *    - Notificações lidas (verde)
 *    - Notificações não lidas (amarelo)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - DIFERENCIAÇÃO DO AGENTE: Versão gestor com:
 *   - Título "Notificações do Sistema"
 *   - Subtítulo "Gerencie notificações de todos os agentes"
 *   - Card de estatísticas global
 *
 * - ESTATÍSTICAS DESTACADAS:
 *   - unreadCount calculado via filter
 *   - Cards coloridos por categoria
 *   - Grid responsivo (1 coluna mobile, 3 desktop)
 *
 * - CONTEXTO COMPARTILHADO: Mesmo hook useNotifications do agente,
 *   mas com visualização de todas as notificações do sistema
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - NotificationContext: Contexto global de notificações
 * - NotificationHeader: Barra superior com ações
 * - NotificationList: Lista de notificações
 * - NotificationModals: Modais de confirmação
 *
 * @example
 * // Uso em rota de gestor
 * <NotificacoesGestorPage />
 *
 * @see /src/context/NotificationContext.tsx - Contexto de notificações
 * @see /src/components/notification/notificationHeader.tsx - Header
 * @see /src/components/notification/notificationList.tsx - Lista
 */

export default function NotificacoesGestorPage() {
  // --------------------------------------------------------------------------
  // CONTEXTO DE NOTIFICAÇÕES
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // ESTADOS LOCAIS
  // --------------------------------------------------------------------------

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMarkReadModal, setShowMarkReadModal] = useState(false);

  // --------------------------------------------------------------------------
  // HANDLERS DE AÇÕES EM LOTE
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // FUNÇÕES DE SELEÇÃO
  // --------------------------------------------------------------------------

  const toggleSelectNotification = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : notifications.map((n) => n.id));
  };

  // --------------------------------------------------------------------------
  // VALORES DERIVADOS
  // --------------------------------------------------------------------------

  const allSelected =
    selectedIds.length === notifications.length && notifications.length > 0;
  const unreadCount = notifications.filter((n) => !n.lida).length;

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com ações */}
        <NotificationHeader
          notifications={notifications}
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
          title="Notificações do Sistema"
          subtitle="Gerencie notificações de todos os agentes"
        />

        {/* Lista de notificações */}
        <NotificationList
          notifications={notifications}
          selectedIds={selectedIds}
          isLoading={isLoading}
          onSelectNotification={toggleSelectNotification}
          onMarkAsRead={markAsRead}
          onRemove={removeNotification}
          showCheckboxes={true}
          showActions={true}
          emptyMessage="Nenhuma notificação no sistema no momento."
        />

        {/* Card de estatísticas do sistema */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estatísticas do Sistema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total de notificações */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {notifications.length}
              </div>
              <div className="text-sm text-gray-600">Total de Notificações</div>
            </div>

            {/* Notificações lidas */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter((n) => n.lida).length}
              </div>
              <div className="text-sm text-gray-600">Lidas</div>
            </div>

            {/* Notificações não lidas */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-600">Não Lidas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modais de confirmação */}
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
