import { Usuario } from "@/lib/types/personas/user2"
import { TipoCnh } from "../../motoristas/types/tipoCnh"
import { Paginacao } from '@/lib/types/paginacao';
import { Ordem } from "@/features/denuncias/types/denuncia";

export interface EmpresaParams {
    empresaId?: string,
    cnpj?: string,
    nome?: string,
    telefone?: string,
    ativo?: boolean,
    pagina?: number,
    tamanhoPagina?: number,
    ordem?: Ordem
}

export type EmpresaPayload = {
    nome: string,
    telefone: string,
    email: string,
    senha: string,
    cnpj: string,
    aceitouTermos: boolean
}

export type EmpresaResponse = {
    id: string,
    usuario: Usuario
}

export type MotoristaEmpresaResponse = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  ativo: boolean;
  empresaId?: string | null;
  empresaCnpj?: string | null;
  empresaRazaoSocial?: string | null;
}

export type EmpresasPaginadaResponse = Paginacao<EmpresaResponse>

export type MotoristaEmpresaPaginadoResponse = Paginacao<MotoristaEmpresaResponse>;

export type AtualizarEmpresaPayload = {
    nome: string,
    email: string,
    telefone: string,
    senha: string,
    cpf: string,
    matricula: string,
    cnpj: string,
    razaoSocial: string,
    tipoCnh: TipoCnh,
    numeroCnh: string,
    DateValidadeCnh: string,
    empresaId: string
} 