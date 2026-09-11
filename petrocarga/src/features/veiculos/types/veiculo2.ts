import { TipoVeiculo } from "./tipoVeiculo";

export type VeiculoResponse = {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  tipo: TipoVeiculo;
  comprimento: number;
};