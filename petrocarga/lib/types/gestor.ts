export type Gestor = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
};

export interface FiltrosGestor {
  nome?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}

export type GestorInput = {
  id?: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha?: string;
};

export type GestorResponse = {
  error?: boolean;
  message?: string;
  valores?: GestorInput;
  gestorId?: string;
  gestor?: Gestor;
  gestores?: Gestor[];
};
