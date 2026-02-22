export type ReservaStatus =
  | 'ATIVA'
  | 'CONCLUIDA'
  | 'RESERVADA'
  | 'REMOVIDA'
  | 'CANCELADA';

export type UsuarioCriadoPor = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  permissao: 'MOTORISTA' | 'GESTOR' | 'ADMIN';
  criadoEm: string;
  ativo: boolean;
  desativadoEm: string | null;
};

export type EnderecoVaga = {
  id: string;
  codigoPmp: string;
  logradouro: string;
  bairro: string;
};

export type Reserva = {
  id: string;

  // Relações
  vagaId: string;
  motoristaId: string;

  // Motorista
  motoristaNome: string;
  motoristaCpf: string;

  // Endereço
  numeroEndereco: string;
  referenciaEndereco: string;
  enderecoVaga: EnderecoVaga;

  // Datas
  inicio: string;
  fim: string;

  // Veículo
  tamanhoVeiculo: number;
  placaVeiculo: string;
  modeloVeiculo: string;
  marcaVeiculo: string;
  cpfProprietarioVeiculo: string | null;
  cnpjProprietarioVeiculo: string | null;

  // Status
  status: ReservaStatus;

  // Auditoria
  criadoPor: UsuarioCriadoPor;
  criadoEm: string;
  cidadeOrigem: string;
  entradaCidade: string | null;
};

export type ReservaGet = {
  id: string;
  vagaId: string;
  logradouro: string;
  bairro: string;
  motoristaId: string;
  veiculoId: string;
  criadoPorId: string;
  criadoEm: string;
  inicio: string;
  fim: string;
  referenciaGeoInicio: string;
  referenciaGeoFim: string;
  cidadeOrigem: string;
  status: 'ATIVA' | 'CONCLUIDA' | 'RESERVADA' | 'REMOVIDA' | 'CANCELADA';
};
