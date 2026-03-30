/**
 * @module types/gestor
 * @description Definições de tipos TypeScript para o módulo de Gestores.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Gestor - Representação completa de um gestor
 * 2. FiltrosGestor - Parâmetros para filtragem de listas
 * 3. GestorInput - Dados para criação/atualização
 * 4. GestorResponse - Resposta padronizada da API
 */

/**
 * @type Gestor
 * @description Representa um gestor completo no sistema.
 * Diferente do Agente, o Gestor não possui matrícula e os dados
 * são diretamente no objeto (sem aninhamento de usuario).
 *
 * @property {string} id - ID único do gestor
 * @property {string} nome - Nome completo do gestor
 * @property {string} cpf - CPF (apenas números)
 * @property {string} telefone - Telefone com DDD (apenas números)
 * @property {string} email - Email institucional
 * @property {string} senha - Senha de acesso (hash)
 * @property {boolean} ativo - Status do gestor (ativo/inativo)
 *
 * @example
 * ```ts
 * const gestor: Gestor = {
 *   id: '123',
 *   nome: 'Maria Silva',
 *   cpf: '12345678900',
 *   telefone: '21999998888',
 *   email: 'maria@email.com',
 *   senha: 'hash123'
 * };
 * ```
 */
export type Gestor = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  ativo: boolean;
};

/**
 * @interface FiltrosGestor
 * @description Parâmetros opcionais para filtrar listas de gestores.
 * Todos os campos são opcionais.
 *
 * @property {string} [nome] - Filtrar por nome (busca parcial)
 * @property {string} [email] - Filtrar por email
 * @property {string} [telefone] - Filtrar por telefone
 * @property {boolean} [ativo] - Filtrar por status (ativo/inativo)
 *
 * @example
 * ```ts
 * const filtros: FiltrosGestor = {
 *   nome: 'Maria',
 *   ativo: true
 * };
 *
 * // Uso com a API
 * const result = await getGestores(filtros);
 * ```
 */
export interface FiltrosGestor {
  nome?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}

/**
 * @type GestorInput
 * @description Dados necessários para criar ou atualizar um gestor.
 *
 * @property {string} [id] - ID (opcional na criação, obrigatório na atualização)
 * @property {string} nome - Nome completo do gestor
 * @property {string} cpf - CPF (apenas números)
 * @property {string} telefone - Telefone com DDD (apenas números)
 * @property {string} email - Email institucional
 * @property {string} [senha] - Senha (opcional na atualização)
 *
 * @example
 * ```ts
 * // Criando novo gestor
 * const novoGestor: GestorInput = {
 *   nome: 'João Santos',
 *   cpf: '98765432100',
 *   telefone: '21999997777',
 *   email: 'joao@email.com'
 * };
 *
 * // Atualizando gestor existente
 * const atualizacao: GestorInput = {
 *   id: '123',
 *   nome: 'João Santos Atualizado',
 *   cpf: '98765432100',
 *   telefone: '21999996666',
 *   email: 'joao.novo@email.com'
 * };
 * ```
 */
export type GestorInput = {
  id?: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha?: string;
};

/**
 * @type GestorResponse
 * @description Resposta padronizada das APIs de gestor.
 * Pode conter diferentes combinações de campos dependendo da operação.
 *
 * @property {boolean} [error] - Indica se houve erro na operação
 * @property {string} [message] - Mensagem descritiva (sucesso ou erro)
 * @property {GestorInput} [valores] - Valores enviados (em caso de erro)
 * @property {string} [gestorId] - ID do gestor (em operações específicas)
 * @property {Gestor} [gestor] - Objeto gestor único
 * @property {Gestor[]} [gestores] - Lista de gestores
 *
 * @example
 * ```ts
 * // Sucesso com lista
 * const successResponse: GestorResponse = {
 *   error: false,
 *   message: 'Gestores encontrados',
 *   gestores: [...]
 * };
 *
 * // Sucesso com único gestor
 * const singleResponse: GestorResponse = {
 *   error: false,
 *   message: 'Gestor encontrado',
 *   gestor: {...}
 * };
 *
 * // Erro com valores enviados
 * const errorResponse: GestorResponse = {
 *   error: true,
 *   message: 'Erro ao cadastrar',
 *   valores: {...}
 * };
 * ```
 */
export type GestorResponse = {
  error?: boolean;
  message?: string;
  valores?: GestorInput;
  gestorId?: string;
  gestor?: Gestor;
  gestores?: Gestor[];
};
