'use client';

import { useNotifications } from '@/context/NotificationContext';
import { NotificationHeader } from '@/components/notification/notificationHeader';
import { NotificationList } from '@/components/notification/notificationList';
import { NotificationModals } from '@/components/modal/notification/notificationModals';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * @component NotificacoesAgentePage
 * @version 1.0.0
 *
 * @description Página de gerenciamento de notificações para agentes.
 * Fornece interface completa para visualizar, selecionar, marcar como lidas
 * e excluir notificações em lote.
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
 * 2. SELEÇÃO DE NOTIFICAÇÕES (LOTE):
 *    - toggleSelectNotification: Seleciona/desseleciona individual
 *    - toggleSelectAll: Seleciona todas as notificações
 *    - allSelected: Calcula se todas estão selecionadas
 *    - selectedIds: Array com IDs das notificações selecionadas
 *
 * 3. AÇÕES EM LOTE:
 *    a) MARCAR COMO LIDAS:
 *       - Modal de confirmação (showMarkReadModal)
 *       - Chama markSelectedAsRead do contexto
 *       - Feedback com toast de sucesso/erro
 *       - Limpa seleção após ação
 *
 *    b) EXCLUIR EM LOTE:
 *       - Modal de confirmação (showDeleteModal)
 *       - Chama deleteSelectedNotifications do contexto
 *       - Feedback com toast de sucesso/erro
 *       - Limpa seleção após ação
 *
 * 4. COMPOSIÇÃO DE COMPONENTES:
 *    - NotificationHeader: Barra superior com título e ações
 *    - NotificationList: Lista de notificações com checkboxes
 *    - NotificationModals: Modais de confirmação
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - useContext (NotificationContext)
 *   - useState (seleção local)
 *   - Interatividade (modais, toasts)
 *
 * - ESTADO LOCAL vs CONTEXTO:
 *   - selectedIds: Estado local porque é específico desta página
 *   - notifications: Vem do contexto porque é global
 *   - Separação clara de responsabilidades
 *
 * - MODAIS DE CONFIRMAÇÃO:
 *   - Previnem ações acidentais em lote
 *   - Feedback visual do que será afetado (selectedCount)
 *   - allSelected para mensagens contextuais
 *
 * - FEEDBACK COM TOAST:
 *   - Sucesso: "Notificações removidas com sucesso!"
 *   - Erro: Mensagem amigável com opção de tentar novamente
 *   - UX consistente com o sistema
 *
 * - LAYOUT RESPONSIVO:
 *   - max-w-4xl para leitura confortável
 *   - Padding responsivo (px-3 sm:px-4)
 *   - Altura total (min-h-screen)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - NotificationContext: Contexto global de notificações
 * - NotificationHeader: Barra superior com ações
 * - NotificationList: Lista de notificações
 * - NotificationModals: Modais de confirmação
 * - react-hot-toast: Biblioteca de feedback
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - AÇÕES EM LOTE:
 *   - Checkboxes para seleção múltipla
 *   - "Selecionar todos" com um clique
 *   - Contador visual de itens selecionados
 *   - Modais de confirmação preventivos
 *
 * - FEEDBACK VISUAL:
 *   - Toast de sucesso/erro para ações
 *   - Loading state durante ações (nos modais)
 *   - Mensagens claras de confirmação
 *
 * - ESTADOS DA LISTA:
 *   - Carregando (via NotificationList)
 *   - Erro de conexão (via NotificationHeader)
 *   - Lista vazia (mensagem amigável)
 *   - Lista com notificações
 *
 * - ACESSIBILIDADE:
 *   - Estrutura semântica
 *   - Controles de teclado para modais
 *   - Mensagens claras em toasts
 *
 * @example
 * // Uso em rota de agente (protegida)
 * <NotificacoesAgentePage />
 *
 * @see /src/context/NotificationContext.tsx - Contexto de notificações
 * @see /src/components/notification/notificationHeader.tsx - Header com ações
 * @see /src/components/notification/notificationList.tsx - Lista de notificações
 * @see /src/components/modal/notification/notificationModals.tsx - Modais
 */

export default function NotificacoesAgentePage() {
  // --------------------------------------------------------------------------
  // CONTEXTO DE NOTIFICAÇÕES
  // --------------------------------------------------------------------------

  /**
   * useNotifications fornece:
   * - notifications: Array de notificações
   * - isConnected: Status da conexão WebSocket
   * - isLoading: Estado de carregamento inicial
   * - error: Erro de conexão ou API
   * - removeNotification: Remove uma notificação
   * - markAsRead: Marca uma como lida
   * - markSelectedAsRead: Marca várias como lidas
   * - deleteSelectedNotifications: Remove várias
   * - reconnect: Tenta reconectar WebSocket
   */
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
  // ESTADOS LOCAIS (Página)
  // --------------------------------------------------------------------------

  /**
   * selectedIds: IDs das notificações selecionadas
   * Estado local porque é específico desta página
   */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /**
   * Controle dos modais de confirmação
   * Estado local para cada modal
   */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMarkReadModal, setShowMarkReadModal] = useState(false);

  // --------------------------------------------------------------------------
  // VALORES DERIVADOS
  // --------------------------------------------------------------------------

  /**
   * allSelected: Verifica se todas as notificações estão selecionadas
   * Usado para:
   * - Marcar/desmarcar checkbox "Selecionar todos"
   * - Mensagens contextuais nos modais
   */
  const allSelected =
    selectedIds.length === notifications.length && notifications.length > 0;

  // --------------------------------------------------------------------------
  // FUNÇÕES DE SELEÇÃO
  // --------------------------------------------------------------------------

  /**
   * @function toggleSelectNotification
   * @description Adiciona ou remove uma notificação da seleção
   *
   * @param id - ID da notificação
   *
   * @example
   * // Se ID não estiver selecionado, adiciona
   * // Se já estiver, remove
   */
  const toggleSelectNotification = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  /**
   * @function toggleSelectAll
   * @description Seleciona ou desseleciona todas as notificações
   *
   * Comportamento:
   * - Se todas estão selecionadas: limpa seleção
   * - Se não: seleciona todas
   */
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : notifications.map((n) => n.id));
  };

  // --------------------------------------------------------------------------
  // HANDLERS DE AÇÕES EM LOTE
  // --------------------------------------------------------------------------

  /**
   * @function handleDeleteSelected
   * @description Processa exclusão em lote de notificações
   *
   * Fluxo:
   * 1. Chama função do contexto com IDs selecionados
   * 2. Sucesso: limpa seleção, fecha modal, toast de sucesso
   * 3. Erro: toast de erro amigável
   */
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

  /**
   * @function handleMarkSelectedAsRead
   * @description Processa marcação em lote de notificações como lidas
   *
   * Fluxo:
   * 1. Chama função do contexto com IDs selecionados
   * 2. Sucesso: limpa seleção, fecha modal, toast de sucesso
   * 3. Erro: toast de erro amigável
   */
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
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* --------------------------------------------------------------------
          HEADER COM AÇÕES
          Inclui:
          - Título e status de conexão
          - Botões de ações em lote (quando há seleção)
          - "Selecionar todos" e contador
        -------------------------------------------------------------------- */}
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
        />

        {/* --------------------------------------------------------------------
          LISTA DE NOTIFICAÇÕES
          Inclui:
          - Checkboxes para seleção individual
          - Ações individuais (marcar como lida, excluir)
          - Estados de loading e vazio
        -------------------------------------------------------------------- */}
        <NotificationList
          notifications={notifications}
          selectedIds={selectedIds}
          isLoading={isLoading}
          onSelectNotification={toggleSelectNotification}
          onMarkAsRead={markAsRead}
          onRemove={removeNotification}
          showCheckboxes={true}
          showActions={true}
          emptyMessage="Você está em dia! Não há notificações no momento."
        />
      </div>

      {/* --------------------------------------------------------------------
        MODAIS DE CONFIRMAÇÃO
        Dois modais reutilizáveis:
        - Confirmação de exclusão em lote
        - Confirmação de marcação como lida em lote
      -------------------------------------------------------------------- */}
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
