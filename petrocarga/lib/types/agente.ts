// types/agente.ts

export interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
}

export interface AgenteInput {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  matricula: string;
  senha?: string;
  id?: string;
}

export interface AgenteCompleto {
  id: string;
  matricula: string;
  usuario: Usuario;
}

export interface AgenteResponse<T = AgenteCompleto | AgenteInput> {
  error?: boolean;
  message?: string;
  valores?: AgenteInput;
  agenteId?: string;
  agente?: T;
  agentes?: T[];
}

export interface FiltrosAgente {
  nome?: string;
  matricula?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}
