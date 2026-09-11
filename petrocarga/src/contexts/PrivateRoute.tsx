'use client';

import { useEffect } from 'react';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { useRouter } from 'next/navigation';
import AuthSkeleton from '@/components/ui/AuthSkeleton';

type Role = 'ADMIN' | 'GESTOR' | 'MOTORISTA' | 'AGENTE' | 'EMPRESA';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * @component PrivateRoute
 * @version 1.0.0
 *
 * @description Componente de proteção de rotas baseado em autenticação e permissões.
 * Redireciona usuários não autenticados ou sem permissão para a página de login.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Verifica se usuário está autenticado via useAuth
 *    - Se não autenticado: redireciona para /autorizacao/login
 *
 * 2. AUTORIZAÇÃO:
 *    - Verifica se usuário tem permissão adequada (allowedRoles)
 *    - Se não tem permissão: redireciona para /autorizacao/login
 *
 * 3. CARREGAMENTO:
 *    - Aguarda o carregamento da autenticação antes de decidir
 *    - Durante loading, não renderiza conteúdo e não redireciona
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - LOADING STATE: Aguarda o carregamento para evitar redirecionamentos prematuros
 * - USE_EFFECT: Executa após montagem e quando dependências mudam
 * - REDIRECIONAMENTO CONDICIONAL: Apenas após loading finalizar
 * - FALLBACK: Retorna null quando não autenticado ou sem permissão
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - useAuth: Hook de autenticação
 * - useRouter: Hook de navegação do Next.js
 *
 * @example
 * ```tsx
 * // Proteger rota apenas para motoristas
 * <PrivateRoute allowedRoles={['MOTORISTA']}>
 *   <MotoristaDashboard />
 * </PrivateRoute>
 *
 * // Proteger rota para qualquer usuário autenticado (sem restrição de permissão)
 * <PrivateRoute>
 *   <PerfilUsuario />
 * </PrivateRoute>
 * ```
 */

export default function PrivateRoute({
  children,
  allowedRoles,
}: PrivateRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/autorizacao/login');
        return;
      }

      if (
        allowedRoles &&
        user &&
        !allowedRoles.includes(user.permissao)
      ) {
        router.push('/autorizacao/login');
      }
    }
  }, [
    loading,
    isAuthenticated,
    user,
    allowedRoles,
    router,
  ]);


  // Aguarda autenticação
  if (loading) {
    return <AuthSkeleton/>
  }


  // Usuário não autenticado
  if (!isAuthenticated) {
    return null;
  }


  // Sem permissão
  if (
    allowedRoles &&
    user &&
    !allowedRoles.includes(user.permissao)
  ) {
    return null;
  }


  return <>{children}</>;
}