import { Paginacao } from "@/lib/types/paginacao";

export type AreaVaga = 'VERMELHA' | 'AMARELA' | 'AZUL' | 'BRANCA';

export type TipoVaga = 'PARALELA' | 'PERPENDICULAR';

export type StatusVaga = 'DISPONIVEL' | 'INDISPONIVEL' | 'MANUTENCAO';

export type DiaSemana =
  | 'DOMINGO'
  | 'SEGUNDA'
  | 'TERCA'
  | 'QUARTA'
  | 'QUINTA'
  | 'SEXTA'
  | 'SABADO';

export type NumeroDiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;


export interface Endereco {
  id?: string;
  codigoPmp: string;
  logradouro: string;
  bairro: string;
}

export interface OperacoesVaga {
  id?: string;
  codigoDiaSemana?: NumeroDiaSemana;
  diaSemanaAsEnum?: DiaSemana;
  horaInicio: string;
  horaFim: string;
}


// Criar Vaga

export type VagaPayload = {
  endereco: Endereco;
  area: AreaVaga;
  numeroEndereco: string;
  referenciaEndereco: string;
  latitudeInicio: number;
  latitudeFim: number;
  longitudeInicio: number;
  longitudeFim: number;
  TipoVaga: TipoVaga;
  comprimento: number;
  operacoesVaga: OperacoesVaga;
};

export type VagasResponse = {
  id: string;
  endereco: Endereco;
  area: AreaVaga;
  numeroEndereco: string;
  referenciaEndereco: string;
  tipoVaga: TipoVaga;
  latitudeInicio: number;
  latitudeFim: number;
  longitudeInicio: number;
  longitudeFim: number;
  comprimento: number;
  quantidade: number;
  status: StatusVaga;
  operacoesVaga: OperacoesVaga;
}

export type VagaPaginadaResponse = Paginacao<VagasResponse>;

export type VagaResponse = {
  id: string;
  enderecoId: string;

  logradouro: string;
  bairro: string;
  numeroEndereco: string;
  referenciaEndereco: string;

  area: AreaVaga;
  tipoVaga: TipoVaga;
  comprimento: number;
  quantidade: number;
  status: StatusVaga;

  latitudeInicio: number;
  longitudeInicio: number;
  latitudeFim: number;
  longitudeFim: number;
};
