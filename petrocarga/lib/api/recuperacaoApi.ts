'use client';

import { clientApi } from '../clientApi';

/**
 * @module authApi
 * @description Módulo de API para autenticação e recuperação de senha.
 * Fornece funções para recuperação de senha, reenvio de código,
 * redefinição de senha e ativação de conta.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. solicitarRecuperacaoSenha - Envia email/CPF para recuperação
 * 2. reenviarCodigoAtivacao - Reenvia código de ativação
 * 3. redefinirSenhaComCodigo - Redefine senha com código recebido
 * 4. ativarConta - Ativa conta com código e termos
 *
 * ----------------------------------------------------------------------------
 * 🔧 FUNÇÃO AUXILIAR INTERNA:
 * ----------------------------------------------------------------------------
 *
 * extractMessage - Extrai mensagem de erro de diferentes tipos
 */

/**
 * @function extractMessage
 * @description Função interna para extrair mensagem de erro de forma segura.
 *
 * @param error - Erro de qualquer tipo (Error, string, unknown)
 * @returns string - Mensagem de erro formatada
 *
 * @private
 */
function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Ocorreu um erro. Tente novamente.';
}

// ----------------------
// SOLICITAR RECUPERAÇÃO DE SENHA
// ----------------------

/**
 * @function solicitarRecuperacaoSenha
 * @description Inicia o processo de recuperação de senha enviando email ou CPF.
 *
 * A função identifica automaticamente se o identificador é email ou CPF:
 * - Se contém @ → trata como email (converte para minúsculas)
 * - Se não contém @ → trata como CPF (remove não números, valida 11 dígitos)
 *
 * @param identificador - Email ou CPF do usuário
 * @returns Promise<void>
 *
 * @throws {Error} Dispara erro se:
 * - CPF não tiver 11 dígitos
 * - API retornar erro
 * - Falha na requisição
 *
 * @example
 * ```ts
 * // Com email
 * await solicitarRecuperacaoSenha('usuario@email.com');
 *
 * // Com CPF
 * await solicitarRecuperacaoSenha('12345678900');
 * ```
 */
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

// ----------------------
// REENVIAR CÓDIGO ATIVAÇÃO
// ----------------------

/**
 * @function reenviarCodigoAtivacao
 * @description Reenvia o código de ativação para o CPF informado.
 *
 * @param cpf - CPF do usuário (com ou sem formatação)
 * @returns Promise<{ valido: boolean; message: string; [key: string]: unknown }>
 *
 * @throws {Error} Dispara erro se:
 * - CPF não tiver 11 dígitos
 * - API retornar erro
 *
 * @example
 * ```ts
 * try {
 *   const result = await reenviarCodigoAtivacao('12345678900');
 *   if (result.valido) {
 *     toast.success(result.message);
 *   }
 * } catch (error) {
 *   toast.error(error.message);
 * }
 * ```
 */
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

// ----------------------
// REDEFINIR SENHA COM CÓDIGO
// ----------------------

/**
 * @function redefinirSenhaComCodigo
 * @description Redefine a senha utilizando o código recebido por email.
 *
 * @param email - Email do usuário
 * @param codigo - Código de verificação recebido (convertido para maiúsculas)
 * @param novaSenha - Nova senha desejada
 * @returns Promise<void>
 *
 * @throws {Error} Dispara erro se:
 * - Código inválido
 * - API retornar erro
 *
 * @example
 * ```ts
 * try {
 *   await redefinirSenhaComCodigo(
 *     'usuario@email.com',
 *     'ABC123',
 *     'novaSenha123'
 *   );
 *   toast.success('Senha redefinida com sucesso!');
 * } catch (error) {
 *   toast.error(error.message);
 * }
 * ```
 */
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

// ----------------------
// ATIVAR CONTA
// ----------------------

/**
 * @function ativarConta
 * @description Ativa a conta do usuário com código de verificação.
 *
 * @param cpf - CPF do usuário
 * @param codigo - Código de ativação recebido (convertido para maiúsculas)
 * @param aceitarTermos - Indica se o usuário aceitou os termos de uso
 * @returns Promise<void>
 *
 * @throws {Error} Dispara erro se:
 * - CPF não tiver 11 dígitos
 * - Termos não aceitos
 * - Código inválido
 * - API retornar erro
 *
 * @example
 * ```ts
 * try {
 *   await ativarConta('12345678900', 'ABC123', true);
 *   toast.success('Conta ativada com sucesso!');
 * } catch (error) {
 *   toast.error(error.message);
 * }
 * ```
 */
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

export async function reativarUsuario(usuarioId: string): Promise<void> {
  try {
    if (!usuarioId) {
      throw new Error('ID do usuário é obrigatório');
    }

    const res = await clientApi(
      `/petrocarga/usuarios/reativar/${usuarioId}?id=${usuarioId}`,
      {
        method: 'POST',
      },
    );
    console.log('ID enviado:', usuarioId);

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Não foi possível reativar o usuário');
    }
  } catch (error: unknown) {
    throw new Error(extractMessage(error));
  }
}
