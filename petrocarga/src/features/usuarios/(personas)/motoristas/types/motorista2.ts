import { Usuario, UsuarioPayload, UsuarioSimplificado } from "@/lib/types/personas/user2";
import { TipoCnh } from "./tipoCnh";
import { Ordem } from "@/features/denuncias/types/denuncia";
import { Paginacao } from "@/lib/types/paginacao";

export type MotoristaParams = {
  id?: string,
  nome?: string,
  telefone?: string,
  email?: string,
  cpf?: string,
  cnh?: string,
  empresaId?: string,
  empresaCnpj?: string,
  empresaRazaoSocial?: string,
  ativo?: boolean,
  pagina?: number,
  tamanhoPagina?: number,
  ordem?: Ordem
}

export type MotoristaPayload1 = {
  usuario: UsuarioPayload,
  cpf: string,
  tipoCnh: string,
  numeroCnh: string,
  dataValidadeCnh: string,
  empresaId: string
}

export type MotoristaResponse1 = {
  id: string,
  usuario: Usuario
  tipoCnh: TipoCnh
  numeroCnh: string
  dataValidadeCnh: string
  empresaId: string
  empresaCnpj: string
  empresaRazaoSocial: string
}

export type MotoristaResumidoResponse = {
  id: string,
  usuario: UsuarioSimplificado
  tipoCnh: TipoCnh
  numeroCnh: string,
  dataValidadeCnh: string
}

export type MotoristaResumidoPaginadoResponse = Paginacao<MotoristaResumidoResponse>


export type AtualizarMotoristaPayload = {
  nome?: string,
  email?: string,
  telefone?: string,
  senha?: string,
  cpf?: string,
  matricula?: string,
  cnpj?: string,
  razaoSocial?: string,
  tipoCnh?: string,
  dataValidadeCnh?: string,
  empresaId?: string
}

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