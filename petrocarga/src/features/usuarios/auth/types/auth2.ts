import type { Usuario } from '@/lib/types/personas/user2';
import type { TipoCnh } from '../../(personas)/motoristas/types/tipoCnh';


// Auth/Me

export type AuthMeResponse = Usuario;

// Auth/Reset-Password

export type RedefinirSenhaPayload = {
  email?: string;
  cpf?: string;
  cnpj?: string;
  codigo: string;
  novaSenha: string;
};


// Auth/Resend-Code

export type ReenviarCodigoRecuperacaoPayload = {
  email?: string;
  cpf?: string;
  cnpj?: string;
};

// Auth/Login

export type LoginPayload = {
  email?: string;
  cpf?: string;
  cnpj?: string;
  senha: string;
};

// Auth/LoginWithGoogle

export type LoginWithGooglePayload = {
  token: string;
};

// Auth/Forgot-Password

export type EsqueciSenhaPayload = {
  email?: string;
  cpf?: string;
  cnpj?: string;
};

// Auth/CompletarCadastro

export type CompletarCadastroPayload = {
  cpf: string;
  telefone: string;
  aceitarTermos: boolean;
  tipoCnh: TipoCnh;
  numeroCnh: string;
  dataValidadeCnh: string;
  senha: string;
};

// Auth/Admin

export type CadastroAdminPayload = {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  aceitarTermos: boolean;
};

// Auth/Activate

export type AtivarContaPayload = {
  cnpj: string;
  cpf: string;
  codigo: string;
  aceitarTermos: boolean;
};

