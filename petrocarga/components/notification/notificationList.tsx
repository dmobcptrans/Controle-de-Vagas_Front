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
