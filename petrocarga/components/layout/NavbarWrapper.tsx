'use client';

import { useAuth } from '@/components/hooks/useAuth';
import { PrivateNavbar } from '@/components/layout/PrivateNavbar';
import { PublicNavbar } from '@/components/layout/PublicNavbar';

export function NavbarWrapper() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <PrivateNavbar /> : <PublicNavbar />;
}
