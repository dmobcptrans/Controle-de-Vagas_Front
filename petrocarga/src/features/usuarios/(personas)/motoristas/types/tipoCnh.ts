export type TipoCnh =
  | 'AB'
  | 'B'
  | 'C'
  | 'AC'
  | 'D'
  | 'AD'
  | 'E'
  | 'AE';

export const TIPO_CNH_DESCRICAO: Record<TipoCnh, string> = {
  AB: 'Automóvel e Moto',
  B: 'Automóvel',
  C: 'Carga',
  AC: 'Automóvel e Carga',
  D: 'Ônibus',
  AD: 'Ônibus e Moto',
  E: 'Articulados',
  AE: 'Articulados e Moto',
};