'use client';

import { useNotifications } from '@/context/NotificationContext';
import { Notification } from '@/lib/types/notificacao';
import {
  Bell,
  BellOff,
  Check,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  CheckCircle,
  Menu,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

export default function NotificacoesPage() {
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteSelectedNotifications(selectedIds);
      setSelectedIds([]);
      setShowDeleteModal(false);
    } catch {
      toast.error('Erro ao remover notificações. Por favor, tente novamente.');
    }
  };

  const handleMarkSelectedAsRead = async () => {
    try {
      await markSelectedAsRead(selectedIds);
      setSelectedIds([]);
      setShowMarkReadModal(false);
    } catch {
      toast.error(
        'Erro ao marcar notificações como lidas. Por favor, tente novamente.',
      );
    }
  };

  const allSelected =
    selectedIds.length === notifications.length && notifications.length > 0;

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
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-800" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Notificações
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {notifications.length} total
                    {notifications.length !== 1 ? 's' : ''}
                    {unreadCount > 0 && (
                      <span className="ml-1 sm:ml-2 text-red-600 font-semibold">
                        • {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Botão de menu móvel */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div
              className={`flex-col sm:flex-row items-start sm:items-center gap-3 ${showMobileMenu ? 'flex' : 'hidden sm:flex'}`}
            >
              {/* Status da conexão SSE */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm ${
                  isConnected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span className="whitespace-nowrap">Tempo real ativo</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span className="whitespace-nowrap">Conexão offline</span>
                  </>
                )}
              </div>

              {/* Botão de Reconexão Manual */}
              {!isConnected && (
                <button
                  onClick={reconnect}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap mt-2 sm:mt-0"
                  title="Tentar reconectar"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reconectar</span>
                </button>
              )}
            </div>
          </div>

          {/* 🔴 BARRA DE AÇÕES EM MASSA */}
          {selectedIds.length > 0 ? (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-blue-700 font-medium text-sm sm:text-base">
                    {selectedIds.length} notificação(ões) selecionada(s)
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowMarkReadModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Marcar como lida(s)</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remover selecionada(s)</span>
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            notifications.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center ${
                      selectedIds.length === notifications.length
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedIds.length === notifications.length && (
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    )}
                  </div>
                  <span>Selecionar todas ({notifications.length})</span>
                </button>
              </div>
            )
          )}

          {/* Mensagens de Status SSE */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs sm:text-sm">
              ⚠️ {error}
              <div className="mt-1 text-xs text-red-600">
                As notificações em tempo real estão temporariamente
                indisponíveis.
              </div>
            </div>
          )}

          {!isConnected && !error && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-700 text-xs sm:text-sm">
              ⚡ Conectando ao servidor de notificações...
              <div className="mt-1 text-xs text-yellow-600">
                As notificações serão recebidas em tempo real quando a conexão
                for estabelecida.
              </div>
            </div>
          )}
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {isLoading && notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                Carregando notificações...
              </h2>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
              <BellOff className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                Nenhuma notificação
              </h2>
              <p className="text-gray-500 text-sm sm:text-base">
                Você está em dia! Não há notificações no momento.
              </p>
            </div>
          ) : (
            notifications.map((notif: Notification) => (
              <div
                key={notif.id}
                className={`bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 ${getCorNotificacao(
                  notif.tipo,
                )} hover:shadow-lg transition-all ${
                  notif.lida ? 'opacity-60' : ''
                } ${
                  selectedIds.includes(notif.id)
                    ? 'ring-2 ring-blue-500 ring-opacity-50'
                    : ''
                }`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  toggleSelectNotification(notif.id);
                }}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  {/* 🔴 CHECKBOX DE SELEÇÃO */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center cursor-pointer ${
                        selectedIds.includes(notif.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectNotification(notif.id);
                      }}
                    >
                      {selectedIds.includes(notif.id) && (
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-xl sm:text-2xl flex-shrink-0">
                      {getIconeNotificacao(notif.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-gray-800 font-medium text-sm sm:text-base mb-1 break-words">
                            {notif.titulo}
                          </p>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 break-words whitespace-pre-wrap">
                            {notif.mensagem}
                          </p>
                        </div>
                        {!notif.lida && !selectedIds.includes(notif.id) && (
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 self-start sm:self-center animate-pulse"></span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
                          {notif.tipo}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatarTempo(notif.criadaEm)}
                        </span>
                        {notif.lida && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1 whitespace-nowrap">
                            <Check className="h-3 w-3" />
                            Lida
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-row sm:flex-col gap-1 sm:gap-2">
                    {/* Botão Marcar como Lida */}
                    {!notif.lida && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        className="flex-shrink-0 p-1 sm:p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    )}

                    {/* Botão remover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notif.id);
                      }}
                      className="flex-shrink-0 p-1 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover notificação"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🔴 MODAIS DE CONFIRMAÇÃO */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        title="Remover notificações"
        message={`Tem certeza que deseja remover ${
          allSelected
            ? 'todas as notificações'
            : `${selectedIds.length} notificação(ões) selecionada(s)`
        }? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      <ConfirmModal
        isOpen={showMarkReadModal}
        onClose={() => setShowMarkReadModal(false)}
        onConfirm={handleMarkSelectedAsRead}
        title="Marcar como lidas"
        message={`Deseja marcar ${
          allSelected
            ? 'todas as notificações'
            : `${selectedIds.length} notificação(ões) selecionada(s)`
        } como lida(s)?`}
        confirmText="Marcar como lidas"
        confirmColor="bg-green-600 hover:bg-green-700"
      />
    </div>
  );
}
