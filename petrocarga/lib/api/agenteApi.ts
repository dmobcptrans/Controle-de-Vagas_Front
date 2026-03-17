'use client';

import { clientApi } from '../clientApi';

import type {
  Agente,
  AgenteInput,
  AgenteResponse,
  FiltrosAgente,
} from '@/lib/types/agente';

/**
 * @module agenteApi
 * @description Módulo de API para gerenciamento de agentes.
 * Fornece funções para criar, ler, atualizar e deletar agentes.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. addAgente - Cadastra um novo agente
 * 2. deleteAgente - Remove um agente existente
 * 3. atualizarAgente - Atualiza dados de um agente
 * 4. getAgenteByUserId - Busca agente pelo ID do usuário
 * 5. getAgentes - Lista agentes com filtros opcionais
 *
 * ----------------------------------------------------------------------------
 * 🔗 TIPOS RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Agente: Tipo completo do agente
 * - AgenteInput: Dados para criação/atualização
 * - AgenteResponse: Resposta padronizada { error, message, ... }
 * - FiltrosAgente: Filtros para listagem
 */

// ----------------------
// ADD AGENTE
// ----------------------

/**
 * @function addAgente
 * @description Server Action para cadastrar um novo agente.
 *
 * @param _ - Estado anterior (não utilizado, mantido por compatibilidade)
 * @param formData - Formulário com dados do agente
 *
 * @returns Promise<AgenteResponse>
 *
 * Campos do FormData:
 * - nome: Nome completo do agente
 * - cpf: CPF (apenas números)
 * - telefone: Telefone com DDD (apenas números)
 * - email: Email institucional
 * - matricula: Matrícula do agente
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('nome', 'João Silva');
 * formData.append('cpf', '12345678900');
 *
 * const result = await addAgente(null, formData);
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function addAgente(_: unknown, formData: FormData) {
  const payload = {
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
    matricula: formData.get('matricula') as string,
  };

  const res = await clientApi(`/petrocarga/agentes`, {
    method: 'POST',
    json: payload,
  });

  if (!res.ok) {
    let msg = 'Erro ao cadastrar agente';

    try {
      const data = await res.json();
      msg = data.message ?? msg;
    } catch {}

    return { error: true, message: msg, valores: payload };
  }

  return { error: false, message: 'Agente cadastrado com sucesso!' };
}

// ----------------------
// DELETE AGENTE
// ----------------------

/**
 * @function deleteAgente
 * @description Remove um agente existente pelo ID.
 *
 * @param agenteId - ID do agente a ser deletado
 * @returns Promise<AgenteResponse>
 *
 * @example
 * ```ts
 * const result = await deleteAgente('123');
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function deleteAgente(agenteId: string): Promise<AgenteResponse> {
  try {
    await clientApi(`/petrocarga/agentes/${agenteId}`, { method: 'DELETE' });
    return { error: false, message: 'Agente deletado com sucesso!' };
  } catch (err: unknown) {
    console.error('Erro ao deletar agente:', err);
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}

// ----------------------
// ATUALIZAR AGENTE
// ----------------------

/**
 * @function atualizarAgente
 * @description Atualiza dados de um agente existente.
 *
 * @param formData - Formulário com dados do agente (inclui ID)
 * @returns Promise<AgenteResponse>
 *
 * Campos do FormData:
 * - id: ID do usuário (obrigatório)
 * - nome: Nome completo do agente
 * - cpf: CPF (apenas números)
 * - telefone: Telefone com DDD (apenas números)
 * - email: Email institucional
 * - matricula: Matrícula do agente
 * - senha: Nova senha (opcional)
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('id', '123');
 * formData.append('nome', 'João Silva');
 * formData.append('telefone', '21999998888');
 *
 * const result = await atualizarAgente(formData);
 * ```
 */
export async function atualizarAgente(
  formData: FormData,
): Promise<AgenteResponse> {
  const usuarioid = formData.get('id') as string;

  const payload: AgenteInput = {
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
    matricula: formData.get('matricula') as string,
    senha: formData.get('senha') as string,
  };

  try {
    await clientApi(`/petrocarga/agentes/${usuarioid}`, {
      method: 'PATCH',
      json: payload,
    });

    return { error: false, message: 'Agente atualizado com sucesso!' };
  } catch (err: unknown) {
    console.error('Erro ao atualizar agente:', err);
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}

// ----------------------
// GET AGENTE BY USER ID
// ----------------------

/**
 * @function getAgenteByUserId
 * @description Busca um agente pelo ID do usuário.
 *
 * @param userId - ID do usuário
 * @returns Promise<{ error: boolean; message?: string; agenteId?: string; agente?: Agente }>
 *
 * @example
 * ```ts
 * const result = await getAgenteByUserId('123');
 * if (result.error) {
 *   console.error(result.message);
 * } else {
 *   const agente = result.agente;
 *   console.log(agente.nome);
 * }
 * ```
 */
export async function getAgenteByUserId(userId: string) {
  const res = await clientApi(`/petrocarga/agentes/${userId}`);

  if (!res.ok) {
    let msg = 'Erro ao buscar agente';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, agenteId: data.id, agente: data };
}

// ----------------------
// GET AGENTES COM FILTROS
// ----------------------

/**
 * @function getAgentes
 * @description Lista agentes com filtros opcionais.
 *
 * @param filtros - Objeto com filtros para a busca
 * @param filtros.nome - Nome do agente (busca parcial)
 * @param filtros.matricula - Matrícula do agente
 * @param filtros.telefone - Telefone do agente
 * @param filtros.email - Email do agente
 * @param filtros.ativo - Status (ativo/inativo)
 *
 * @returns Promise<{ error: boolean; message?: string; agentes?: Agente[] }>
 *
 * @example
 * ```ts
 * // Buscar agentes ativos com nome "João"
 * const result = await getAgentes({
 *   nome: 'João',
 *   ativo: true
 * });
 *
 * if (!result.error) {
 *   result.agentes?.forEach(agente => {
 *     console.log(agente.nome);
 *   });
 * }
 * ```
 */
export async function getAgentes(filtros?: {
  nome?: string;
  matricula?: string;
  telefone?: string;
  ativo?: boolean;
  email?: string;
}) {
  // Construir query string com filtros
  const params = new URLSearchParams();

  if (filtros?.nome) params.append('nome', filtros.nome);
  if (filtros?.matricula) params.append('matricula', filtros.matricula);
  if (filtros?.telefone) params.append('telefone', filtros.telefone);
  if (filtros?.email) params.append('email', filtros.email);
  if (filtros?.ativo !== undefined)
    params.append('ativo', filtros.ativo.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/petrocarga/agentes?${queryString}`
    : `/petrocarga/agentes`;

  const res = await clientApi(url);

  if (!res.ok) {
    let msg = 'Erro ao buscar agentes';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, agentes: data };
}
