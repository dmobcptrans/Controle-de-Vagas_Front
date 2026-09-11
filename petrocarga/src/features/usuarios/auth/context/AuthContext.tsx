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

import type {
  LoginWithGooglePayload,
  AuthMeResponse,
} from '../types/auth2';

import type { AuthContextData } from '../types/authContext';

import {
  login as loginService,
  loginWithGoogle as loginWithGoogleService,
  getCurrentUser,
  logout as logoutService,
} from '../service/authService';

import { getAuthErrorMessage } from '../utils/authError';
import { LoginFormData } from '../utils/loginUtils';

export const AuthContext = createContext<
  AuthContextData | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthMeResponse | null>(
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
    async (data: LoginFormData) => {
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
    async (data: LoginWithGooglePayload) => {
      try {
        setLoading(true);

        const authenticatedUser =
          await loginWithGoogleService(data);

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