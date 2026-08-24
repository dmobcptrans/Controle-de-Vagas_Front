import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// --- Configurações de Constantes ---
const LOGIN_PATH = '/autorizacao/login';
export const TOKEN_KEY = '@Petrocarga:token';

// 🚀 Instância Principal
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTOR DE REQUISIÇÃO
 * Adiciona:
 * - JWT no Authorization
 * - Header do ngrok (bypass warning)
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers['ngrok-skip-browser-warning'] = 'true';
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * INTERCEPTOR DE RESPOSTA
 * Tratamento global de erros e expiração de sessão.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isClient = typeof window !== 'undefined';

    // 401: Unauthorized (Sessão expirada ou Token inválido)
    if (error.response?.status === 401) {
      if (isClient) {
        localStorage.removeItem(TOKEN_KEY);
        const isLoginPage = window.location.pathname.includes(LOGIN_PATH);
        if (!isLoginPage) {
          console.warn('Sessão expirada. Redirecionando...');
          window.location.href = LOGIN_PATH;
        }
      }
    }

    // Tratamento de erro padronizado para o console
    return Promise.reject(error);
  },
);