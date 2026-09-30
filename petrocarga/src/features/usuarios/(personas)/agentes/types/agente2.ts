import { Paginacao } from '@/lib/types/paginacao';
import { TipoCnh } from './../../motoristas/types/tipoCnh';
import { Usuario } from "@/lib/types/personas/user2"
import { Ordem } from '@/features/denuncias/types/denuncia';

export type agenteParams = {
    nome?: string,
    matricula?: string,
    ativo?: boolean,
    pagina?: number,
    tamanhoPagina?: number
    ordem?: Ordem
}

export type agentePayload = {
    nome: string,
    cpf: string,
    telefone: string,
    email: string,
    matricula: string
}

export type agenteResponse = {
    id: string,
    usuario: Usuario
    matricula: string
}

export type agentePaginadoResponse = Paginacao<agenteResponse>

export type atualizarAgente = {
    nome?: string,
    email?: string,
    telefone?: string,
    senha?: string,
    cpf?: string,
    matricula?: string,
    cnpj?: string,
    razaoSocial?: string,
    TipoCnh?: TipoCnh,
    numeroCnh?: string,
    dataValidadeCnh?: string,
    empresaId?: string
}