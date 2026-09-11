export type Permissao =
  | 'ADMIN'
  | 'GESTOR'
  | 'MOTORISTA'
  | 'AGENTE'
  | 'EMPRESA';

export interface DadosExtras {
  matricula?: string;
  empresaId?: string;
  empresaCnpj?: string;
  empresaRazaoSocial?: string;
  possuiVeiculoAtivo?: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf?: string;
  cnpj?: string;
  permissao: Permissao;
  criadoEm: string;
  ativo: boolean;
  desativadoEm?: string;
  dadosExtras?: DadosExtras;
}