import { Paginacao } from '@/lib/types/paginacao';
import type { ReactNode } from 'react';

export type TipoNotificacao =
  | 'RESERVA'
  | 'VAGA'
  | 'VEICULO'
  | 'MOTORISTA'
  | 'SISTEMA'
  | 'DENUNCIA';

export type TipoPlataforma = 'ANDROID' | 'IOS' | 'WEB';

export type NotificacaoParam = {
  lida?: boolean;
  numeroPagina?: number;
  tamanhoPagina?: number;
};

export type NotificacaoPayload = {
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
};

export type PushTokenPayload = {
  token: string;
  plataforma: TipoPlataforma;
};

export type AtualizaPushTokenPayload = {
  token: string;
  ativo: boolean;
};

export type NotificacaoResponse = {
  id: string;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  lida: boolean;
  criadaEm: string;
  metadata: Record<string, unknown>;
};

export type NotificacaoPaginadasResponse = Paginacao<NotificacaoResponse>;

export type PushTokenResponse = {
  usuarioId: string;
  token: string;
  plataforma: TipoPlataforma;
  ativo: boolean;
  criadoEm: string;
};

export type NotificationProviderProps = {
  children: ReactNode;
  usuarioId?: string;
  maxNotifications?: number;
  pageSize?: number;
  enableSSE?: boolean;
};

export type NotificationContextData = {
  notifications: NotificacaoResponse[];
  isConnected: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  totalElementos: number;
  totalPaginas: number;
  paginaAtual: number;
  podeCarregarMais: boolean;
  addNotification: (notification: NotificacaoResponse) => void;
  removeNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markSelectedAsRead: (ids: string[]) => Promise<void>;
  deleteSelectedNotifications: (ids: string[]) => Promise<void>;
  loadHistorico: (silent?: boolean) => Promise<void>;
  carregarMais: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  reconnect: () => void;
};
