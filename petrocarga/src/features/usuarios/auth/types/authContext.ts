
import type {
  LoginWithGooglePayload,
  AuthMeResponse
} from './auth2';
import { LoginFormData } from '../utils/loginUtils';

export type AuthContextData = {
  isAuthenticated: boolean;
  user: AuthMeResponse | null;
  loading: boolean;

  login: (
    data: LoginFormData,
  ) => Promise<AuthMeResponse>;

  loginWithGoogle: (
    data: LoginWithGooglePayload,
  ) => Promise<AuthMeResponse>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
};