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
  deleteNotificacao,
  deleteVariasNotificacoes,
  getNotificacaoStream,
  getNotificacoesDoUsuario,
  MarcarUmaNotificacaoComoLida,
  MarcarVariasNotificacoesComoLidas,
} from '@/features/notificacao/services/notificacaoApi';
import type {
  NotificacaoResponse,
  NotificacaoPaginadasResponse,
  NotificationContextData,
  NotificationProviderProps,
} from '@/features/notificacao/types/notificacao';

const NotificationContext = createContext<NotificationContextData | undefined>(
  undefined,
);

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const ordenarPorData = (lista: NotificacaoResponse[]) =>
  [...lista].sort(
    (a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime(),
  );

/**
 * @component NotificationProvider
 * @version 3.1.0
 */
export function NotificationProvider({
  children,
  usuarioId,
  maxNotifications = 50,
  pageSize = 10,
  enableSSE = true,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificacaoResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElementos, setTotalElementos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [podeCarregarMais, setPodeCarregarMais] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // espelho do estado, para checar duplicatas fora do updater do setState
  const notificationsRef = useRef<NotificacaoResponse[]>([]);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const resetPaginacao = useCallback(() => {
    setNotifications([]);
    setTotalElementos(0);
    setTotalPaginas(0);
    setPaginaAtual(0);
    setPodeCarregarMais(false);
  }, []);

  const aplicarPagina = useCallback((page: NotificacaoPaginadasResponse) => {
    setTotalElementos(page.totalElementos);
    setTotalPaginas(page.totalPaginas);
    setPaginaAtual(page.pagina);
    setPodeCarregarMais(page.pagina + 1 < page.totalPaginas);
  }, []);

  // ==================== CARREGAR HISTÓRICO (PRIMEIRA PÁGINA) ====================
  const loadHistorico = useCallback(
    async (silent = false) => {
      if (!usuarioId) return;

      if (!silent) setIsLoading(true);
      setError(null);

      try {
        const page = await getNotificacoesDoUsuario(
          { numeroPagina: 0, tamanhoPagina: pageSize },
          usuarioId,
        );

        setNotifications(
          ordenarPorData(page.content ?? []).slice(0, maxNotifications),
        );
        aplicarPagina(page);
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao carregar notificações'));
        resetPaginacao();
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [usuarioId, maxNotifications, pageSize, aplicarPagina, resetPaginacao],
  );

  // ==================== CARREGAR MAIS ====================
  const carregarMais = useCallback(async () => {
    if (!usuarioId || isLoadingMore || !podeCarregarMais) return;

    const proximaPagina = paginaAtual + 1;
    if (proximaPagina >= totalPaginas) return;

    setIsLoadingMore(true);

    try {
      const page = await getNotificacoesDoUsuario(
        { numeroPagina: proximaPagina, tamanhoPagina: pageSize },
        usuarioId,
      );

      setNotifications((prev) => {
        const novas = [...prev];
        for (const notif of page.content ?? []) {
          if (!novas.some((n) => n.id === notif.id)) novas.push(notif);
        }
        return ordenarPorData(novas).slice(0, maxNotifications);
      });

      setPaginaAtual(page.pagina);
      setPodeCarregarMais(page.pagina + 1 < page.totalPaginas);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar mais notificações'));
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

  // ==================== ADICIONAR (SSE) ====================
  const addNotification = useCallback(
    (notification: NotificacaoResponse) => {
      if (notificationsRef.current.some((n) => n.id === notification.id)) {
        return;
      }

      setNotifications((prev) =>
        prev.some((n) => n.id === notification.id)
          ? prev
          : [notification, ...prev].slice(0, maxNotifications),
      );
      setTotalElementos((t) => t + 1);
    },
    [maxNotifications],
  );

  // ==================== REMOVER ====================
  const removeNotification = useCallback(
    async (id: string) => {
      if (!usuarioId) return;
      try {
        await deleteNotificacao(id, usuarioId);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setTotalElementos((prev) => Math.max(0, prev - 1));
      } catch {
        // silencia erro
      }
    },
    [usuarioId],
  );

  // ==================== DELETAR SELECIONADAS ====================
  const deleteSelectedNotifications = useCallback(
    async (ids: string[]) => {
      if (!usuarioId || ids.length === 0) return;

      await deleteVariasNotificacoes(ids, usuarioId); // lança erro se falhar
      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      setTotalElementos((prev) => Math.max(0, prev - ids.length));
    },
    [usuarioId],
  );

  // ==================== MARCAR COMO LIDA ====================
  const markAsRead = useCallback(async (id: string) => {
    try {
      await MarcarUmaNotificacaoComoLida(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
      );
    } catch {
      // silencia erro
    }
  }, []);

  // ==================== MARCAR SELECIONADAS COMO LIDAS ====================
  const markSelectedAsRead = useCallback(
    async (ids: string[]) => {
      if (!usuarioId || ids.length === 0) return;

      await MarcarVariasNotificacoesComoLidas(ids, usuarioId); // lança erro se falhar
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, lida: true } : n)),
      );
    },
    [usuarioId],
  );

  // ==================== DESCONECTAR SSE ====================
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    setIsConnected(false);
  }, []);

  // ==================== CONECTAR SSE ====================
  const connect = useCallback(() => {
    if (!usuarioId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const handleIncoming = (data: string) => {
      try {
        const parsed = JSON.parse(data.trim());

        addNotification({
          id: parsed.id,
          usuarioId: parsed.usuarioId ?? usuarioId,
          titulo: parsed.titulo,
          mensagem: parsed.mensagem,
          tipo: parsed.tipo,
          lida: parsed.lida ?? false,
          criadaEm: parsed.criadaEm,
          metadata: parsed.metadata || {},
        });
      } catch {
        // ignora parse inválido (heartbeat etc)
      }
    };

    (async () => {
      try {
        const response = await getNotificacaoStream();

        if (!response.body) throw new Error('Erro na conexão SSE');

        setIsConnected(true);
        setError(null);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            let data = '';
            for (const line of part.split('\n')) {
              if (line.startsWith('data:')) {
                data += line.replace('data:', '').trim();
              }
            }
            if (data) handleIncoming(data);
          }
        }

        if (!controller.signal.aborted) setIsConnected(false);
      } catch {
        if (controller.signal.aborted) return; // desconexão intencional
        setIsConnected(false);
        setError('Erro ao conectar com servidor de notificações');
      }
    })();
  }, [usuarioId, addNotification]);

  // ==================== EFEITOS ====================
  useEffect(() => {
    if (!usuarioId) {
      resetPaginacao();
      return;
    }
    loadHistorico();
  }, [usuarioId, loadHistorico, resetPaginacao]);

  useEffect(() => {
    if (!usuarioId || !enableSSE) return;

    connect();
    return disconnect;
  }, [usuarioId, enableSSE, connect, disconnect]);

  const refreshNotifications = useCallback(async () => {
    await loadHistorico();
  }, [loadHistorico]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectTimerRef.current = setTimeout(connect, 500);
  }, [connect, disconnect]);

  useEffect(() => {
    console.debug('[SSE] isConnected =', isConnected);
  }, [isConnected]);

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

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    return {
      notifications: [] as NotificacaoResponse[],
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
