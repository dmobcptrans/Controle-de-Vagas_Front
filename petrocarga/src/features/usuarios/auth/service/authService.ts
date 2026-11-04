import { api, TOKEN_KEY } from '@/services/api';

import type {
  LoginPayload,
  LoginWithGooglePayload,
  AuthMeResponse,
} from '../types/auth2';

import type { LoginFormData } from '../utils/loginUtils';

import { prepareLoginData } from '../utils/loginUtils';
import { normalizeUserData } from '../utils/normalizeUser';

const BASE_URL = '/auth'

type LoginResponse = {
  token?: string;
};

export async function login(
  data: LoginFormData,
): Promise<AuthMeResponse> {
  const payload: LoginPayload = prepareLoginData(data);

  const response = await api.post<LoginResponse>(
    `${BASE_URL}/login`,
    payload,
  );

  const { token } = response.data;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  return getCurrentUser();
}

export async function loginWithGoogle(
  data: LoginWithGooglePayload,
): Promise<AuthMeResponse> {
  const response = await api.post<LoginResponse>(
    `${BASE_URL}/loginWithGoogle`,
    data,
  );

  const { token } = response.data;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  return getCurrentUser();
}

export async function getCurrentUser(): Promise<AuthMeResponse> {
  const response = await api.get(
    `${BASE_URL}/me`,
  );

  return normalizeUserData(response.data);
}

export async function logout(): Promise<void> {
  try {
    await api.post(`${BASE_URL}/logout`);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
}
