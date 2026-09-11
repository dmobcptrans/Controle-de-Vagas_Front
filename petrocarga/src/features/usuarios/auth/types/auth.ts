import type { Usuario } from '@/lib/types/personas/user';

export interface LoginData {
  login: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

export type TipoLogin =
  | 'email'
  | 'cpf'
  | 'cnpj'
  | 'invalido';

export interface AuthContextData {
  isAuthenticated: boolean;
  user: Usuario | null;
  loading: boolean;
  login: (data: LoginData) => Promise<Usuario>;
  loginWithGoogle: (token: string) => Promise<Usuario>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}