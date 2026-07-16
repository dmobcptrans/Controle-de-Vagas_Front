import { Paginacao } from "../paginacao";
import { Veiculo } from "../veiculo";
import { Motorista } from "./motorista";

export type EmpresaPayload = {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  cnpj: string;
  aceitouTermos: boolean;
};

export type EmpresaResult = {
  error: boolean;
  message: string;
  valores?: EmpresaPayload;
};

/////////////////////////////////////


export interface UsuarioEmpresa {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  permissao: string;
  criadoEm: string;
  ativo: boolean;
  veiculos: Veiculo[];
}

export interface MotoristaEmpresa {
  id: string;
  nome: string;
  ativo: boolean;
  empresaId: string;
  empresaCnpj: string;
  empresaRazaoSocial: string;
}

export type MotoristaResponse = Paginacao<Motorista>;

export type VeiculoMotoristaEmpresaResponse = Paginacao<Veiculo>;

export interface EmpresaResponse {
  id: string;
  usuario: UsuarioEmpresa;
  cnpj: string;
}
