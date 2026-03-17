/**
 * @module types/motorista
 * @description Definições de tipos TypeScript para o módulo de Motoristas.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Usuario - Dados base de usuário (reutilizado)
 * 2. Motorista - Motorista completo com usuário aninhado
 * 3. MotoristaUsuario - Dados de usuário para criação
 * 4. MotoristaPayload - Payload completo para criação
 * 5. MotoristaPatchPayload - Payload para atualização
 * 6. MotoristaResult - Resposta padronizada da API
 * 7. FiltrosMotorista - Parâmetros para filtragem
 */

/**
 * @type Usuario
 * @description Dados básicos de um usuário do sistema.
 * Reutilizado de outros módulos para consistência.
 *
 * @property {string} id - Identificador único do usuário
 * @property {string} nome - Nome completo do usuário
 * @property {string} email - Email do usuário
 * @property {string} telefone - Telefone com DDD
 * @property {string} cpf - CPF (apenas números)
 */
export type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
};

/**
 * @type Motorista
 * @description Representa um motorista completo, com seus dados específicos
 * e o objeto Usuario aninhado (similar à estrutura de Agente).
 *
 * @property {string} id - ID do motorista (mesmo do usuário)
 * @property {string} numeroCnh - Número da CNH
 * @property {string} tipoCnh - Categoria da CNH (ex: 'B', 'AB', 'C', etc.)
 * @property {string} dataValidadeCnh - Data de validade da CNH (ISO string)
 * @property {string | null} empresaId - ID da empresa associada (opcional)
 * @property {Usuario} usuario - Dados do usuário aninhados
 *
 * @example
 * ```ts
 * const motorista: Motorista = {
 *   id: '123',
 *   numeroCnh: '12345678900',
 *   tipoCnh: 'B',
 *   dataValidadeCnh: '2025-12-31',
 *   empresaId: null,
 *   usuario: {
 *     id: '123',
 *     nome: 'João Silva',
 *     email: 'joao@email.com',
 *     telefone: '21999998888',
 *     cpf: '12345678900'
 *   }
 * };
 * ```
 */
export type Motorista = {
  id: string;
  numeroCnh: string;
  tipoCnh: string;
  dataValidadeCnh: string;
  empresaId?: string | null;
  usuario: Usuario;
};

/**
 * @type MotoristaUsuario
 * @description Dados do usuário para criação de motorista.
 * Usado dentro de MotoristaPayload, separado para organização.
 *
 * @property {string} nome - Nome completo
 * @property {string} cpf - CPF (apenas números)
 * @property {string} telefone - Telefone com DDD
 * @property {string} email - Email
 * @property {string} senha - Senha de acesso
 */
export type MotoristaUsuario = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
};

/**
 * @type MotoristaPayload
 * @description Payload completo para criação de um novo motorista.
 * Estrutura aninhada com usuario + dados da CNH.
 *
 * @property {MotoristaUsuario} usuario - Dados do usuário
 * @property {string} tipoCnh - Categoria da CNH
 * @property {string} numeroCnh - Número da CNH
 * @property {string} dataValidadeCnh - Data de validade
 *
 * @example
 * ```ts
 * const payload: MotoristaPayload = {
 *   usuario: {
 *     nome: 'João Silva',
 *     cpf: '12345678900',
 *     telefone: '21999998888',
 *     email: 'joao@email.com',
 *     senha: 'senha123'
 *   },
 *   tipoCnh: 'B',
 *   numeroCnh: '12345678900',
 *   dataValidadeCnh: '2025-12-31'
 * };
 * ```
 */
export type MotoristaPayload = {
  usuario: MotoristaUsuario;
  tipoCnh: string;
  numeroCnh: string;
  dataValidadeCnh: string;
};

/**
 * @type MotoristaPatchPayload
 * @description Payload para atualização de motorista.
 * Diferente da criação, aqui os campos são diretos (sem aninhamento).
 *
 * @property {string} nome - Nome completo
 * @property {string} cpf - CPF
 * @property {string} telefone - Telefone
 * @property {string} email - Email
 * @property {string} senha - Senha (opcional na prática)
 * @property {string} tipoCnh - Categoria da CNH
 * @property {string} numeroCnh - Número da CNH
 * @property {string} dataValidadeCnh - Data de validade
 *
 * @example
 * ```ts
 * const updatePayload: MotoristaPatchPayload = {
 *   nome: 'João Silva Atualizado',
 *   cpf: '12345678900',
 *   telefone: '21999997777',
 *   email: 'joao.novo@email.com',
 *   senha: 'novaSenha123',
 *   tipoCnh: 'AB',
 *   numeroCnh: '12345678900',
 *   dataValidadeCnh: '2026-12-31'
 * };
 * ```
 */
export type MotoristaPatchPayload = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  tipoCnh: string;
  numeroCnh: string;
  dataValidadeCnh: string;
};

/**
 * @type MotoristaResult
 * @description Resposta padronizada das APIs de motorista.
 *
 * @property {boolean} error - Indica se houve erro na operação
 * @property {string} [message] - Mensagem descritiva
 * @property {MotoristaPayload} [valores] - Valores enviados (em caso de erro)
 * @property {string} [motoristaId] - ID do motorista
 * @property {unknown} [motorista] - Objeto motorista único (tipo genérico)
 * @property {unknown[]} [motoristas] - Lista de motoristas (tipo genérico)
 *
 * @example
 * ```ts
 * const result: MotoristaResult = {
 *   error: false,
 *   message: 'Motorista cadastrado com sucesso',
 *   motoristaId: '123'
 * };
 * ```
 */
export type MotoristaResult = {
  error: boolean;
  message?: string;
  valores?: MotoristaPayload;
  motoristaId?: string;
  motorista?: unknown;
  motoristas?: unknown[];
};

/**
 * @interface FiltrosMotorista
 * @description Parâmetros opcionais para filtrar listas de motoristas.
 *
 * @property {string} [nome] - Filtrar por nome (busca parcial)
 * @property {string} [cnh] - Filtrar por número da CNH
 * @property {string} [telefone] - Filtrar por telefone
 * @property {boolean} [ativo] - Filtrar por status (ativo/inativo)
 *
 * @example
 * ```ts
 * const filtros: FiltrosMotorista = {
 *   nome: 'João',
 *   ativo: true
 * };
 * ```
 */
export interface FiltrosMotorista {
  nome?: string;
  cnh?: string;
  telefone?: string;
  ativo?: boolean;
}
