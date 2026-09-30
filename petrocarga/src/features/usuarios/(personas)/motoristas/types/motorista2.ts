import { TipoCnh } from "./tipoCnh";

export type MotoristaPayload = {
  nome: string,
  telefone: string,
  cpf: string,
  numeroCnh: string,
  tipoCnh: TipoCnh,
  dataValidadeCnh: string,
  senha: string
};

export type MotoristaResponse = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  ativo: boolean;
};