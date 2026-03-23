'use client';

import { Notification } from '@/lib/types/notificacao';
import { NotificationCard } from './notificationCard';
import { BellOff } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  selectedIds: string[];
  isLoading: boolean;
  onSelectNotification: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  showCheckboxes?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
}

/**
 * @component NotificationList
 * @version 1.0.0
 * 
 * @description Lista de notificações com tratamento de estados de carregamento e vazio.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {Notification[]} notifications - Lista de notificações a serem exibidas
 * @property {string[]} selectedIds - IDs das notificações selecionadas
 * @property {boolean} isLoading - Indica se está carregando dados
 * @property {(id: string) => void} onSelectNotification - Callback para selecionar notificação
 * @property {(id: string) => void} onMarkAsRead - Callback para marcar como lida
 * @property {(id: string) => void} onRemove - Callback para remover notificação
 * @property {boolean} [showCheckboxes=true] - Exibe checkboxes de seleção
 * @property {boolean} [showActions=true] - Exibe botões de ação
 * @property {string} [emptyMessage] - Mensagem personalizada para lista vazia
 * 
 * ----------------------------------------------------------------------------
 * 📋 ESTADOS DE UI:
 * ----------------------------------------------------------------------------
 * 
 * 1. LOADING (isLoading e sem notificações):
 *    - Spinner centralizado
 *    - Mensagem "Carregando notificações..."
 * 
 * 2. LISTA VAZIA (notifications.length === 0):
 *    - Ícone BellOff cinza
 *    - Título "Nenhuma notificação"
 *    - Mensagem personalizada (ou padrão)
 * 
 * 3. LISTA COM DADOS:
 *    - Grid de NotificationCard
 *    - Cada card com seleção e ações
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - LOADING INICIAL: Apenas exibe spinner se não há notificações (evita piscar)
 * - MENSAGEM PERSONALIZADA: Permite customização por perfil (motorista/agente/gestor)
 * - RESPONSIVIDADE: Tamanhos adaptativos (p-8 sm:p-12, h-8 sm:h-12)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - NotificationCard: Card individual de notificação
 * - BellOff: Ícone para lista vazia
 * 
 * @example
 * ```tsx
 * <NotificationList
 *   notifications={notifications}
 *   selectedIds={selectedIds}
 *   isLoading={isLoading}
 *   onSelectNotification={toggleSelect}
 *   onMarkAsRead={markAsRead}
 *   onRemove={removeNotification}
 *   showCheckboxes={true}
 *   showActions={true}
 *   emptyMessage="Você está em dia! Não há notificações no momento."
 * />
 * ```
 */

export function NotificationList({
  notifications,
  selectedIds,
  isLoading,
  onSelectNotification,
  onMarkAsRead,
  onRemove,
  showCheckboxes = true,
  showActions = true,
  emptyMessage = 'Você está em dia! Não há notificações no momento.',
}: NotificationListProps) {
  
  // ==================== ESTADO: LOADING ====================
  if (isLoading && notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
          Carregando notificações...
        </h2>
      </div>
    );
  }

  // ==================== ESTADO: LISTA VAZIA ====================
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
        <BellOff className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
          Nenhuma notificação
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">{emptyMessage}</p>
      </div>
    );
  }

  // ==================== ESTADO: LISTA COM DADOS ====================
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          selected={selectedIds.includes(notification.id)}
          onSelect={onSelectNotification}
          onMarkAsRead={onMarkAsRead}
          onRemove={onRemove}
          showCheckbox={showCheckboxes}
          showActions={showActions}
        />
      ))}
    </div>
  );
}