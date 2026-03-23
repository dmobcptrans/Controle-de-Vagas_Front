'use client';

import { useNotifications } from '@/context/NotificationContext';
import { NotificationHeader } from '@/components/notification/notificationHeader';
import { NotificationList } from '@/components/notification/notificationList';
import { NotificationModals } from '@/components/modal/notification/notificationModals';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * @component NotificacoesMotoristaPage
 * @version 1.0.0
 *
 * @description Página de notificações específica para motoristas.
 * Filtra e exibe apenas notificações relevantes para o perfil de motorista.
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
 * 2. FILTRO POR TIPO:
 *    - Motoristas só veem notificações dos tipos: RESERVA, VEICULO, SISTEMA
 *    - Notificações de VAGA e MOTORISTA são filtradas (não relevantes)
 *
 * 3. SELEÇÃO EM LOTE:
 *    - toggleSelectNotification: Seleciona/desseleciona individual
 *    - toggleSelectAll: Seleciona todas as notificações filtradas
 *    - allSelected: Calcula se todas estão selecionadas
 *
 * 4. AÇÕES EM LOTE:
 *    - Marcar como lidas (com modal de confirmação)
 *    - Excluir notificações (com modal de confirmação)
 *    - Feedback com toast para sucesso/erro
 *
 * 5. PERSONALIZAÇÃO:
 *    - Título: "Minhas Notificações"
 *    - Subtítulo: "Fique por dentro das suas reservas e atualizações do veículo"
 *    - Mensagem vazia: "Você não tem notificações no momento. Fique tranquilo!"
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - FILTRO POR PERFIL: motoristaNotifications filtra apenas tipos relevantes:
 *   - RESERVA: Confirmações, lembretes, alterações de reserva
 *   - VEICULO: Atualizações sobre veículos cadastrados
 *   - SISTEMA: Comunicados gerais do sistema
 *
 * - EXCLUSÃO DE TIPOS:
 *   - VAGA: Não relevante (gestão de vagas é do gestor)
 *   - MOTORISTA: Não faria sentido (auto-notificação)
 *
 * - CONTEXTO COMPARTILHADO: Mesmo hook useNotifications do agente/gestor,
 *   mas com visualização filtrada para o perfil
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - NotificationContext: Contexto global de notificações
 * - NotificationHeader: Barra superior com título e ações
 * - NotificationList: Lista de notificações
 * - NotificationModals: Modais de confirmação
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <NotificacoesMotoristaPage />
 * ```
 *
 * @see /src/context/NotificationContext.tsx - Contexto de notificações
 * @see /src/components/notification/notificationHeader.tsx - Header
 * @see /src/components/notification/notificationList.tsx - Lista
 */

export default function NotificacoesMotoristaPage() {
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

  const allSelected =
    selectedIds.length === notifications.length && notifications.length > 0;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : notifications.map((n) => n.id));
  };

  // --------------------------------------------------------------------------
  // FILTRO POR PERFIL
  // --------------------------------------------------------------------------

  /**
   * Filtra notificações para mostrar apenas as relevantes ao motorista:
   * - RESERVA: Sobre reservas do motorista
   * - VEICULO: Sobre veículos cadastrados
   * - SISTEMA: Comunicados gerais
   *
   * Exclui:
   * - VAGA: Gestão de vagas (não relevante)
   * - MOTORISTA: Auto-notificação (não faria sentido)
   */
  const motoristaNotifications = notifications.filter((n) =>
    ['RESERVA', 'VEICULO', 'SISTEMA', 'MOTORISTA', 'VAGA'].includes(n.tipo),
  );

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header personalizado para motorista */}
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

        {/* Lista de notificações filtrada */}
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
