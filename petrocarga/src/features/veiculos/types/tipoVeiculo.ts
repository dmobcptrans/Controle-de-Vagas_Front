export type TipoVeiculo =
  | 'AUTOMOVEL'
  | 'CAMINHONETA'
  | 'VUC'
  | 'CAMINHAO_MEDIO'
  | 'CAMINHAO_LONGO';

export const TIPO_CNH_DESCRICAO: Record<TipoVeiculo, string> = {
  AUTOMOVEL: 'Automóvel',
  CAMINHONETA: 'Caminhoneta',
  VUC: 'Veículo Urbano de Carga',
  CAMINHAO_MEDIO: 'Caminhão Médio',
  CAMINHAO_LONGO: 'Caminhão Longo',
};
