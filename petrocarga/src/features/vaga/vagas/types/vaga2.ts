import { Paginacao } from '@/lib/types/paginacao';

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


// PARAMS 
export type FiltrosVaga = {
  status?: StatusVaga;
  area?: AreaVaga;
  tipoVaga?: TipoVaga;
  bairro?: string;
  logradouro?: string;
};

export type VagasFiltradasParams = FiltrosVaga & {
  numeroPagina?: number;
  tamanhoPagina?: number;
  ordenarPor?: string;
};

export type VagasMapaParams = {
  north: number;
  south: number;
  east: number;
  west: number;
  status?: StatusVaga;
};

// ____________________________________________________

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

// Criar Vaga | Atualizar Vaga

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

// (/vagas/{id}) | (/vagas/all)
export type VagaResponse = {
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
};

// (/vagas/resumo) | é chamado tmb em reserva

export type VagasResumo = {
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
  latitudeFim: number;
  longitudeInicio: number;
  longitudeFim: number;
};

// (/vagas/mapa)

export type VagasMapa = {
  id: string;
  area: AreaVaga;
  status: StatusVaga;
  latitudeInicio: number;
  latitudeFim: number;
  longitudeInicio: number;
  longitudeFim: number;
  disponivelAgora: boolean;
};

// Listar Vagas (/vagas)
export type VagasPaginadasResponse = Paginacao<VagaResponse>;
