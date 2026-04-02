/**
 * @module types/reserva
 * @description Definições de tipos TypeScript para o módulo de Reservas.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. ReservaStatus - Status possíveis de uma reserva
 * 2. UsuarioCriadoPor - Informações do usuário que criou a reserva
 * 3. EnderecoVaga - Endereço da vaga associada
 * 4. Reserva - Representação completa de uma reserva
 * 5. ReservaGet - Versão simplificada para listagens
 */

/**
 * @type ReservaStatus
 * @description Status possíveis para uma reserva no sistema.
 *
 * - 'ATIVA': Reserva em andamento (check-in realizado)
 * - 'CONCLUIDA': Reserva finalizada (check-out realizado)
 * - 'RESERVADA': Reserva agendada (ainda não iniciada)
 * - 'REMOVIDA': Reserva removida do sistema
 * - 'CANCELADA': Reserva cancelada pelo usuário
 */
export type ReservaStatus =
  | 'ATIVA'
  | 'CONCLUIDA'
  | 'RESERVADA'
  | 'REMOVIDA'
  | 'CANCELADA';

/**
 * @type UsuarioCriadoPor
 * @description Informações do usuário que criou/modificou a reserva.
 *
 * @property {string} id - ID do usuário
 * @property {string} nome - Nome completo
 * @property {string} cpf - CPF
 * @property {string} telefone - Telefone
 * @property {string} email - Email
 * @property {'MOTORISTA' | 'GESTOR' | 'ADMIN'} permissao - Nível de acesso
 * @property {string} criadoEm - Data de criação do usuário
 * @property {boolean} ativo - Status do usuário
 * @property {string | null} desativadoEm - Data de desativação (se aplicável)
 */
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

/**
 * @type EnderecoVaga
 * @description Endereço da vaga associada à reserva.
 *
 * @property {string} id - ID do endereço
 * @property {string} codigoPmp - Código PMP da rua (ex: "Md-1234")
 * @property {string} logradouro - Nome da rua/avenida
 * @property {string} bairro - Bairro da vaga
 */
export type EnderecoVaga = {
  id: string;
  codigoPmp: string;
  logradouro: string;
  bairro: string;
};

/**
 * @type Reserva
 * @description Representação completa de uma reserva no sistema.
 * Contém todas as informações relacionadas: motorista, veículo, vaga, status e auditoria.
 *
 * ----------------------------------------------------------------------------
 * 🔍 IDENTIFICADORES
 * ----------------------------------------------------------------------------
 * @property {string} id - ID único da reserva
 * @property {string} vagaId - ID da vaga reservada
 * @property {string} motoristaId - ID do motorista
 *
 * ----------------------------------------------------------------------------
 * 👤 MOTORISTA
 * ----------------------------------------------------------------------------
 * @property {string} motoristaNome - Nome do motorista
 * @property {string} motoristaCpf - CPF do motorista
 *
 * ----------------------------------------------------------------------------
 * 📍 ENDEREÇO
 * ----------------------------------------------------------------------------
 * @property {string} numeroEndereco - Números de referência
 * @property {string} referenciaEndereco - Pontos de referência
 * @property {EnderecoVaga} enderecoVaga - Endereço completo da vaga
 *
 * ----------------------------------------------------------------------------
 * ⏰ DATAS
 * ----------------------------------------------------------------------------
 * @property {string} inicio - Data/hora de início (ISO)
 * @property {string} fim - Data/hora de fim (ISO)
 *
 * ----------------------------------------------------------------------------
 * 🚗 VEÍCULO
 * ----------------------------------------------------------------------------
 * @property {number} tamanhoVeiculo - Comprimento do veículo (metros)
 * @property {string} placaVeiculo - Placa do veículo
 * @property {string} modeloVeiculo - Modelo do veículo
 * @property {string} marcaVeiculo - Marca do veículo
 * @property {string | null} cpfProprietarioVeiculo - CPF do proprietário (pessoa física)
 * @property {string | null} cnpjProprietarioVeiculo - CNPJ do proprietário (pessoa jurídica)
 *
 * ----------------------------------------------------------------------------
 * 📊 STATUS
 * ----------------------------------------------------------------------------
 * @property {ReservaStatus} status - Status atual da reserva
 *
 * ----------------------------------------------------------------------------
 * 📝 AUDITORIA
 * ----------------------------------------------------------------------------
 * @property {UsuarioCriadoPor} criadoPor - Usuário que criou a reserva
 * @property {string} criadoEm - Data de criação
 * @property {string} cidadeOrigem - Cidade de origem do veículo
 * @property {string | null} entradaCidade - Ponto de entrada na cidade
 *
 * @example
 * ```ts
 * const reserva: Reserva = {
 *   id: 'res123',
 *   vagaId: 'vaga456',
 *   motoristaId: 'mot789',
 *
 *   motoristaNome: 'João Silva',
 *   motoristaCpf: '12345678900',
 *
 *   numeroEndereco: '90 ao 130',
 *   referenciaEndereco: 'Em frente à praça',
 *   enderecoVaga: {
 *     id: 'end123',
 *     codigoPmp: 'Md-1234',
 *     logradouro: 'Rua do Imperador',
 *     bairro: 'Centro'
 *   },
 *
 *   inicio: '2024-01-15T08:00:00Z',
 *   fim: '2024-01-15T18:00:00Z',
 *
 *   tamanhoVeiculo: 4.5,
 *   placaVeiculo: 'ABC1234',
 *   modeloVeiculo: 'Uno',
 *   marcaVeiculo: 'Fiat',
 *   cpfProprietarioVeiculo: '12345678900',
 *   cnpjProprietarioVeiculo: null,
 *
 *   status: 'ATIVA',
 *
 *   criadoPor: {
 *     id: 'user123',
 *     nome: 'Maria Gestora',
 *     cpf: '98765432100',
 *     telefone: '21999998888',
 *     email: 'maria@email.com',
 *     permissao: 'GESTOR',
 *     criadoEm: '2023-01-01T00:00:00Z',
 *     ativo: true,
 *     desativadoEm: null
 *   },
 *   criadoEm: '2024-01-10T14:30:00Z',
 *   cidadeOrigem: 'Petrópolis',
 *   entradaCidade: 'BR-040'
 * };
 * ```
 */
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

/**
 * @type ReservaGet
 * @description Versão simplificada da reserva para operações de listagem.
 * Contém apenas os campos essenciais, sem os dados aninhados completos.
 *
 * @property {string} id - ID da reserva
 * @property {string} vagaId - ID da vaga
 * @property {string} logradouro - Rua da vaga
 * @property {string} bairro - Bairro da vaga
 * @property {string} motoristaId - ID do motorista
 * @property {string} veiculoId - ID do veículo
 * @property {string} criadoPorId - ID do criador
 * @property {string} criadoEm - Data de criação
 * @property {string} inicio - Data/hora de início
 * @property {string} fim - Data/hora de fim
 * @property {string} referenciaGeoInicio - Coordenadas de início
 * @property {string} referenciaGeoFim - Coordenadas de fim
 * @property {string} cidadeOrigem - Cidade de origem
 * @property {ReservaStatus} status - Status da reserva
 *
 * @example
 * ```ts
 * const reservaLista: ReservaGet = {
 *   id: 'res123',
 *   vagaId: 'vaga456',
 *   logradouro: 'Rua do Imperador',
 *   bairro: 'Centro',
 *   motoristaId: 'mot789',
 *   veiculoId: 'veic321',
 *   criadoPorId: 'user123',
 *   criadoEm: '2024-01-10T14:30:00Z',
 *   inicio: '2024-01-15T08:00:00Z',
 *   fim: '2024-01-15T18:00:00Z',
 *   referenciaGeoInicio: '-23.55052, -46.633308',
 *   referenciaGeoFim: '-23.55053, -46.633309',
 *   cidadeOrigem: 'Petrópolis',
 *   status: 'ATIVA'
 * };
 * ```
 */
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

/**
 * @interface PaginatedReservaResponse
 * @description Resposta paginada da API de reservas
 */
export interface PaginatedReservaResponse {
  content: ReservaGet[];
  totalElementos: number;
  totalPaginas: number;
  tamanhoPagina: number;
  pagina: number;
}
