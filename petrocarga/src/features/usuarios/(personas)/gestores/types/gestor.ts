import { Ordem } from "@/features/denuncias/types/denuncia";
import { Paginacao } from "@/lib/types/paginacao";
import { Usuario } from "@/lib/types/personas/user2";

export type gestorParams = {
    id?: string;
    nome?: string;
    telefone?: string;
    email?: string;
    cpf?: string;
    ativo?: boolean;
    pagina?: number;
    tamanhoPagina?: number;
    ordem?: Ordem;
}

export type gestorPayload = {
    nome: string;
    telefone: string;
    email: string;
    cpf: string;
}

export type atualizarGestorPayload = {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    cpf: string;
    razaoSocial: string;
    tipoCnh: string;
    numeroCnh: string;
    dataValidadeCnh: string;
    empresaId: string;
}

export type gestorResponse = {
    id: string;
    usuario: Usuario
}

export type gestorPaginadoResponse = Paginacao<gestorResponse>

