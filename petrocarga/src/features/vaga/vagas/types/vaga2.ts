export type AreaVaga =
  | 'VERMELHA'
  | 'AMARELA'
  | 'AZUL'
  | 'BRANCA'

export type TipoVaga =
  | 'PARALELA'
  | 'PERPENDICULAR'

export type StatusVaga =
  | 'DISPONIVEL'
  | 'INDISPONIVEL'
  | 'MANUTENCAO'


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