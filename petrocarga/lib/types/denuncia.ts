/**
 * @module types/denuncia
 * @description Definições de tipos TypeScript para o módulo de Denúncias.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. EnderecoVaga - Endereço da vaga envolvida na denúncia
 * 2. Denuncia - Denúncia completa com todas as informações
 */

/**
 * @type EnderecoVaga
 * @description Endereço da vaga associada à denúncia.
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
export type EnderecoVaga = {
  id: string;
  codigoPmp: string;
  logradouro: string;
  bairro: string;
};

/**
 * @type Denuncia
 * @description Representa uma denúncia completa no sistema.
 * Contém informações sobre a denúncia em si, o motorista envolvido,
 * o veículo, a vaga e o status do processo de análise.
 *
 * ----------------------------------------------------------------------------
 * 🔍 IDENTIFICADORES
 * ----------------------------------------------------------------------------
 * @property {string} id - ID único da denúncia
 * @property {string} criadoPorId - ID do usuário que criou a denúncia
 * @property {string} vagaId - ID da vaga denunciada
 * @property {string} reservaId - ID da reserva associada
 * @property {string} veiculoId - ID do veículo envolvido
 *
 * ----------------------------------------------------------------------------
 * 👤 MOTORISTA
 * ----------------------------------------------------------------------------
 * @property {string} nomeMotorista - Nome do motorista denunciado
 * @property {string} telefoneMotorista - Telefone do motorista
 *
 * ----------------------------------------------------------------------------
 * 📝 DESCRIÇÃO
 * ----------------------------------------------------------------------------
 * @property {string} descricao - Descrição detalhada da denúncia
 *
 * ----------------------------------------------------------------------------
 * 📍 VAGA
 * ----------------------------------------------------------------------------
 * @property {EnderecoVaga} enderecoVaga - Endereço da vaga
 * @property {string} numeroEndereco - Números de referência (ex: "90 ao 130")
 * @property {string} referenciaEndereco - Pontos de referência adicionais
 *
 * ----------------------------------------------------------------------------
 * 🚗 VEÍCULO
 * ----------------------------------------------------------------------------
 * @property {string} marcaVeiculo - Marca do veículo
 * @property {string} modeloVeiculo - Modelo do veículo
 * @property {string} placaVeiculo - Placa do veículo
 * @property {number} tamanhoVeiculo - Tamanho/comprimento do veículo em metros
 *
 * ----------------------------------------------------------------------------
 * 📊 STATUS E TIPO
 * ----------------------------------------------------------------------------
 * @property {'ABERTA' | 'EM_ANALISE' | 'PROCEDENTE' | 'IMPROCEDENTE'} status - Status atual da denúncia
 * @property {'USO_INDEVIDO_DA_VAGA'} tipo - Tipo da denúncia (apenas um tipo atualmente)
 *
 * ----------------------------------------------------------------------------
 * ⚖️ ANÁLISE
 * ----------------------------------------------------------------------------
 * @property {string} resposta - Resposta/parecer da análise
 * @property {string} atualizadoPorId - ID do usuário que fez a última atualização
 *
 * ----------------------------------------------------------------------------
 * ⏰ DATAS
 * ----------------------------------------------------------------------------
 * @property {string} criadoEm - Data de criação (ISO string)
 * @property {string} atualizadoEm - Data da última atualização (ISO string)
 * @property {string} encerradoEm - Data de encerramento (ISO string)
 *
 * @example
 * ```ts
 * const denuncia: Denuncia = {
 *   id: 'den123',
 *   criadoPorId: 'user123',
 *   vagaId: 'vaga456',
 *   reservaId: 'res789',
 *   veiculoId: 'veic321',
 *
 *   nomeMotorista: 'João Silva',
 *   telefoneMotorista: '21999998888',
 *
 *   descricao: 'Veículo estacionado em vaga de carga/descarga',
 *
 *   enderecoVaga: {
 *     id: 'end123',
 *     codigoPmp: 'Md-1234',
 *     logradouro: 'Rua do Imperador',
 *     bairro: 'Centro'
 *   },
 *   numeroEndereco: '90 ao 130',
 *   referenciaEndereco: 'Em frente à praça',
 *
 *   marcaVeiculo: 'Fiat',
 *   modeloVeiculo: 'Uno',
 *   placaVeiculo: 'ABC1234',
 *   tamanhoVeiculo: 4.5,
 *
 *   status: 'EM_ANALISE',
 *   tipo: 'USO_INDEVIDO_DA_VAGA',
 *
 *   resposta: 'Denúncia procedente, veículo estava em vaga irregular',
 *   atualizadoPorId: 'gestor456',
 *
 *   criadoEm: '2024-01-15T10:30:00Z',
 *   atualizadoEm: '2024-01-16T14:20:00Z',
 *   encerradoEm: '2024-01-16T14:20:00Z'
 * };
 * ```
 */
export type Denuncia = {
  // Identificadores
  id: string;
  criadoPorId: string;
  vagaId: string;
  reservaId: string;
  veiculoId: string;

  // Motorista
  nomeMotorista: string;
  telefoneMotorista: string;

  // Descrição
  descricao: string;

  // Vaga
  enderecoVaga: EnderecoVaga;
  numeroEndereco: string;
  referenciaEndereco: string;

  // Veículo
  marcaVeiculo: string;
  modeloVeiculo: string;
  placaVeiculo: string;
  tamanhoVeiculo: number;

  // Status e Tipo
  status: 'ABERTA' | 'EM_ANALISE' | 'PROCEDENTE' | 'IMPROCEDENTE';
  tipo: 'USO_INDEVIDO_DA_VAGA';

  // Análise
  resposta: string;
  atualizadoPorId: string;

  // Datas
  criadoEm: string;
  atualizadoEm: string;
  encerradoEm: string;
};
