import { Paginacao } from '@/lib/types/paginacao';
import { TipoVeiculo } from './tipoVeiculo';

export interface VeiculoParams {
  placa?: string;
  marca?: string;
  modelo?: string;
  tipo?: TipoVeiculo;
  telefoneUsuario?: string;
  cpfProprietario?: string;
  cnpjProprietario?: string;
  ativo?: boolean;

  pagina?: number;
  tamanhoPagina?: number;
  ordem?: 'ASC' | 'DESC';
}

export interface VeiculoPayload {
  placa: string;
  marca: string;
  modelo: string;
  tipo: TipoVeiculo;
  cpfProprietario?: string;
  cnpjProprietario?: string;
}

export interface VeiculoResponse {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  tipo: TipoVeiculo;
  comprimento: number;
  usuarioId: string;
  cpfProprietario: string;
  cnpjProprietario: string;
  ativo: boolean;
}

export type VeiculoPaginadoResponse =
  Paginacao<VeiculoResponse>;