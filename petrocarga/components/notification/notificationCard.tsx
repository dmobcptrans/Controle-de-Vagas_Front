'use client';

import { Notification } from '@/lib/types/notificacao';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback } from 'react';

interface NotificationCardProps {
  notification: Notification;
  selected: boolean;
  onSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  showCheckbox?: boolean;
  showActions?: boolean;
}

export function NotificationCard({
  notification,
  selected,
  onSelect,
  onMarkAsRead,
  onRemove,
  showCheckbox = true,
  showActions = true,
}: NotificationCardProps) {
  const getIconeNotificacao = useCallback((tipo: Notification['tipo']) => {
    switch (tipo) {
      case 'RESERVA':
        return '🚗';
      case 'VAGA':
        return '🅿️';
      case 'VEICULO':
        return '🔧';
      case 'MOTORISTA':
        return '👤';
      case 'SISTEMA':
        return '📢';
      default:
        return '📢';
    }
  }, []);

  const getCorNotificacao = useCallback((tipo: Notification['tipo']) => {
    switch (tipo) {
      case 'RESERVA':
        return 'border-l-blue-500 bg-blue-50';
      case 'VAGA':
        return 'border-l-green-500 bg-green-50';
      case 'VEICULO':
        return 'border-l-purple-500 bg-purple-50';
      case 'MOTORISTA':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'SISTEMA':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  }, []);

  const formatarTempo = useCallback((timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Agora';
    }
  }, []);

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 ${getCorNotificacao(
        notification.tipo,
      )} hover:shadow-lg transition-all ${
        notification.lida ? 'opacity-60' : ''
      } ${selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onSelect(notification.id);
      }}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {showCheckbox && (
          <div className="flex-shrink-0 pt-1">
            <div
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center cursor-pointer ${
                selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(notification.id);
              }}
            >
              {selected && (
                <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl sm:text-2xl flex-shrink-0">
            {getIconeNotificacao(notification.tipo)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-gray-800 font-medium text-sm sm:text-base mb-1 break-words">
                  {notification.titulo}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 break-words whitespace-pre-wrap">
                  {notification.mensagem}
                </p>
              </div>
              {!notification.lida && !selected && (
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 self-start sm:self-center animate-pulse"></span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
                {notification.tipo}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatarTempo(notification.criadaEm)}
              </span>
              {notification.lida && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1 whitespace-nowrap">
                  <Check className="h-3 w-3" />
                  Lida
                </span>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-row sm:flex-col gap-1 sm:gap-2">
            {!notification.lida && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="flex-shrink-0 p-1 sm:p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                title="Marcar como lida"
              >
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
              className="flex-shrink-0 p-1 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remover notificação"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
