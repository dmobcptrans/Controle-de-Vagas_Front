/**
 * @module types/agente
 * @description Definições de tipos TypeScript para o módulo de Agentes.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Usuario - Dados base de usuário
 * 2. Agente - Agente completo com usuário aninhado
 * 3. FiltrosAgente - Parâmetros para filtragem
 * 4. AgenteInput - Dados para criação/atualização
 * 5. AgenteResponse - Resposta padronizada da API
 */

/**
 * @type Usuario
 * @description Dados básicos de um usuário do sistema.
 *
 * @property {string} id - Identificador único do usuário
 * @property {string} nome - Nome completo do usuário
 * @property {string} cpf - CPF (apenas números)
 * @property {string} telefone - Telefone com DDD (apenas números)
 * @property {string} email - Email do usuário
 * @property {string} senha - Senha de acesso (hash)
 *
 * @example
 * ```ts
 * const usuario: Usuario = {
 *   id: '123',
 *   nome: 'João Silva',
 *   cpf: '12345678900',
 *   telefone: '21999998888',
 *   email: 'joao@email.com',
 *   senha: 'hash123'
 * };
 * ```
 */
export type Usuario = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
};

/**
 * @type Agente
 * @description Representa um agente completo, com seus dados específicos
 * e o objeto Usuario aninhado.
 *
 * @property {string} id - ID do agente (mesmo do usuário)
 * @property {string} matricula - Matrícula do agente na organização
 * @property {Usuario} usuario - Dados do usuário aninhados
 * @property {boolean} ativo - Status do usuário (ativo/inativo)
 * @example
 * ```ts
 * const agente: Agente = {
 *   id: '123',
 *   matricula: 'AGT001',
 *   usuario: {
 *     id: '123',
 *     nome: 'João Silva',
 *     cpf: '12345678900',
 *     telefone: '21999998888',
 *     email: 'joao@email.com',
 *     senha: 'hash123'
 *   }
 * };
 * ```
 */
export type Agente = {
  id: string;
  matricula: string;
  usuario: Usuario;
  ativo: boolean;
};

/**
 * @interface FiltrosAgente
 * @description Parâmetros opcionais para filtrar listas de agentes.
 * Todos os campos são opcionais.
 *
 * @property {string} [nome] - Filtrar por nome (busca parcial)
 * @property {string} [matricula] - Filtrar por matrícula
 * @property {string} [email] - Filtrar por email
 * @property {string} [telefone] - Filtrar por telefone
 * @property {boolean} [ativo] - Filtrar por status (ativo/inativo)
 *
 * @example
 * ```ts
 * const filtros: FiltrosAgente = {
 *   nome: 'João',
 *   ativo: true
 * };
 *
 * // Uso com a API
 * const result = await getAgentes(filtros);
 * ```
 */
export interface FiltrosAgente {
  nome?: string;
  matricula?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}

/**
 * @type AgenteInput
 * @description Dados necessários para criar ou atualizar um agente.
 *
 * @property {string} [id] - ID (opcional na criação, obrigatório na atualização)
 * @property {string} nome - Nome completo do agente
 * @property {string} cpf - CPF (apenas números)
 * @property {string} telefone - Telefone com DDD (apenas números)
 * @property {string} email - Email institucional
 * @property {string} matricula - Matrícula do agente
 * @property {string} [senha] - Senha (opcional na atualização)
 *
 * @example
 * ```ts
 * const novoAgente: AgenteInput = {
 *   nome: 'Maria Souza',
 *   cpf: '98765432100',
 *   telefone: '21999997777',
 *   email: 'maria@email.com',
 *   matricula: 'AGT002'
 * };
 * ```
 */
export type AgenteInput = {
  id?: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  matricula: string;
  senha?: string;
};

/**
 * @type AgenteResponse
 * @description Resposta padronizada das APIs de agente.
 * Pode conter diferentes combinações de campos dependendo da operação.
 *
 * @property {boolean} [error] - Indica se houve erro na operação
 * @property {string} [message] - Mensagem descritiva (sucesso ou erro)
 * @property {AgenteInput} [valores] - Valores enviados (em caso de erro)
 * @property {string} [agenteId] - ID do agente (em operações específicas)
 * @property {Agente} [agente] - Objeto agente único
 * @property {Agente[]} [agentes] - Lista de agentes
 *
 * @example
 * ```ts
 * // Sucesso com lista
 * const successResponse: AgenteResponse = {
 *   error: false,
 *   message: 'Agentes encontrados',
 *   agentes: [...]
 * };
 *
 * // Erro com valores enviados
 * const errorResponse: AgenteResponse = {
 *   error: true,
 *   message: 'Erro ao cadastrar',
 *   valores: {...}
 * };
 * ```
 */
export type AgenteResponse = {
  error?: boolean;
  message?: string;
  valores?: AgenteInput;
  agenteId?: string;
  agente?: Agente;
  agentes?: Agente[];
};
