'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  deletarNotificacao,
  getNotificacoesUsuario,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  deletarNotificacoesSelecionadas,
} from '@/lib/api/notificacaoApi';
import {
  Notification,
  NotificationContextData,
  NotificationProviderProps,
} from '@/lib/types/notificacao';

// Contexto
const NotificationContext = createContext<NotificationContextData | undefined>(
  undefined,
);

/**
 * @component NotificationProvider
 * @version 1.0.0
 * 
 * @description Provider para gerenciamento de notificações em tempo real via SSE.
 * Gerencia conexão WebSocket (EventSource), histórico, ações CRUD e reconexão automática.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. HISTÓRICO:
 *    - loadHistorico: Carrega notificações passadas do backend
 *    - Ordena por data decrescente (mais recentes primeiro)
 *    - Limita ao máximo configurado (maxNotifications)
 * 
 * 2. CONEXÃO EM TEMPO REAL (SSE):
 *    - Connect: Estabelece conexão EventSource com o backend
 *    - Recebe notificações em tempo real via onmessage
 *    - Reconexão automática com backoff exponencial
 * 
 * 3. AÇÕES CRUD:
 *    - addNotification: Adiciona notificação à lista (fifo)
 *    - removeNotification: Remove notificação (API + estado local)
 *    - markAsRead: Marca notificação como lida
 *    - markSelectedAsRead: Marca múltiplas como lidas
 *    - deleteSelectedNotifications: Remove múltiplas
 * 
 * 4. RECONEXÃO:
 *    - Auto-reconnect: Tentativas com backoff exponencial
 *    - Limite de tentativas (reconnectMaxAttempts)
 *    - Delay máximo (reconnectMaxDelayMs)
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO DO HOOK useNotifications:
 * ----------------------------------------------------------------------------
 * 
 * @property {Notification[]} notifications - Lista de notificações
 * @property {boolean} isConnected - Status da conexão SSE
 * @property {boolean} isLoading - Carregando histórico
 * @property {string | null} error - Mensagem de erro
 * @property {(notification: Notification) => void} addNotification - Adiciona notificação
 * @property {(id: string) => Promise<void>} removeNotification - Remove notificação
 * @property {(id: string) => Promise<void>} markAsRead - Marca como lida
 * @property {(ids: string[]) => Promise<void>} markSelectedAsRead - Marca múltiplas
 * @property {(ids: string[]) => Promise<void>} deleteSelectedNotifications - Remove múltiplas
 * @property {() => Promise<void>} loadHistorico - Carrega histórico
 * @property {() => Promise<void>} refreshNotifications - Atualiza lista
 * @property {() => void} reconnect - Reconecta ao servidor SSE
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - SSE (EventSource): Conexão unidirecional para receber notificações
 * - BACKOFF EXPONENCIAL: Reconexão com delays crescentes (1s, 2s, 4s...)
 * - FALLBACK: useNotifications retorna objeto padrão se usado fora do provider
 * - LIMITE DE NOTIFICAÇÕES: Mantém apenas as X mais recentes (maxNotifications)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Notification: Tipo de notificação
 * - useNotifications: Hook para acessar o contexto
 * 
 * @example
 * ```tsx
 * // Provider no layout
 * <NotificationProvider
 *   usuarioId={user.id}
 *   maxNotifications={50}
 *   enableSSE={true}
 *   autoReconnect={true}
 * >
 *   {children}
 * </NotificationProvider>
 * 
 * // Uso do hook
 * const { notifications, markAsRead, reconnect } = useNotifications();
 * ```
 */

export function NotificationProvider({
  children,
  usuarioId,
  maxNotifications = 50,
  enableSSE = true,
  autoReconnect = true,
  reconnectMaxAttempts = 5,
  reconnectInitialDelayMs = 1000,
  reconnectMaxDelayMs = 30000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const hasLoadedInitialRef = useRef(false);
  const apiUrlRef = useRef(process.env.NEXT_PUBLIC_API_URL || '');
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);

  // ==================== CARREGAR HISTÓRICO ====================
  const loadHistorico = useCallback(
    async (silent = false) => {
      if (!usuarioId) return;

      if (!silent) setIsLoading(true);

      try {
        const result = await getNotificacoesUsuario(usuarioId);

        if (result.error) {
          setError(result.message || 'Erro ao carregar notificações');
          return;
        }

        const novasNotificacoes = result.notificacoes || [];

        setNotifications(
          novasNotificacoes
            .sort(
              (a: Notification, b: Notification) =>
                new Date(b.criadaEm).getTime() -
                new Date(a.criadaEm).getTime(),
            )
            .slice(0, maxNotifications),
        );

        setError(null);
      } catch {
        setError('Erro ao carregar notificações');
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [usuarioId, maxNotifications],
  );

  // ==================== ADICIONAR NOTIFICAÇÃO ====================
  const addNotification = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev].slice(0, maxNotifications);
      });
    },
    [maxNotifications],
  );

  // ==================== REMOVER NOTIFICAÇÃO ====================
  const removeNotification = useCallback(
    async (id: string) => {
      try {
        const result = await deletarNotificacao(usuarioId, id);
        if (!result.error) {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }
      } catch {}
    },
    [usuarioId],
  );

  // ==================== DELETAR SELECIONADAS ====================
  const deleteSelectedNotifications = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;

      const result = await deletarNotificacoesSelecionadas(usuarioId, ids);
      if (!result.error) {
        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      } else {
        throw new Error(result.message);
      }
    },
    [usuarioId],
  );

  // ==================== MARCAR COMO LIDA ====================
  const markAsRead = useCallback(async (id: string) => {
    const result = await marcarNotificacaoComoLida(id);
    if (!result.error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
      );
    }
  }, []);

  // ==================== MARCAR SELECIONADAS COMO LIDAS ====================
  const markSelectedAsRead = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;

      const result = await marcarTodasNotificacoesComoLidas(usuarioId, ids);
      if (!result.error) {
        setNotifications((prev) =>
          prev.map((n) => (ids.includes(n.id) ? { ...n, lida: true } : n)),
        );
      } else {
        throw new Error(result.message);
      }
    },
    [usuarioId],
  );

  // ==================== CONECTAR SSE ====================
  const connect = useCallback(() => {
    if (
      eventSourceRef.current?.readyState === EventSource.OPEN ||
      !usuarioId ||
      typeof window === 'undefined'
    )
      return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const eventSource = new EventSource(
      `${apiUrlRef.current}/petrocarga/notificacoes/stream`,
      { withCredentials: true },
    );

    eventSourceRef.current = eventSource;

    const handleIncoming = (data: string | null) => {
      if (!data) return;
      try {
        const parsed = JSON.parse(data.trim());
        addNotification({
          id: parsed.id,
          titulo: parsed.titulo,
          mensagem: parsed.mensagem,
          tipo: parsed.tipo,
          lida: parsed.lida ?? false,
          criadaEm: parsed.criadaEm,
          metadata: parsed.metadata,
        });
      } catch {}
    };

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      retryCountRef.current = 0;
      loadHistorico(true);
    };

    eventSource.onmessage = (e) => handleIncoming(e.data);
    eventSource.addEventListener('notificacao', (e) =>
      handleIncoming((e as MessageEvent).data),
    );

    eventSource.onerror = () => {
      setIsConnected(false);
      setError('Conexão com servidor de notificações perdida');
      eventSource.close();
      eventSourceRef.current = null;

      if (autoReconnect && retryCountRef.current < reconnectMaxAttempts) {
        retryCountRef.current += 1;
        const delay = Math.min(
          reconnectInitialDelayMs *
            Math.pow(2, retryCountRef.current - 1),
          reconnectMaxDelayMs,
        );

        reconnectTimerRef.current = window.setTimeout(connect, delay);
      }
    };
  }, [
    usuarioId,
    addNotification,
    autoReconnect,
    reconnectMaxAttempts,
    reconnectInitialDelayMs,
    reconnectMaxDelayMs,
    loadHistorico,
  ]);

  // ==================== DESCONECTAR SSE ====================
  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    retryCountRef.current = 0;
    setIsConnected(false);
  }, []);

  // ==================== EFEITO INICIAL (CARREGAR HISTÓRICO) ====================
  useEffect(() => {
    if (usuarioId && !hasLoadedInitialRef.current) {
      hasLoadedInitialRef.current = true;
      loadHistorico();
    }
  }, [usuarioId, loadHistorico]);

  // ==================== EFEITO (CONECTAR SSE) ====================
  useEffect(() => {
    if (!usuarioId) return;

    connect();
    return disconnect;
  }, [usuarioId, connect, disconnect]);

  // ==================== REFRESH NOTIFICAÇÕES ====================
  const refreshNotifications = useCallback(
    async () => loadHistorico(),
    [loadHistorico],
  );

  // ==================== RECONECTAR ====================
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 500);
  }, [connect, disconnect]);

  // ==================== MEMOIZED VALUE ====================
  const contextValue = useMemo(
    () => ({
      notifications,
      isConnected,
      isLoading,
      error,
      addNotification,
      removeNotification,
      markAsRead,
      markSelectedAsRead,
      deleteSelectedNotifications,
      loadHistorico,
      refreshNotifications,
      reconnect,
    }),
    [
      notifications,
      isConnected,
      isLoading,
      error,
      addNotification,
      removeNotification,
      markAsRead,
      markSelectedAsRead,
      deleteSelectedNotifications,
      loadHistorico,
      refreshNotifications,
      reconnect,
    ],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * @hook useNotifications
 * @description Hook para acessar o contexto de notificações
 * Retorna objeto padrão se usado fora do provider (não lança erro)
 */
export function useNotifications() {
  return (
    useContext(NotificationContext) ?? {
      notifications: [],
      isConnected: false,
      isLoading: false,
      error: null,
      addNotification: () => {},
      removeNotification: async () => {},
      markAsRead: async () => {},
      markSelectedAsRead: async () => {},
      deleteSelectedNotifications: async () => {},
      loadHistorico: async () => {},
      refreshNotifications: async () => {},
      reconnect: () => {},
    }
  );
}