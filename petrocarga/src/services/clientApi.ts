'use client';

import { TOKEN_KEY } from '@/services/api';
import { ApiError } from '@/lib/types/response/ApiError';

type ClientApiOptions = RequestInit & {
  json?: unknown;
};

export async function clientApi(
  path: string,
  options: ClientApiOptions = {},
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    'ngrok-skip-browser-warning': 'true',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let body = options.body;

  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body,
    credentials: 'include',
  });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);

    console.warn('Sessão expirada, redirecionando...');

    window.location.href = '/autorizacao/login';

    throw {
      message: 'Sessão expirada.',
      code: 401,
    } satisfies ApiError;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    if (
      errorData &&
      typeof errorData.message === 'string' &&
      typeof errorData.code === 'number'
    ) {
      throw errorData satisfies ApiError;
    }

    throw {
      message: 'Ocorreu um erro na requisição.',
      code: response.status,
    } satisfies ApiError;
  }

  return response;
}