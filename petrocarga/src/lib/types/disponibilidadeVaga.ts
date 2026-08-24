// types/disponibilidade.ts

/**
 * @module types/disponibilidade
 * @description Definições de tipos TypeScript para o módulo de Disponibilidade de Vagas.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Disponibilidade - Disponibilidade completa de uma vaga
 * 2. DisponibilidadeVaga - Dados mínimos para criação/edição
 * 3. DisponibilidadeResponse - Resposta padronizada da API
 */

/**
 * @type Disponibilidade
 * @description Representa um período de disponibilidade de uma vaga.
 * Contém informações completas sobre quando uma vaga está disponível.
 *
 * @property {string} id - ID único da disponibilidade
 * @property {string} vagaId - ID da vaga associada
 *
 * @property {Object} endereco - Endereço da vaga
 * @property {string} endereco.id - ID do endereço
 * @property {string} endereco.codigoPmp - Código PMP da rua (ex: "Md-1234")
 * @property {string} endereco.logradouro - Nome da rua/avenida
 * @property {string} endereco.bairro - Bairro da vaga
 *
 * @property {string} referenciaEndereco - Pontos de referência adicionais
 * @property {string} numeroEndereco - Números de referência (ex: "90 ao 130")
 *
 * @property {string} inicio - Data/hora de início da disponibilidade (ISO string)
 * @property {string} fim - Data/hora de fim da disponibilidade (ISO string)
 *
 * @property {string} criadoEm - Data de criação do registro (ISO string)
 * @property {string} criadoPorId - ID do usuário que criou a disponibilidade
 *
 * @example
 * ```ts
 * const disponibilidade: Disponibilidade = {
 *   id: 'disp123',
 *   vagaId: 'vaga456',
 *   endereco: {
 *     id: 'end123',
 *     codigoPmp: 'Md-1234',
 *     logradouro: 'Rua do Imperador',
 *     bairro: 'Centro'
 *   },
 *   referenciaEndereco: 'Em frente à praça',
 *   numeroEndereco: '90 ao 130',
 *   inicio: '2024-01-01T08:00:00.000Z',
 *   fim: '2024-01-01T18:00:00.000Z',
 *   criadoEm: '2023-12-15T10:30:00.000Z',
 *   criadoPorId: 'user123'
 * };
 * ```
 */
export type Disponibilidade = {
  id: string;
  vagaId: string;
  endereco: {
    id: string;
    codigoPmp: string;
    logradouro: string;
    bairro: string;
  };
  referenciaEndereco: string;
  numeroEndereco: string;
  inicio: string;
  fim: string;
  criadoEm: string;
  criadoPorId: string;
};

/**
 * @type DisponibilidadeVaga
 * @description Versão simplificada da disponibilidade para criação/edição.
 * Usa o utilitário Pick do TypeScript para selecionar apenas os campos necessários.
 *
 * @property {string} vagaId - ID da vaga (obrigatório)
 * @property {string} inicio - Data/hora de início (obrigatório)
 * @property {string} fim - Data/hora de fim (obrigatório)
 * @property {string} [id] - ID (opcional, usado apenas em edições)
 *
 * @example
 * ```ts
 * // Criando nova disponibilidade
 * const novaDisponibilidade: DisponibilidadeVaga = {
 *   vagaId: 'vaga456',
 *   inicio: '2024-01-01T08:00:00.000Z',
 *   fim: '2024-01-01T18:00:00.000Z'
 * };
 *
 * // Editando disponibilidade existente
 * const edicaoDisponibilidade: DisponibilidadeVaga = {
 *   id: 'disp123',
 *   vagaId: 'vaga456',
 *   inicio: '2024-01-01T09:00:00.000Z',
 *   fim: '2024-01-01T17:00:00.000Z'
 * };
 * ```
 */
export type DisponibilidadeVaga = Pick<
  Disponibilidade,
  'vagaId' | 'inicio' | 'fim'
> & {
  id?: string;
};

/**
 * @type DisponibilidadeResponse
 * @description Resposta padronizada das APIs de disponibilidade.
 *
 * @property {boolean} [error] - Indica se houve erro na operação
 * @property {boolean} [success] - Indica se a operação foi bem-sucedida (alternativo a error)
 * @property {string} [message] - Mensagem descritiva (sucesso ou erro)
 * @property {DisponibilidadeVaga} [valores] - Valores enviados (útil em caso de erro)
 *
 * @example
 * ```ts
 * // Resposta de sucesso
 * const successResponse: DisponibilidadeResponse = {
 *   success: true,
 *   message: 'Disponibilidade cadastrada com sucesso'
 * };
 *
 * // Resposta de erro
 * const errorResponse: DisponibilidadeResponse = {
 *   error: true,
 *   message: 'Período conflita com disponibilidade existente',
 *   valores: { vagaId: 'vaga456', inicio: '...', fim: '...' }
 * };
 * ```
 */
export type DisponibilidadeResponse = {
  error?: boolean;
  message?: string;
  valores?: DisponibilidadeVaga;
  success?: boolean;
};
