

export type Usuario = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  senha: string;
  ativo: boolean;
};

export type UsuarioResponse = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  cnpj: string;
  permissao: 'AGENTE' | 'ADMIN' | 'MOTORISTA' | 'GESTOR' | 'EMPRESA';
  criadoEm: string;
  ativo: boolean;
};
