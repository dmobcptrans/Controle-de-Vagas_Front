import { Endereco } from "../../vagas/types/vaga2";


//PARAMS

export type DisponibilidadesParam = {
  vagaId?: string;
  mes?: number;
  ano?: number;
  pagina?: number;
  tamanhoPagina?: number;
  ordem?: "DESC" | "ASC"
};

// Criar uma nova Disponibilidade de vaga | atualiza uma ou varias disponibilidades existentes
export type DisponibilidadeVagasPayload = {
    vagaId: string;
    inicio: string;
    fim: string
}

// Criar múltiplas Disponibilidades de vaga
export type DisponibilidadeVagasMultiplasPayload = {
  listaVagaId: string[];
  inicio: string;
  fim: string;
};

// Disponibilidade de vaga especifica
export type DisponibildadeVagaResponse = {
    id: string;
    vagaId: string;
    enredeco: Endereco;
    referenciaEndereco: string;
    numeroEndereco: string;
    inicio: string;
    fim: string;
    criadoEm: string;
    criadoPorId: string;
};

export type DisponibilidadeVagaResumoResponse = {
    id: string;
    inicio: string;
    fim: string
}

