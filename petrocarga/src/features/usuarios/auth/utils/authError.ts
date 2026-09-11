import { AxiosError } from 'axios';

import type { ApiError } from '@/lib/types/response/ApiError';

export function getAuthErrorMessage(
  error: unknown,
): string {
  const defaultMessage =
    'Credenciais inválidas ou conta não ativada.';

  if (error instanceof AxiosError) {
    const data =
      error.response?.data as ApiError | undefined;

    if (data?.erro || data?.message) {
      return data.erro || data.message!;
    }

    switch (error.response?.status) {
      case 400:
        return 'Erro na requisição. Verifique seus dados.';

      case 401:
        return 'CPF/CNPJ/Email ou senha incorretos.';

      case 403:
        return 'Conta não ativada.';

      case 404:
        return 'Usuário não encontrado.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}