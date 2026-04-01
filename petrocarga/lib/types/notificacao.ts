import { ReactNode } from 'react';

/**
 * @module types/notification
 * @description Definições de tipos TypeScript para o módulo de Notificações.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Notification - Estrutura de uma notificação individual
 * 2. PaginatedNotificationResponse - Resposta paginada da API
 * 3. NotificationContextData - Dados e funções do contexto
 * 4. NotificationProviderProps - Propriedades do provider
 */

/**
 * @type Notification
 * @description Representa uma notificação individual no sistema.
 *
 * @property {string} id - Identificador único da notificação
 * @property {string} titulo - Título curto da notificação
 * @property {string} mensagem - Conteúdo detalhado da mensagem
 *
 * @property {'RESERVA' | 'VAGA' | 'VEICULO' | 'MOTORISTA' | 'SISTEMA'} tipo - Tipo da notificação
 *   - RESERVA: Relacionada a reservas
 *   - VAGA: Relacionada a vagas
 *   - VEICULO: Relacionada a veículos
 *   - MOTORISTA: Relacionada a motoristas
 *   - SISTEMA: Notificações do sistema
 *
 * @property {boolean} lida - Indica se a notificação já foi lida
 * @property {string} criadaEm - Data de criação (ISO string)
 * @property {Record<string, unknown>} metadata - Metadados adicionais (flexível)
 *
 * @example
 * ```ts
 * const notification: Notification = {
 *   id: 'notif123',
 *   titulo: 'Reserva Confirmada',
 *   mensagem: 'Sua reserva para a vaga Md-1234 foi confirmada',
 *   tipo: 'RESERVA',
 *   lida: false,
 *   criadaEm: '2024-01-15T10:30:00Z',
 *   metadata: {
 *     vagaId: 'vaga123',
 *     reservaId: 'res456'
 *   }
 * };
 * ```
 */
export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'RESERVA' | 'VAGA' | 'VEICULO' | 'MOTORISTA' | 'SISTEMA';
  lida: boolean;
  criadaEm: string;
  metadata: Record<string, unknown>;
}

/**
 * @interface PaginatedNotificationResponse
 * @description Resposta paginada da API de Notificações conforme Swagger
 *
 * @property {Notification[]} content - Lista de notificações da página atual
 * @property {number} totalElementos - Total de elementos no backend
 * @property {number} totalPaginas - Total de páginas disponíveis
 * @property {number} tamanhoPagina - Tamanho da página (itens por página)
 * @property {number} pagina - Número da página atual (0-indexed)
 */
export interface PaginatedNotificationResponse {
  content: Notification[];
  totalElementos: number;
  totalPaginas: number;
  tamanhoPagina: number;
  pagina: number;
}

/**
 * @interface NotificationContextData
 * @description Dados e funções disponíveis através do contexto de notificações.
 *
 * ----------------------------------------------------------------------------
 * 📊 DADOS
 * ----------------------------------------------------------------------------
 * @property {Notification[]} notifications - Lista de notificações atuais
 * @property {boolean} isConnected - Status da conexão SSE
 * @property {boolean} isLoading - Estado de carregamento inicial
 * @property {boolean} isLoadingMore - Estado de carregamento de mais itens
 * @property {string | null} error - Mensagem de erro (se houver)
 * @property {number} totalElementos - Total de notificações no backend
 * @property {number} totalPaginas - Total de páginas disponíveis
 * @property {number} paginaAtual - Página atual carregada (0-indexed)
 * @property {boolean} podeCarregarMais - Indica se há mais páginas para carregar
 *
 * ----------------------------------------------------------------------------
 * ✏️ AÇÕES BÁSICAS
 * ----------------------------------------------------------------------------
 * @property {function} addNotification - Adiciona uma nova notificação manualmente
 * @property {function} removeNotification - Remove uma notificação específica
 * @property {function} markAsRead - Marca uma notificação como lida
 *
 * ----------------------------------------------------------------------------
 * 📦 AÇÕES EM LOTE
 * ----------------------------------------------------------------------------
 * @property {function} markSelectedAsRead - Marca múltiplas notificações como lidas
 * @property {function} deleteSelectedNotifications - Remove múltiplas notificações
 *
 * ----------------------------------------------------------------------------
 * 🔄 SINCRONIZAÇÃO COM PAGINAÇÃO
 * ----------------------------------------------------------------------------
 * @property {function} loadHistorico - Carrega histórico (primeira página)
 * @property {function} carregarMais - Carrega a próxima página de notificações
 * @property {function} refreshNotifications - Atualiza lista de notificações
 * @property {function} reconnect - Reconecta ao serviço SSE
 *
 * @example
 * ```tsx
 * function NotificationComponent() {
 *   const { 
 *     notifications, 
 *     isLoading, 
 *     isLoadingMore,
 *     totalElementos,
 *     podeCarregarMais,
 *     carregarMais,
 *     markAsRead 
 *   } = useNotifications();
 *
 *   return (
 *     <div>
 *       {notifications.map(n => (
 *         <div key={n.id} onClick={() => markAsRead(n.id)}>
 *           {n.titulo}
 *         </div>
 *       ))}
 *       {isLoadingMore && <Spinner />}
 *       {podeCarregarMais && (
 *         <button onClick={carregarMais}>Carregar mais</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export interface NotificationContextData {
  // Dados
  notifications: Notification[];
  isConnected: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  totalElementos: number;
  totalPaginas: number;
  paginaAtual: number;
  podeCarregarMais: boolean;

  // Ações básicas
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;

  // Ações em lote
  markSelectedAsRead: (ids: string[]) => Promise<void>;
  deleteSelectedNotifications: (ids: string[]) => Promise<void>;

  // Sincronização com paginação
  loadHistorico: () => Promise<void>;
  carregarMais: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  reconnect: () => void;
}

/**
 * @interface NotificationProviderProps
 * @description Propriedades para o componente NotificationProvider.
 *
 * @property {ReactNode} children - Componentes filhos
 * @property {string} usuarioId - ID do usuário para filtrar notificações
 *
 * @property {number} [maxNotifications=100] - Número máximo de notificações em memória
 * @property {number} [pageSize=10] - Tamanho da página para paginação
 *
 * @property {boolean} [enableSSE=true] - Habilita Server-Sent Events
 * @property {boolean} [autoReconnect=true] - Tenta reconectar automaticamente
 * @property {number} [reconnectMaxAttempts=5] - Máximo de tentativas de reconexão
 * @property {number} [reconnectInitialDelayMs=1000] - Delay inicial da reconexão (ms)
 * @property {number} [reconnectMaxDelayMs=30000] - Delay máximo da reconexão (ms)
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <NotificationProvider
 *       usuarioId="user123"
 *       maxNotifications={50}
 *       pageSize={10}
 *       enableSSE={true}
 *       autoReconnect={true}
 *       reconnectMaxAttempts={10}
 *     >
 *       <MyComponent />
 *     </NotificationProvider>
 *   );
 * }
 * ```
 */
export interface NotificationProviderProps {
  children: ReactNode;
  usuarioId: string;
  maxNotifications?: number;
  pageSize?: number;
  enableSSE?: boolean;
  autoReconnect?: boolean;
  reconnectMaxAttempts?: number;
  reconnectInitialDelayMs?: number;
  reconnectMaxDelayMs?: number;
}