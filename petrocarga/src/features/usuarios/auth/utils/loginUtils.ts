import type { LoginPayload } from '../types/auth2';

export type TipoLogin =
  | 'email'
  | 'cpf'
  | 'cnpj'
  | 'invalido';

export interface LoginFormData {
  login: string;
  senha: string;
}

export function identificarTipoLogin(
  identificador: string,
): TipoLogin {
  if (!identificador.trim()) {
    return 'invalido';
  }

  const valor = identificador.trim();
  const apenasNumeros = valor.replace(/\D/g, '');

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(valor)) {
    return 'email';
  }

  if (apenasNumeros.length === 11) {
    return 'cpf';
  }

  if (apenasNumeros.length === 14) {
    return 'cnpj';
  }

  return 'invalido';
}

export function prepareLoginData(
  data: LoginFormData,
): LoginPayload {
  const tipo = identificarTipoLogin(data.login);

  if (tipo === 'invalido') {
    throw new Error(
      'Formato inválido. Use email, CPF ou CNPJ (apenas números)',
    );
  }

  const valor = data.login.trim();

  if (tipo === 'email') {
    return {
      email: valor.toLowerCase(),
      senha: data.senha,
    };
  }

  const documento = valor.replace(/\D/g, '');

  return {
    [tipo]: documento,
    senha: data.senha,
  };
}

