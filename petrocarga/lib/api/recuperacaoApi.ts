'use client';

import { clientApi } from '../clientApi';

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Ocorreu um erro. Tente novamente.';
}

export async function solicitarRecuperacaoSenha(
  identificador: string,
): Promise<void> {
  try {
    const isEmail = identificador.includes('@');
    const cpfLimpo = identificador.replace(/\D/g, '');

    const jsonBody = isEmail
      ? { email: identificador.trim().toLowerCase() }
      : { cpf: cpfLimpo };

    if (!isEmail && cpfLimpo.length !== 11) {
      throw new Error('CPF deve conter 11 dígitos');
    }

    const res = await clientApi('/petrocarga/auth/forgot-password', {
      method: 'POST',
      json: jsonBody,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(
        data.message || 'Não foi possível processar a solicitação',
      );
    }
  } catch (error: unknown) {
    throw new Error(extractMessage(error));
  }
}

export async function reenviarCodigoAtivacao(cpf: string): Promise<{
  valido: boolean;
  message: string;
  [key: string]: unknown;
}> {
  try {
    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      throw new Error('CPF deve conter 11 dígitos');
    }

    const res = await clientApi('/petrocarga/auth/resend-code', {
      method: 'POST',
      json: {
        cpf: cpfLimpo,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Erro HTTP ${res.status}`);
    }

    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error));
  }
}

export async function redefinirSenhaComCodigo(
  email: string,
  codigo: string,
  novaSenha: string,
): Promise<void> {
  try {
    const res = await clientApi('/petrocarga/auth/reset-password', {
      method: 'POST',
      json: {
        email: email.trim(),
        codigo: codigo.trim().toUpperCase(),
        novaSenha,
      },
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Não foi possível redefinir a senha');
    }
  } catch (error: unknown) {
    throw new Error(extractMessage(error));
  }
}

export async function ativarConta(
  cpf: string,
  codigo: string,
  aceitarTermos: boolean,
): Promise<void> {
  try {
    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      throw new Error('CPF deve conter exatamente 11 dígitos');
    }

    if (!aceitarTermos) {
      throw new Error(
        'É necessário aceitar os termos de uso e política de privacidade',
      );
    }

    const res = await clientApi('/petrocarga/auth/activate', {
      method: 'POST',
      json: {
        cpf: cpfLimpo,
        codigo: codigo.trim().toUpperCase(),
        aceitarTermos: true,
      },
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Não foi possível ativar a conta');
    }
  } catch (error: unknown) {
    throw new Error(extractMessage(error));
  }
}
