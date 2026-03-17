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
 * 2. NotificationContextData - Dados e funções do contexto
 * 3. NotificationProviderProps - Propriedades do provider
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
 * @interface NotificationContextData
 * @description Dados e funções disponíveis através do contexto de notificações.
 *
 * ----------------------------------------------------------------------------
 * 📊 DADOS
 * ----------------------------------------------------------------------------
 * @property {Notification[]} notifications - Lista de notificações atuais
 * @property {boolean} isConnected - Status da conexão SSE
 * @property {boolean} isLoading - Estado de carregamento
 * @property {string | null} error - Mensagem de erro (se houver)
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
 * 🔄 SINCronização
 * ----------------------------------------------------------------------------
 * @property {function} loadHistorico - Carrega histórico de notificações
 * @property {function} refreshNotifications - Atualiza lista de notificações
 * @property {function} reconnect - Reconecta ao serviço SSE
 *
 * @example
 * ```tsx
 * function NotificationComponent() {
 *   const { notifications, markAsRead, deleteSelected } = useNotifications();
 *
 *   return (
 *     <div>
 *       {notifications.map(n => (
 *         <div key={n.id} onClick={() => markAsRead(n.id)}>
 *           {n.titulo}
 *         </div>
 *       ))}
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
  error: string | null;

  // Ações básicas
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;

  // Ações em lote
  markSelectedAsRead: (ids: string[]) => Promise<void>;
  deleteSelectedNotifications: (ids: string[]) => Promise<void>;

  // Sincronização
  loadHistorico: () => Promise<void>;
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
  enableSSE?: boolean;
  autoReconnect?: boolean;
  reconnectMaxAttempts?: number;
  reconnectInitialDelayMs?: number;
  reconnectMaxDelayMs?: number;
}
