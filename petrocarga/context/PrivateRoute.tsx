'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { useRouter } from 'next/navigation';

type Role = 'ADMIN' | 'GESTOR' | 'MOTORISTA' | 'AGENTE';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function PrivateRoute({
  children,
  allowedRoles,
}: PrivateRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Não está logado
      if (!isAuthenticated) {
        router.push('/autorizacao/login');
        return;
      }

      // Está logado, mas não tem permissão
      if (allowedRoles && user && !allowedRoles.includes(user.permissao)) {
        router.push('/autorizacao/login');
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.permissao)) {
    return null;
  }

  return <>{children}</>;
}
