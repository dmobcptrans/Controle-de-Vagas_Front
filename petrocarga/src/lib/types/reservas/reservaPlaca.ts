/**
 * @module types/reservaPlaca
 * @description Definições de tipos TypeScript para consulta de reservas por placa.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. EnderecoVaga - Endereço da vaga associada
 * 2. UsuarioReserva - Informações do usuário que criou a reserva
 * 3. ReservaPlaca - Reserva completa para consulta por placa
 * 4. ReservasPorPlacaResponse - Resposta paginada da consulta
 */

/**
 * @interface EnderecoVaga
 * @description Endereço da vaga associada à reserva.
 *
 * @property {string} id - ID do endereço
 * @property {string} codigoPmp - Código PMP da rua (ex: "Md-1234")
 * @property {string} logradouro - Nome da rua/avenida
 * @property {string} bairro - Bairro da vaga
 *
 * @example
 * ```ts
 * const endereco: EnderecoVaga = {
 *   id: 'end123',
 *   codigoPmp: 'Md-1234',
 *   logradouro: 'Rua do Imperador',
 *   bairro: 'Centro'
 * };
 * ```
 */
export interface EnderecoVaga {
  id: string;
  codigoPmp: string;
  logradouro: string;
  bairro: string;
}

/**
 * @interface UsuarioReserva
 * @description Informações do usuário que criou/modificou a reserva.
 * Similar ao UsuarioCriadoPor mas com campos adicionais.
 *
 * @property {string} id - ID do usuário
 * @property {string} nome - Nome completo
 * @property {string} cpf - CPF
 * @property {string} telefone - Telefone
 * @property {string} email - Email
 * @property {string} permissao - Nível de acesso (ex: 'MOTORISTA', 'GESTOR')
 * @property {string} criadoEm - Data de criação do usuário (ISO)
 * @property {boolean} ativo - Status do usuário
 * @property {string} [desativadoEm] - Data de desativação (opcional)
 *
 * @example
 * ```ts
 * const usuario: UsuarioReserva = {
 *   id: 'user123',
 *   nome: 'Maria Gestora',
 *   cpf: '98765432100',
 *   telefone: '21999998888',
 *   email: 'maria@email.com',
 *   permissao: 'GESTOR',
 *   criadoEm: '2023-01-01T00:00:00Z',
 *   ativo: true
 * };
 * ```
 */
export interface UsuarioReserva {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  permissao: string;
  criadoEm: string;
  ativo: boolean;
  desativadoEm?: string;
}

/**
 * @interface ReservaPlaca
 * @description Representação de uma reserva para consulta por placa.
 * Estrutura otimizada para exibição em cards de resultados.
 *
 * ----------------------------------------------------------------------------
 * 🔍 IDENTIFICADORES
 * ----------------------------------------------------------------------------
 * @property {string} id - ID único da reserva
 * @property {string} vagaId - ID da vaga
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
 * @property {string} placaVeiculo - Placa do veículo (usada na consulta)
 * @property {string} modeloVeiculo - Modelo do veículo
 * @property {string} marcaVeiculo - Marca do veículo
 * @property {string} cpfProprietarioVeiculo - CPF do proprietário
 * @property {string} cnpjProprietarioVeiculo - CNPJ do proprietário
 *
 * ----------------------------------------------------------------------------
 * 📊 STATUS
 * ----------------------------------------------------------------------------
 * @property {'RESERVADA' | 'ATIVA' | 'FINALIZADA' | 'CANCELADA'} status - Status da reserva
 *   - RESERVADA: Agendada (não iniciada)
 *   - ATIVA: Em andamento
 *   - FINALIZADA: Concluída
 *   - CANCELADA: Cancelada
 *
 * ----------------------------------------------------------------------------
 * 📝 AUDITORIA
 * ----------------------------------------------------------------------------
 * @property {UsuarioReserva} criadoPor - Usuário que criou a reserva
 * @property {string} criadoEm - Data de criação
 *
 * @example
 * ```ts
 * const reserva: ReservaPlaca = {
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
 *   cnpjProprietarioVeiculo: '',
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
 *     ativo: true
 *   },
 *   criadoEm: '2024-01-10T14:30:00Z'
 * };
 * ```
 */
export interface ReservaPlaca {
  id: string;
  vagaId: string;
  motoristaId: string;
  motoristaNome: string;
  motoristaCpf: string;
  numeroEndereco: string;
  referenciaEndereco: string;
  enderecoVaga: EnderecoVaga;
  inicio: string;
  fim: string;
  tamanhoVeiculo: number;
  placaVeiculo: string;
  modeloVeiculo: string;
  marcaVeiculo: string;
  cpfProprietarioVeiculo: string;
  cnpjProprietarioVeiculo: string;
  status: 'RESERVADA' | 'ATIVA' | 'FINALIZADA' | 'CANCELADA';
  criadoPor: UsuarioReserva;
  criadoEm: string;
}

/**
 * @interface ReservasPorPlacaResponse
 * @description Resposta da API de consulta de reservas por placa.
 * Inclui os resultados e informações de paginação.
 *
 * @property {ReservaPlaca[]} reservas - Lista de reservas encontradas
 * @property {number} total - Total de reservas (para paginação)
 *
 * @example
 * ```ts
 * const response: ReservasPorPlacaResponse = {
 *   reservas: [reserva1, reserva2, reserva3],
 *   total: 3
 * };
 * ```
 */
export interface ReservasPorPlacaResponse {
  reservas: ReservaPlaca[];
  total: number;
}
