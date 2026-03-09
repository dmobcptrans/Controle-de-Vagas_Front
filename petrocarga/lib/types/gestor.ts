// types/gestor.ts

// Tipo para payload de criação/atualização
export interface GestorInput {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha?: string;
  id?: string; // para atualização
}

// Tipo completo de Gestor (como retornado pela API)
export interface GestorCompleto {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
}

// Tipo para respostas da API
export interface GestorResponse<T = GestorCompleto | GestorInput> {
  error: boolean;
  message?: string;
  valores?: GestorInput;
  gestorId?: string;
  gestor?: T;
  gestores?: T[];
}

// Filtros para busca de gestores
export interface FiltrosGestor {
  nome?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}
