import { Endereco } from '@/features/vaga/vagas/types/vaga2';
import { Paginacao } from '@/lib/types/paginacao';

export type TipoDenuncia =
  | 'USO_INDEVIDO_DA_VAGA'
  | 'ATRASO_POR_MOTIVO_DE_FORCA_MAIOR'
  | 'OUTROS';

export type StatusDenuncia =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'PROCEDENTE'
  | 'IMPROCEDENTE';

export type Ordem = 'ASC' | 'DESC';

export interface DenunciaParams {
  denunciaId?: string;
  vagaId?: string;
  reservaId?: string;

  criadoPorId?: string;
  criadoPorNome?: string;
  criadoPorTelefone?: string;

  listaStatus?: StatusDenuncia[];
  listaTipos?: TipoDenuncia[];

  pagina?: number;
  tamanhoPagina?: number;
  ordem?: Ordem;
}

export type DenunciaPayload = {
  descricao: string;
  reservaId: string;
  tipo: TipoDenuncia;
};

export type RespostaDenunciaPayload = {
  resposta: string;
  status: StatusDenuncia;
};

export type DenunciaResponse = {
  id: string;
  criadoPorId: string;
  vagaId: string;
  reservaId: string;
  veiculoId: string;
  nomeMotorista: string;
  telefoneMotorista: string;
  descricao: string;
  enderecoVaga: Endereco;
  numeroEndereco: string;
  referenciaEndereco: string;
  marcaVeiculo: string;
  modeloVeiculo: string;
  placaVeiculo: string;
  tamanhoVeiculo: number;
  status: StatusDenuncia;
  tipo: TipoDenuncia;
  resposta: string;
  atualizadoPorId: string;
  criadoEm: string;
  atualizadoEm: string;
  encerradoEm: string;
};

export type DenunciaPaginadaResponse = Paginacao<DenunciaResponse>;
