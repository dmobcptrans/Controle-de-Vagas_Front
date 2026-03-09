// types/disponibilidade.ts

export interface Endereco {
  id: string;
  codigoPmp: string;
  logradouro: string;
  bairro: string;
}

export interface DisponibilidadeInput {
  id?: string;
  vagaId: string;
  inicio: string;
  fim: string;
}

export interface DisponibilidadeVagasBody {
  listaVagaId: string[];
  inicio: string;
  fim: string;
}

export interface DisponibilidadeCompleta {
  id: string;
  vagaId: string;
  endereco: Endereco;
  referenciaEndereco: string;
  numeroEndereco: string;
  inicio: string;
  fim: string;
  criadoEm: string;
  criadoPorId: string;
}

export interface DisponibilidadeResponse<
  T = DisponibilidadeCompleta | DisponibilidadeInput,
> {
  error?: boolean;
  message?: string;
  valores?: DisponibilidadeInput;
  success?: boolean;
  data?: T | T[];
}
