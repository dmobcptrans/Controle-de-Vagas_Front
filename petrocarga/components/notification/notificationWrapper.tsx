'use client';

import { useAuth } from '@/context/AuthContext'; // Use o hook correto
import { NotificationProvider } from '@/context/NotificationContext';
import { ReactNode } from 'react';

interface NotificationWrapperProps {
  children: ReactNode;
}

/**
 * @component NotificationWrapper
 * @version 1.0.0
 * 
 * @description Componente wrapper que condicionalmente fornece o contexto de notificações.
 * Apenas usuários autenticados recebem o provider, garantindo eficiência e evitando
 * conexões desnecessárias.
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. VERIFICAÇÃO DE AUTENTICAÇÃO:
 *    - Se está carregando (loading): renderiza children sem provider
 *    - Se não autenticado: renderiza children sem provider
 *    - Se autenticado com user.id: renderiza children com NotificationProvider
 * 
 * 2. CONFIGURAÇÃO DO PROVIDER:
 *    - usuarioId: ID do usuário autenticado
 *    - maxNotifications: 50 (máximo de notificações em memória)
 *    - enableSSE: true (habilita Server-Sent Events para tempo real)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - PROVIDER CONDICIONAL: Evita conexões WebSocket desnecessárias
 * - CARREGAMENTO: Durante loading, não bloqueia renderização
 * - REUTILIZAÇÃO: Pode envolver toda a aplicação ou rotas específicas
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useAuth: Hook de autenticação
 * - NotificationProvider: Contexto de notificações (WebSocket)
 * 
 * @example
 * ```tsx
 * // Uso no layout raiz
 * export default function RootLayout({ children }) {
 *   return (
 *     <NotificationWrapper>
 *       {children}
 *     </NotificationWrapper>
 *   );
 * }
 * 
 * // Uso em layout específico
 * export default function Layout({ children }) {
 *   return (
 *     <NotificationWrapper>
 *       <Navbar />
 *       <main>{children}</main>
 *       <Footer />
 *     </NotificationWrapper>
 *   );
 * }
 * ```
 */

export function NotificationWrapper({ children }: NotificationWrapperProps) {
  const { isAuthenticated, user, loading } = useAuth(); // Use o hook

  // Durante o carregamento, renderiza children sem provider
  if (loading) {
    return <>{children}</>;
  }

  // Se não autenticado, renderiza children sem provider
  if (!isAuthenticated || !user?.id) {
    return <>{children}</>;
  }

  // Autenticado: fornece contexto de notificações
  return (
    <NotificationProvider
      usuarioId={user.id}
      maxNotifications={50}
      enableSSE={true}
    >
      {children}
    </NotificationProvider>
  );
}