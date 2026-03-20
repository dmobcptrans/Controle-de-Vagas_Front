'use client';

import { clientApi } from '../clientApi';
import {
  MotoristaPayload,
  MotoristaPatchPayload,
  MotoristaResult,
} from '../types/motorista';

/**
 * @module motoristaApi
 * @description Módulo de API para gerenciamento de motoristas.
 * Fornece funções para criar, ler, atualizar e deletar motoristas,
 * incluindo dados específicos como CNH e tipo de carteira.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. addMotorista - Cadastra um novo motorista
 * 2. deleteMotorista - Remove um motorista existente
 * 3. atualizarMotorista - Atualiza dados de um motorista
 * 4. getMotoristaByUserId - Busca motorista pelo ID do usuário
 * 5. getMotoristas - Lista motoristas com filtros opcionais
 *
 * ----------------------------------------------------------------------------
 * 🔗 TIPOS RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - MotoristaPayload: Dados completos para criação (inclui usuario aninhado)
 * - MotoristaPatchPayload: Dados para atualização (inclui CNH)
 * - MotoristaResult: Resposta padronizada { error, message, valores? }
 */

// ----------------------
// ADD MOTORISTA
// ----------------------

/**
 * @function addMotorista
 * @description Server Action para cadastrar um novo motorista.
 * Inclui dados pessoais e informações da CNH.
 *
 * @param prevState - Estado anterior (usado pelo useActionState)
 * @param formData - Formulário com dados do motorista
 *
 * @returns Promise<MotoristaResult>
 *
 * Campos do FormData:
 * - nome: Nome completo do motorista
 * - cpf: CPF (apenas números)
 * - telefone: Telefone com DDD (apenas números)
 * - email: Email (convertido para minúsculas)
 * - senha: Senha de acesso
 * - tipoCnh: Categoria da CNH (convertido para maiúsculas)
 * - numeroCnh: Número da CNH
 * - dataValidadeCnh: Data de validade da CNH
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('nome', 'João Silva');
 * formData.append('cpf', '12345678900');
 * formData.append('tipoCnh', 'B');
 *
 * const result = await addMotorista(null, formData);
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function addMotorista(
  prevState: MotoristaResult | null,
  formData: FormData,
): Promise<MotoristaResult> {
  const payload: MotoristaPayload = {
    usuario: {
      nome: formData.get('nome') as string,
      cpf: formData.get('cpf') as string,
      telefone: formData.get('telefone') as string,
      email: (formData.get('email') as string).toLowerCase(),
      senha: formData.get('senha') as string,
    },
    tipoCnh: (formData.get('tipoCnh') as string)?.toUpperCase(),
    numeroCnh: formData.get('numeroCnh') as string,
    dataValidadeCnh: formData.get('dataValidadeCnh') as string,
  };

  try {
    await clientApi('/petrocarga/motoristas/cadastro', {
      method: 'POST',
      json: payload,
    });
    return { error: false, message: 'Motorista cadastrado com sucesso!' };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error ? err.message : 'Erro ao cadastrar motorista',
      valores: payload,
    };
  }
}

// ----------------------
// DELETE MOTORISTA
// ----------------------

/**
 * @function deleteMotorista
 * @description Remove um motorista existente pelo ID do usuário.
 *
 * @param usuarioId - ID do usuário a ser deletado
 * @returns Promise<MotoristaResult>
 *
 * @example
 * ```ts
 * const result = await deleteMotorista('123');
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function deleteMotorista(
  usuarioId: string,
): Promise<MotoristaResult> {
  try {
    await clientApi(`/petrocarga/motoristas/${usuarioId}`, {
      method: 'DELETE',
    });
    return { error: false, message: 'Motorista deletado com sucesso!' };
  } catch (err: unknown) {
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro ao deletar motorista',
    };
  }
}

// ----------------------
// ATUALIZAR MOTORISTA
// ----------------------

/**
 * @function atualizarMotorista
 * @description Atualiza dados de um motorista existente.
 *
 * @param formData - Formulário com dados do motorista (inclui ID)
 * @returns Promise<MotoristaResult>
 *
 * Campos do FormData:
 * - id: ID do motorista (obrigatório)
 * - nome: Nome completo do motorista
 * - cpf: CPF (apenas números)
 * - telefone: Telefone com DDD (apenas números)
 * - email: Email institucional
 * - senha: Nova senha (opcional)
 * - tipoCnh: Categoria da CNH (convertido para maiúsculas)
 * - numeroCnh: Número da CNH
 * - dataValidadeCnh: Data de validade da CNH
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('id', '123');
 * formData.append('nome', 'João Silva');
 * formData.append('tipoCnh', 'AB');
 *
 * const result = await atualizarMotorista(formData);
 * ```
 */
export async function atualizarMotorista(
  formData: FormData,
): Promise<MotoristaResult> {
  const id = formData.get('id') as string;

  const payload: MotoristaPatchPayload = {
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
    senha: formData.get('senha') as string,
    tipoCnh: (formData.get('tipoCnh') as string)?.toUpperCase(),
    numeroCnh: formData.get('numeroCnh') as string,
    dataValidadeCnh: formData.get('dataValidadeCnh') as string,
  };

  try {
    await clientApi(`/petrocarga/motoristas/${id}`, {
      method: 'PATCH',
      json: payload,
    });
    return { error: false, message: 'Motorista atualizado com sucesso!' };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error ? err.message : 'Erro ao atualizar motorista',
    };
  }
}

// ----------------------
// GET MOTORISTA BY USER ID
// ----------------------

/**
 * @function getMotoristaByUserId
 * @description Busca um motorista pelo ID do usuário.
 *
 * @param userId - ID do usuário
 * @returns Promise<{ error: boolean; message?: string; motoristaId?: string; motorista?: Motorista }>
 *
 * @example
 * ```ts
 * const result = await getMotoristaByUserId('123');
 * if (result.error) {
 *   console.error(result.message);
 * } else {
 *   const motorista = result.motorista;
 *   console.log(motorista.usuario.nome);
 *   console.log(motorista.tipoCnh);
 * }
 * ```
 */
export async function getMotoristaByUserId(userId: string) {
  const res = await clientApi(`/petrocarga/motoristas/${userId}`);

  if (!res.ok) {
    let msg = 'Erro ao buscar motorista';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, motoristaId: data.id, motorista: data };
}

// ----------------------
// GET MOTORISTAS COM FILTROS
// ----------------------

/**
 * @function getMotoristas
 * @description Lista motoristas com filtros opcionais.
 *
 * @param filtros - Objeto com filtros para a busca
 * @param filtros.nome - Nome do motorista (busca parcial)
 * @param filtros.cnh - Número da CNH
 * @param filtros.telefone - Telefone do motorista
 * @param filtros.ativo - Status (ativo/inativo)
 *
 * @returns Promise<{ error: boolean; message?: string; motoristas?: Motorista[] }>
 *
 * @example
 * ```ts
 * // Buscar motoristas ativos com CNH específica
 * const result = await getMotoristas({
 *   cnh: '12345678900',
 *   ativo: true
 * });
 *
 * if (!result.error) {
 *   result.motoristas?.forEach(motorista => {
 *     console.log(motorista.usuario.nome);
 *   });
 * }
 * ```
 */
export async function getMotoristas(filtros?: {
  nome?: string;
  cnh?: string;
  telefone?: string;
  ativo?: boolean;
}) {
  // Construir query string com filtros
  const params = new URLSearchParams();

  if (filtros?.nome) params.append('nome', filtros.nome);
  if (filtros?.cnh) params.append('cnh', filtros.cnh);
  if (filtros?.telefone) params.append('telefone', filtros.telefone);
  if (filtros?.ativo !== undefined)
    params.append('ativo', filtros.ativo.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/petrocarga/motoristas?${queryString}`
    : `/petrocarga/motoristas`;

  const res = await clientApi(url);

  if (!res.ok) {
    let msg = 'Erro ao buscar motoristas';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, motoristas: data };
}
