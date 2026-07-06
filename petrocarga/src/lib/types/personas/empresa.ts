export type EmpresaPayload = {
    nome: string;
    telefone: string;
    email: string;
    senha: string;
  cnpj: string;
  aceitouTermos: boolean;
};

export type EmpresaResult = {
  error: boolean;
  message: string;
  valores?: EmpresaPayload;
};

/////////////////////////////////////


export interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  tipo: string;
  comprimento: number;
  usuarioId: string;
  cpfProprietario: string;
}

export interface UsuarioEmpresa {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  permissao: string;
  criadoEm: string;
  ativo: boolean;
  veiculos: Veiculo[];
}

export interface MotoristaEmpresa {
  id: string;
  usuarioId: string;
  nome: string;
  ativo: boolean;
  empresaId: string;
  empresaCnpj: string;
  empresaRazaoSocial: string;
}

export interface EmpresaResponse {
  id: string;
  usuario: UsuarioEmpresa;
  cnpj: string;
  motoristas: MotoristaEmpresa[];
}