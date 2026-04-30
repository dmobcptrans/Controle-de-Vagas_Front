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
import type {
  Notification as AppNotification,
  NotificationContextData,
  NotificationProviderProps,
} from '@/lib/types/notificacao';

// Contexto
const NotificationContext = createContext<NotificationContextData | undefined>(
  undefined,
);

/**
 * @component NotificationProvider
 * @version 2.0.0
 */
export function NotificationProvider({
  children,
  usuarioId,
  maxNotifications = 50,
  pageSize = 10,
  enableSSE = true,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElementos, setTotalElementos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [podeCarregarMais, setPodeCarregarMais] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const hasLoadedInitialRef = useRef(false);
  const apiUrlRef = useRef(process.env.NEXT_PUBLIC_API_URL || '');
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);

  // ==================== CARREGAR HISTÓRICO (PRIMEIRA PÁGINA) ====================
  const loadHistorico = useCallback(
    async (silent = false) => {
      if (!usuarioId) return;

      if (!silent) setIsLoading(true);
      setError(null);

      try {
        const result = await getNotificacoesUsuario(
          usuarioId,
          undefined,
          0,
          pageSize,
        );

        if (result.error) {
          setError(result.message || 'Erro ao carregar notificações');
          setNotifications([]);
          setTotalElementos(0);
          setTotalPaginas(0);
          setPaginaAtual(0);
          setPodeCarregarMais(false);
          return;
        }

        if (result.data) {
          const novasNotificacoes = result.data.content || [];

          const notificacoesOrdenadas = [...novasNotificacoes].sort(
            (a, b) =>
              new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime(),
          );

          setNotifications(notificacoesOrdenadas.slice(0, maxNotifications));
          setTotalElementos(result.data.totalElementos);
          setTotalPaginas(result.data.totalPaginas);
          setPaginaAtual(result.data.pagina);
          setPodeCarregarMais(
            result.data.pagina + 1 < result.data.totalPaginas,
          );
          setError(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar notificações',
        );
        setNotifications([]);
        setTotalElementos(0);
        setTotalPaginas(0);
        setPaginaAtual(0);
        setPodeCarregarMais(false);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [usuarioId, maxNotifications, pageSize],
  );

  // ==================== CARREGAR MAIS NOTIFICAÇÕES ====================
  const carregarMais = useCallback(async () => {
    if (!usuarioId || isLoadingMore || !podeCarregarMais) return;

    const proximaPagina = paginaAtual + 1;
    if (proximaPagina >= totalPaginas) return;

    setIsLoadingMore(true);

    try {
      const result = await getNotificacoesUsuario(
        usuarioId,
        undefined,
        proximaPagina,
        pageSize,
      );

      if (result.error) {
        setError(result.message || 'Erro ao carregar mais notificações');
        return;
      }

      if (result.data) {
        const novasNotificacoes = result.data.content || [];

        setNotifications((prev) => {
          const novas = [...prev];
          for (const notif of novasNotificacoes) {
            if (!novas.some((n) => n.id === notif.id)) {
              novas.push(notif);
            }
          }
          return novas
            .sort(
              (a, b) =>
                new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime(),
            )
            .slice(0, maxNotifications);
        });

        setPaginaAtual(result.data.pagina);
        setPodeCarregarMais(result.data.pagina + 1 < result.data.totalPaginas);
        setError(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar mais notificações',
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    usuarioId,
    paginaAtual,
    totalPaginas,
    podeCarregarMais,
    isLoadingMore,
    maxNotifications,
    pageSize,
  ]);

  // ==================== ADICIONAR NOTIFICAÇÃO ====================
  const addNotification = useCallback(
    (notification: AppNotification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        const novas = [notification, ...prev];
        setTotalElementos((prevTotal) => prevTotal + 1);
        return novas.slice(0, maxNotifications);
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
          setTotalElementos((prev) => Math.max(0, prev - 1));
        }
      } catch {
        // Silencia erro
      }
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
        setTotalElementos((prev) => Math.max(0, prev - ids.length));
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
    if (!usuarioId || typeof window === 'undefined') {
      return;
    }

    const baseUrl = apiUrlRef.current || process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      setError('URL da API não configurada');
      return;
    }

    const url = `${baseUrl}/petrocarga/notificacoes/stream`;

    let isActive = true;

    const handleIncoming = (data: string) => {
      if (!data) return;

      try {
        const parsed = JSON.parse(data.trim());

        const notification: AppNotification = {
          id: parsed.id,
          titulo: parsed.titulo,
          mensagem: parsed.mensagem,
          tipo: parsed.tipo,
          lida: parsed.lida ?? false,
          criadaEm: parsed.criadaEm,
          metadata: parsed.metadata || {},
        };

        addNotification(notification);
      } catch {
        // ignora parse inválido (heartbeat etc)
      }
    };

    fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        Accept: 'text/event-stream',
      },
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error('Erro na conexão SSE');
        }

        setIsConnected(true);
        setError(null);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let buffer = '';

        while (isActive) {
          const { value, done } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const lines = part.split('\n');

            let data = '';

            for (const line of lines) {
              if (line.startsWith('data:')) {
                data += line.replace('data:', '').trim();
              }
            }

            if (data) {
              handleIncoming(data);
            }
          }
        }
      })
      .catch(() => {
        setIsConnected(false);
        setError('Erro ao conectar com servidor de notificações');
      });

    return () => {
      isActive = false;
      setIsConnected(false);
    };
  }, [usuarioId, addNotification]);

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

  // ==================== EFEITO INICIAL ====================
  useEffect(() => {
    if (usuarioId && !hasLoadedInitialRef.current) {
      hasLoadedInitialRef.current = true;
      loadHistorico();
    }
  }, [usuarioId, loadHistorico]);

  // ==================== EFEITO CONECTAR SSE ====================
  useEffect(() => {
    if (!usuarioId || !enableSSE) return;

    connect();
    return disconnect;
  }, [usuarioId, enableSSE, connect, disconnect]);

  // ==================== REFRESH ====================
  const refreshNotifications = useCallback(async () => {
    await loadHistorico();
  }, [loadHistorico]);

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
      isLoadingMore,
      error,
      totalElementos,
      totalPaginas,
      paginaAtual,
      podeCarregarMais,
      addNotification,
      removeNotification,
      markAsRead,
      markSelectedAsRead,
      deleteSelectedNotifications,
      loadHistorico,
      carregarMais,
      refreshNotifications,
      reconnect,
    }),
    [
      notifications,
      isConnected,
      isLoading,
      isLoadingMore,
      error,
      totalElementos,
      totalPaginas,
      paginaAtual,
      podeCarregarMais,
      addNotification,
      removeNotification,
      markAsRead,
      markSelectedAsRead,
      deleteSelectedNotifications,
      loadHistorico,
      carregarMais,
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
 */
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    return {
      notifications: [] as AppNotification[],
      isConnected: false,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      totalElementos: 0,
      totalPaginas: 0,
      paginaAtual: 0,
      podeCarregarMais: false,
      addNotification: () => {},
      removeNotification: async () => {},
      markAsRead: async () => {},
      markSelectedAsRead: async () => {},
      deleteSelectedNotifications: async () => {},
      loadHistorico: async () => {},
      carregarMais: async () => {},
      refreshNotifications: async () => {},
      reconnect: () => {},
    };
  }

  return context;
}
