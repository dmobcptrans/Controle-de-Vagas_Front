'use client';

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import { useRouter } from 'next/navigation';

import type { Usuario } from '@/lib/types/personas/user';

import type {
  AuthContextData,
  LoginData,
} from '../types/auth';

import {
  login as loginService,
  loginWithGoogle as loginWithGoogleService,
  getCurrentUser,
  logout as logoutService,
} from "../service/authService";

import {
  getAuthErrorMessage,
} from '../utils/authError';

export const AuthContext =
  createContext<AuthContextData | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();

      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (data: LoginData) => {
      try {
        setLoading(true);

        const authenticatedUser =
          await loginService(data);

        setUser(authenticatedUser);

        return authenticatedUser;
      } catch (error: unknown) {
        throw new Error(
          getAuthErrorMessage(error),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(
    async (googleToken: string) => {
      try {
        setLoading(true);

        const authenticatedUser =
          await loginWithGoogleService(
            googleToken,
          );

        setUser(authenticatedUser);

        return authenticatedUser;
      } catch (error: unknown) {
        throw new Error(
          getAuthErrorMessage(error),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error(
        'Erro ao realizar logout:',
        error,
      );
    } finally {
      setUser(null);
      router.push('/autorizacao/login');
    }
  }, [router]);

  const value = useMemo<AuthContextData>(
    () => ({
      isAuthenticated: !!user,
      user,
      loading,
      login,
      loginWithGoogle,
      logout,
      refreshUser,
    }),
    [
      user,
      loading,
      login,
      loginWithGoogle,
      logout,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}