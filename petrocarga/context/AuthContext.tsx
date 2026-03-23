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
import { AxiosError } from 'axios';

interface UserData {
  id: string;
  nome: string;
  login: string;
  permissao: 'ADMIN' | 'GESTOR' | 'MOTORISTA' | 'AGENTE';
  cpf?: string;
  veiculoCadastrado: boolean;
}

/**
 * @function normalizeUserData
 * @description Normaliza os dados do usuário recebidos da API
 * @param data - Dados brutos da API
 * @returns UserData normalizado
 */
function normalizeUserData(data: Record<string, unknown>): UserData {
  return {
    id: String(data.id ?? ''),
    nome: String(data.nome ?? ''),
    login: String(data.login ?? data.email ?? ''),
    permissao: (data.permissao as UserData['permissao']) ?? 'MOTORISTA',
    cpf: data.cpf ? String(data.cpf) : undefined,
    veiculoCadastrado: Boolean(data.veiculoCadastrado ?? false),
  };
}

interface AuthContextData {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  login: (data: { login: string; senha: string }) => Promise<UserData>;
  loginWithGoogle: (token: string) => Promise<UserData>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

type ApiError = {
  erro?: string;
  message?: string;
  cause?: string;
};

export const AuthContext = createContext({} as AuthContextData);

/**
 * @component AuthProvider
 * @version 1.0.0
 * 
 * @description Provider para gerenciamento de autenticação.
 * Gerencia login, logout, refresh de token e estado do usuário.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. AUTENTICAÇÃO:
 *    - login: Autenticação com email ou CPF
 *    - loginWithGoogle: Autenticação via Google OAuth
 *    - logout: Desconecta usuário e remove token
 * 
 * 2. GESTÃO DE ESTADO:
 *    - user: Dados do usuário logado
 *    - isAuthenticated: Flag de autenticação
 *    - loading: Estado de carregamento
 * 
 * 3. REFRESH:
 *    - refreshUser: Atualiza dados do usuário após login
 *    - Carregamento inicial: useEffect busca dados do usuário
 * 
 * 4. TIPOS DE LOGIN:
 *    - Identificação automática (email ou CPF)
 *    - Validação de formato
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO DO HOOK useAuth:
 * ----------------------------------------------------------------------------
 * 
 * @property {boolean} isAuthenticated - Indica se usuário está autenticado
 * @property {UserData | null} user - Dados do usuário
 * @property {boolean} loading - Estado de carregamento
 * @property {(data: { login: string; senha: string }) => Promise<UserData>} login - Função de login
 * @property {(token: string) => Promise<UserData>} loginWithGoogle - Login com Google
 * @property {() => void} logout - Função de logout
 * @property {() => Promise<void>} refreshUser - Atualiza dados do usuário
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - AUTO DETECÇÃO: identifica se input é email ou CPF
 * - TOKEN EM LOCALSTORAGE: Armazena token JWT
 * - REFRESH AUTOMÁTICO: useEffect carrega usuário na montagem
 * - CLEANUP: Remove token e notifica backend no logout
 * - TRATAMENTO DE ERRO: Mensagens amigáveis por status HTTP
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useAuth: Hook para acessar o contexto
 * - api: Instância Axios com interceptors
 * - PrivateRoute: Componente de proteção de rotas
 * 
 * @example
 * ```tsx
 * // Provider no layout
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * // Uso do hook
 * const { user, login, logout } = useAuth();
 * 
 * const handleLogin = async () => {
 *   try {
 *     await login({ login: 'joao@email.com', senha: '123456' });
 *   } catch (error) {
 *     toast.error(error.message);
 *   }
 * };
 * ```
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ==================== REFRESH USUÁRIO ====================
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/petrocarga/auth/me');
      setUser(normalizeUserData(response.data));
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== CARREGAMENTO INICIAL ====================
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ==================== IDENTIFICAR TIPO DE LOGIN ====================
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

  // ==================== LOGIN ====================
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

        const loginResponse = await api.post(
          '/petrocarga/auth/login',
          dadosLogin,
        );

        const { token } = loginResponse.data;

        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }

        setLoading(true);

        await refreshUser();

        const response = await api.get('/petrocarga/auth/me');
        return normalizeUserData(response.data);
      } catch (error: unknown) {
        console.error('Erro no login:', error);

        let mensagemErro = 'Credenciais inválidas ou conta não ativada.';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as {
            response?: {
              data?: {
                message?: unknown;
              };
              status?: number;
            };
          };

          if (
            axiosError.response?.data?.message &&
            typeof axiosError.response.data.message === 'string'
          ) {
            mensagemErro = axiosError.response.data.message;
          } else if (axiosError.response?.status) {
            switch (axiosError.response.status) {
              case 400:
                mensagemErro = 'Erro na requisição. Verifique seus dados.';
                break;
              case 401:
                mensagemErro = 'CPF/Email ou senha incorretos.';
                break;
              case 403:
                mensagemErro = 'Conta não ativada.';
                break;
              case 404:
                mensagemErro = 'Usuário não encontrado.';
                break;
            }
          }
        } else if (error instanceof Error) {
          mensagemErro = error.message;
        }

        throw new Error(mensagemErro);
      }
    },
    [identificarTipoLogin, refreshUser],
  );

  // ==================== LOGIN COM GOOGLE ====================
  const loginWithGoogle = useCallback(
    async (googleToken: string) => {
      try {
        const response = await api.post(
          `/petrocarga/auth/loginWithGoogle?token=${googleToken}`,
        );

        const { token } = response.data;

        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }

        setLoading(true);

        await refreshUser();

        const meResponse = await api.get('/petrocarga/auth/me');
        return normalizeUserData(meResponse.data);
      } catch (error: unknown) {
        console.error('Erro no login Google:', error);

        let message;

        if (error instanceof AxiosError) {
          const data = error.response?.data as ApiError;
          message = data?.erro || data?.message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        throw new Error(message);
      }
    },
    [refreshUser],
  );

  // ==================== LOGOUT ====================
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

  // ==================== MEMOIZED VALUE ====================
  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      loading,
      login,
      loginWithGoogle,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * @hook useAuth
 * @description Hook para acessar o contexto de autenticação
 * @throws {Error} Se usado fora do AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}