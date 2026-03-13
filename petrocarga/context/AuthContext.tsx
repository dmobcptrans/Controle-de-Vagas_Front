'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, TOKEN_KEY } from '@/service/api';
import { atualizarStatusPushToken } from '@/lib/api/notificacaoApi';

interface UserData {
  id: string;
  nome: string;
  login: string;
  permissao: 'ADMIN' | 'GESTOR' | 'MOTORISTA' | 'AGENTE';
}

function normalizeUserData(data: Record<string, unknown>): UserData {
  return {
    id: String(data.id ?? ''),
    nome: String(data.nome ?? ''),
    login: String(data.login ?? data.email ?? ''),
    permissao: (data.permissao as UserData['permissao']) ?? 'MOTORISTA',
  };
}

interface AuthContextData {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  login: (data: { login: string; senha: string }) => Promise<UserData>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem(TOKEN_KEY)) {
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await api.get('/petrocarga/auth/me');
      setUser(normalizeUserData(response.data));
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const identificarTipoLogin = useCallback(
    (identificador: string): 'email' | 'cpf' | 'invalido' => {
      if (!identificador.trim()) return 'invalido';

      const apenasNumeros = identificador.replace(/\D/g, '');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailRegex.test(identificador)) {
        return 'email';
      } else if (apenasNumeros.length === 11 && /^\d+$/.test(identificador)) {
        return 'cpf';
      } else if (apenasNumeros.length > 0 && /^\d+$/.test(identificador)) {
        return 'cpf';
      }

      return 'invalido';
    },
    [],
  );

  const login = useCallback(
    async ({
      login: identificador,
      senha,
    }: {
      login: string;
      senha: string;
    }) => {
      try {
        const tipo = identificarTipoLogin(identificador);

        if (tipo === 'invalido') {
          throw new Error(
            'Formato inválido. Use email ou CPF (apenas números)',
          );
        }

        const dadosLogin =
          tipo === 'email'
            ? {
                email: identificador.trim().toLowerCase(),
                senha,
              }
            : {
                cpf: identificador.replace(/\D/g, ''),
                senha,
              };

        const loginResponse = await api.post('/petrocarga/auth/login', dadosLogin);
        const { usuario, token } = loginResponse.data as { usuario: Record<string, unknown>; token: string };

        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }

        const userData = normalizeUserData(usuario);
        setUser(userData);
        return userData;
      } catch (error: any) {
        console.error('Erro no login:', error);

        let mensagemErro = 'Credenciais inválidas ou conta não ativada.';

        if (error.response?.data?.message) {
          const backendMessage = String(
            error.response.data.message,
          ).toLowerCase();

          if (backendMessage.includes('cpf')) {
            mensagemErro = 'CPF inválido. Verifique o formato.';
          } else if (backendMessage.includes('email')) {
            mensagemErro = 'Email inválido. Verifique o formato.';
          } else if (
            backendMessage.includes('senha') ||
            backendMessage.includes('password')
          ) {
            mensagemErro = 'Senha incorreta.';
          } else if (
            backendMessage.includes('formato') ||
            backendMessage.includes('format')
          ) {
            mensagemErro =
              'Formato inválido. Use email ou CPF (apenas números).';
          } else if (
            backendMessage.includes('desativado') ||
            backendMessage.includes('inativo')
          ) {
            mensagemErro = 'Usuário desativado.';
          } else {
            mensagemErro = error.response.data.message || mensagemErro;
          }
        } else if (error.response?.status === 400) {
          mensagemErro = 'Erro na requisição. Verifique seus dados.';
        } else if (error.response?.status === 401) {
          mensagemErro = 'CPF/Email ou senha incorretos.';
        } else if (error.response?.status === 403) {
          mensagemErro =
            'Conta não ativada. Por favor, ative sua conta primeiro.';
        } else if (error.response?.status === 404) {
          mensagemErro = 'Usuário não encontrado. Verifique seu CPF/Email.';
        }

        throw new Error(mensagemErro);
      }
    },
    [identificarTipoLogin],
  );

  const logout = useCallback(async () => {
  const pushToken = localStorage.getItem('pushToken');
  try {
    if (pushToken && user?.id) {
      await atualizarStatusPushToken(user.id, pushToken, false);
    }
    await api.post('/petrocarga/auth/logout');
  } catch (error) {
    console.error('Erro ao notificar logout', error);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push('/autorizacao/login');
  }
}, [router, user]);

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
