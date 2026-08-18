/**
 * @module types/empresa
 * @description Definições de tipos TypeScript para o módulo de Empresas.
 */

import { Paginacao } from '../paginacao';
import { UsuarioResponse } from './usuario';
import { Veiculo } from '../veiculo';

/**
 * @interface UsuarioEmpresa
 * @description Dados do usuário vinculado à empresa.
 */
export interface UsuarioEmpresa extends UsuarioResponse {
  criadoEm: string;
  ativo: boolean;
  veiculos: Veiculo[];
}

/**
 * @type Empresa
 * @description Representa uma empresa completa, com seus dados específicos
 * e o objeto Usuario aninhado.
 */
export type Empresa = {
  id: string;
  razaoSocial: string;
  usuario: UsuarioEmpresa;
};

/**
 * @type EmpresaPaginada
 * @description Lista paginada de empresas.
 */
export type EmpresaPaginada = Paginacao<Empresa>;

/**
 * @interface FiltrosEmpresa
 * @description Parâmetros opcionais para filtragem de empresas.
 */
export interface FiltrosEmpresa {
  nome?: string;
  razaoSocial?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}

/**
 * @type EmpresaInput
 * @description Dados necessários para criar ou atualizar uma empresa.
 *
 * @property {string} [id] - ID da empresa, usado na atualização
 * @property {string} nome - Nome do usuário/responsável
 * @property {string} cpf - CPF do usuário
 * @property {string} telefone - Telefone com DDD
 * @property {string} email - E-mail
 * @property {string} [senha] - Senha, opcional na atualização
 * @property {string} matricula - Matrícula
 * @property {string} cnpj - CNPJ da empresa
 * @property {string} razaoSocial - Razão social da empresa
 * @property {string} tipoCnh - Categoria da CNH
 * @property {string} numeroCnh - Número da CNH
 * @property {string} dataValidadeCnh - Data de validade da CNH
 * @property {string} [empresaId] - ID da empresa relacionada
 */
export type EmpresaInput = {
  id?: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha?: string;
  matricula: string;
  cnpj: string;
  razaoSocial: string;
  tipoCnh: string;
  numeroCnh: string;
  dataValidadeCnh: string;
  empresaId?: string;
};

/**
 * @type EmpresaResponse
 * @description Resposta padronizada das APIs de empresa.
 */
export type EmpresaResponse = {
  error?: boolean;
  message?: string;
  valores?: EmpresaInput;
  empresaId?: string;
  empresa?: Empresa;
  empresas?: Empresa[];
};