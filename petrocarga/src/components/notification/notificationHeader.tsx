'use client';

import { Notification } from '@/lib/types/notificacao';
import {
  Bell,
  Check,
  CheckCircle,
  Menu,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NotificationHeaderProps {
  notifications: Notification[];
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
  selectedIds: string[];
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onOpenMarkReadModal: () => void;
  onOpenDeleteModal: () => void;
  onClearSelection: () => void;
  showBulkActions?: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * @component NotificationHeader
 * @version 1.0.0
 * 
 * @description Cabeçalho da página de notificações com estatísticas, status de conexão e ações em lote.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. ESTATÍSTICAS:
 *    - Total de notificações
 *    - Contador de não lidas (vermelho)
 * 
 * 2. STATUS DE CONEXÃO:
 *    - Online: ícone Wifi verde + "Tempo real ativo"
 *    - Offline: ícone WifiOff amarelo + "Conexão offline"
 *    - Botão "Reconectar" quando offline
 * 
 * 3. AÇÕES EM LOTE (quando há seleção):
 *    - Contador de itens selecionados
 *    - Botão "Marcar como lida(s)" (verde)
 *    - Botão "Remover selecionada(s)" (vermelho)
 *    - Botão "Cancelar" (cinza)
 * 
 * 4. SELEÇÃO EM MASSA (quando sem seleção):
 *    - Botão "Selecionar todas (X)" com checkbox
 * 
 * 5. MENSAGENS DE STATUS:
 *    - Erro: banner vermelho
 *    - Conectando: banner amarelo
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - MENU MOBILE: Botão hambúrguer que expande status de conexão
 * - RESPONSIVIDADE: Layout adaptativo (mobile/desktop)
 * - BADGE DE NÃO LIDAS: Exibido no subtítulo com cor vermelha
 * - BANNERS DE STATUS: Cores diferenciadas (verde/amarelo/vermelho)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Notification: Tipo de notificação
 * - NotificationList: Lista de notificações
 * - NotificationModals: Modais de confirmação
 * 
 * @example
 * ```tsx
 * <NotificationHeader
 *   notifications={notifications}
 *   isConnected={isConnected}
 *   error={error}
 *   reconnect={reconnect}
 *   selectedIds={selectedIds}
 *   allSelected={allSelected}
 *   onToggleSelectAll={toggleSelectAll}
 *   onOpenMarkReadModal={() => setShowMarkReadModal(true)}
 *   onOpenDeleteModal={() => setShowDeleteModal(true)}
 *   onClearSelection={() => setSelectedIds([])}
 *   showBulkActions={true}
 *   title="Minhas Notificações"
 *   subtitle="Fique por dentro das suas reservas"
 * />
 * ```
 */

export function NotificationHeader({
  notifications,
  isConnected,
  error,
  reconnect,
  selectedIds,
  allSelected,
  onToggleSelectAll,
  onOpenMarkReadModal,
  onOpenDeleteModal,
  onClearSelection,
  showBulkActions = true,
  title = 'Notificações',
  subtitle,
}: NotificationHeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.lida).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      
      {/* ==================== HEADER PRINCIPAL ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-800" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {subtitle || (
                  <>
                    {notifications.length} total
                    {notifications.length !== 1 ? 's' : ''}
                    {unreadCount > 0 && (
                      <span className="ml-1 sm:ml-2 text-red-600 font-semibold">
                        • {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Botão menu mobile */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Status de conexão (desktop sempre visível, mobile toggle) */}
        <div
          className={`flex-col sm:flex-row items-start sm:items-center gap-3 ${
            showMobileMenu ? 'flex' : 'hidden sm:flex'
          }`}
        >
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

      {/* ==================== AÇÕES EM LOTE ==================== */}
      {showBulkActions && selectedIds.length > 0 ? (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-700 font-medium text-sm sm:text-base">
                {selectedIds.length} notificação(ões) selecionada(s)
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Botão marcar como lida */}
              <button
                onClick={onOpenMarkReadModal}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Marcar como lida(s)</span>
              </button>
              {/* Botão remover selecionadas */}
              <button
                onClick={onOpenDeleteModal}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remover selecionada(s)</span>
              </button>
              {/* Botão cancelar seleção */}
              <button
                onClick={onClearSelection}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        showBulkActions &&
        notifications.length > 0 && (
          <div className="mt-4">
            <button
              onClick={onToggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm sm:text-base"
            >
              <div
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center ${
                  allSelected
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {allSelected && (
                  <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                )}
              </div>
              <span>Selecionar todas ({notifications.length})</span>
            </button>
          </div>
        )
      )}

      {/* ==================== BANNERS DE STATUS ==================== */}
      
      {/* Banner de erro */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs sm:text-sm">
          ⚠️ {error}
          <div className="mt-1 text-xs text-red-600">
            As notificações em tempo real estão temporariamente indisponíveis.
          </div>
        </div>
      )}

      {/* Banner de conexão (offline sem erro) */}
      {!isConnected && !error && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-700 text-xs sm:text-sm">
          ⚡ Conectando ao servidor de notificações...
          <div className="mt-1 text-xs text-yellow-600">
            As notificações serão recebidas em tempo real quando a conexão for
            estabelecida.
          </div>
        </div>
      )}
    </div>
  );
}