export type EmpresaPayload = {
  usuario: {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    senha: string;
  };
  cnpj: string;
  razaoSocial: string;
  aceitouTermos: boolean;
};

export type EmpresaResult = {
  error: boolean;
  message: string;
  valores?: EmpresaPayload;
};