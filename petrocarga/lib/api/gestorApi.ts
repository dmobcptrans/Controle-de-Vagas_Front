'use client';

import { clientApi } from '../clientApi';
import type { GestorInput, GestorResponse } from '@/lib/types/gestor';

/**
 * @module gestorApi
 * @description Módulo de API para gerenciamento de gestores.
 * Fornece funções para criar, ler, atualizar e deletar gestores.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. addGestor - Cadastra um novo gestor
 * 2. deleteGestor - Remove um gestor existente
 * 3. atualizarGestor - Atualiza dados de um gestor
 * 4. getGestores - Lista gestores com filtros opcionais
 * 5. getGestorByUserId - Busca gestor pelo ID do usuário
 *
 * ----------------------------------------------------------------------------
 * 🔗 TIPOS RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - GestorInput: Dados para criação/atualização (nome, cpf, telefone, email, senha)
 * - GestorResponse: Resposta padronizada { error, message, valores? }
 */

// ----------------------
// ADD GESTOR
// ----------------------

/**
 * @function addGestor
 * @description Server Action para cadastrar um novo gestor.
 *
 * @param _ - Estado anterior (não utilizado, mantido por compatibilidade)
 * @param formData - Formulário com dados do gestor
 *
 * @returns Promise<GestorResponse>
 *
 * Campos do FormData:
 * - nome: Nome completo do gestor
 * - cpf: CPF (apenas números)
 * - telefone: Telefone com DDD (apenas números)
 * - email: Email institucional
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('nome', 'Maria Silva');
 * formData.append('cpf', '12345678900');
 *
 * const result = await addGestor(null, formData);
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function addGestor(_: unknown, formData: FormData) {
  const payload = {
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
  };

  try {
    await clientApi(`/petrocarga/gestores`, {
      method: 'POST',
      json: payload,
    });

    return { error: false, message: 'Gestor cadastrado com sucesso!' };
  } catch (err) {
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro ao cadastrar gestor',
      valores: payload,
    };
  }
}

// ----------------------
// DELETE GESTOR
// ----------------------

/**
 * @function deleteGestor
 * @description Remove um gestor existente pelo ID.
 *
 * @param gestorId - ID do gestor a ser deletado
 * @returns Promise<GestorResponse>
 *
 * @example
 * ```ts
 * const result = await deleteGestor('123');
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function deleteGestor(gestorId: string): Promise<GestorResponse> {
  try {
    await clientApi(`/petrocarga/gestores/${gestorId}`, { method: 'DELETE' });
    return { error: false, message: 'Gestor deletado com sucesso!' };
  } catch (err: unknown) {
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro ao deletar gestor',
    };
  }
}

// ----------------------
// ATUALIZAR GESTOR
// ----------------------

/**
 * @function atualizarGestor
 * @description Atualiza dados de um gestor existente.
 *
 * @param formData - Formulário com dados do gestor (inclui ID)
 * @returns Promise<GestorResponse>
 *
 * Campos do FormData:
 * - id: ID do gestor (obrigatório)
 * - nome: Nome completo do gestor
 * - cpf: CPF (apenas números)
 * - telefone: Telefone com DDD (apenas números)
 * - email: Email institucional
 * - senha: Nova senha (opcional)
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('id', '123');
 * formData.append('nome', 'Maria Silva');
 * formData.append('telefone', '21999998888');
 *
 * const result = await atualizarGestor(formData);
 * ```
 */
export async function atualizarGestor(
  formData: FormData,
): Promise<GestorResponse> {
  const usuarioId = formData.get('id') as string;

  const payload: GestorInput = {
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
    senha: formData.get('senha') as string,
  };

  try {
    await clientApi(`/petrocarga/gestores/${usuarioId}`, {
      method: 'PATCH',
      json: payload,
    });
    return { error: false, message: 'Gestor atualizado com sucesso!' };
  } catch (err: unknown) {
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro ao atualizar gestor',
      valores: payload,
    };
  }
}

// ----------------------
// GET GESTORES COM FILTROS
// ----------------------

/**
 * @function getGestores
 * @description Lista gestores com filtros opcionais.
 *
 * @param filtros - Objeto com filtros para a busca
 * @param filtros.nome - Nome do gestor (busca parcial)
 * @param filtros.email - Email do gestor
 * @param filtros.telefone - Telefone do gestor
 * @param filtros.ativo - Status (ativo/inativo)
 *
 * @returns Promise<{ error: boolean; message?: string; gestores?: Gestor[] }>
 *
 * @example
 * ```ts
 * // Buscar gestores ativos com nome "Maria"
 * const result = await getGestores({
 *   nome: 'Maria',
 *   ativo: true
 * });
 *
 * if (!result.error) {
 *   result.gestores?.forEach(gestor => {
 *     console.log(gestor.nome);
 *   });
 * }
 * ```
 */
export async function getGestores(filtros?: {
  nome?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}) {
  // Construir query string com filtros
  const params = new URLSearchParams();

  if (filtros?.nome) params.append('nome', filtros.nome);
  if (filtros?.email) params.append('email', filtros.email);
  if (filtros?.telefone) params.append('telefone', filtros.telefone);
  if (filtros?.ativo !== undefined)
    params.append('ativo', filtros.ativo.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/petrocarga/gestores?${queryString}`
    : `/petrocarga/gestores`;

  const res = await clientApi(url);

  if (!res.ok) {
    let msg = 'Erro ao buscar gestores';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const gestores = await res.json();
  return { error: false, gestores };
}

// ----------------------
// GET GESTOR BY USER ID
// ----------------------

/**
 * @function getGestorByUserId
 * @description Busca um gestor pelo ID do usuário.
 *
 * @param userId - ID do usuário
 * @returns Promise<{ error: boolean; message?: string; gestorId?: string; gestor?: Gestor }>
 *
 * @example
 * ```ts
 * const result = await getGestorByUserId('123');
 * if (result.error) {
 *   console.error(result.message);
 * } else {
 *   const gestor = result.gestor;
 *   console.log(gestor.nome);
 * }
 * ```
 */
export async function getGestorByUserId(userId: string) {
  const res = await clientApi(`/petrocarga/gestores/${userId}`);

  if (!res.ok) {
    let msg = 'Erro ao buscar gestor';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, gestorId: data.id, gestor: data };
}
