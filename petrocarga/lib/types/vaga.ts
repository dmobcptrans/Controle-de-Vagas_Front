// types/vaga.ts

// Tipos de dias da semana
export type DiaSemana =
  | 'DOMINGO'
  | 'SEGUNDA'
  | 'TERCA'
  | 'QUARTA'
  | 'QUINTA'
  | 'SEXTA'
  | 'SABADO';

// Tipo para operações da vaga (horários por dia)
export interface OperacoesVaga {
  id?: string;
  codigoDiaSemana?: number;
  diaSemanaAsEnum: DiaSemana;
  horaInicio: string; // ex: "00:00:00"
  horaFim: string; // ex: "13:00:00"
}

// Endereço da vaga
export interface Endereco {
  id?: string;
  codigoPmp: string;
  logradouro: string;
  bairro: string;
}

// Payload para criação/atualização de vaga
export interface VagaPayload {
  endereco: {
    codigoPmp: FormDataEntryValue | null;
    logradouro: FormDataEntryValue | null;
    bairro: FormDataEntryValue | null;
  };
  area: string;
  numeroEndereco: FormDataEntryValue | null;
  referenciaEndereco: FormDataEntryValue | null;
  tipoVaga: string;
  status: string;
  referenciaGeoInicio: FormDataEntryValue | null;
  referenciaGeoFim: FormDataEntryValue | null;
  comprimento: number;
  operacoesVaga: Array<{
    codigoDiaSemana?: number;
    horaInicio: string;
    horaFim: string;
    diaSemanaAsEnum?: DiaSemana;
  }>;
}

// Tipo principal da vaga (completo)
export interface VagaCompleta {
  id: string;
  area: 'VERMELHA' | 'AMARELA' | 'AZUL' | 'BRANCA' | string;
  numeroEndereco: string;
  referenciaEndereco: string;
  tipoVaga: 'PARALELA' | 'PERPENDICULAR' | string;
  referenciaGeoInicio: string;
  referenciaGeoFim: string;
  comprimento: number;
  status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENCAO' | 'INDISPONIVEL' | string;
  operacoesVaga: OperacoesVaga[];
  endereco: Endereco;
}

// Resposta da API
export interface VagaResponse<T = VagaCompleta | VagaPayload> {
  error: boolean;
  message?: string;
  valores?: VagaPayload | null;
  vaga?: T;
  vagas?: T[];
}

// Filtros para busca de vagas
export interface FiltrosVaga {
  status?: string;
  area?: string;
  tipoVaga?: string;
  bairro?: string;
}

// Interface para erro da API
export interface ApiError {
  status?: number;
  message: string;
}
