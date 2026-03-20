'use client';

import { clientApi } from '../clientApi';
import type {
  DisponibilidadeVaga,
  DisponibilidadeResponse,
} from '@/lib//types/disponibilidadeVagas';

/**
 * @module disponibilidadeApi
 * @description Módulo de API para gerenciamento de disponibilidade de vagas.
 * Permite criar, listar, editar e deletar períodos de disponibilidade.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. addDisponibilidadeVagas - Cria nova disponibilidade para uma ou mais vagas
 * 2. getDisponibilidadeVagas - Lista todas as disponibilidades
 * 3. getDisponibilidadeVagasByVagaId - Lista disponibilidades de uma vaga específica
 * 4. editarDisponibilidadeVagas - Atualiza uma disponibilidade existente
 * 5. deleteDisponibilidadeVagas - Remove uma disponibilidade
 *
 * ----------------------------------------------------------------------------
 * 🔗 TIPOS RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - DisponibilidadeVaga: { vagaId: string; inicio: string; fim: string }
 * - DisponibilidadeResponse: { success?: boolean; error?: boolean; message?: string; valores?: any }
 */

// ----------------------
// POST DISPONIBILIDADE VAGAS
// ----------------------

/**
 * @function addDisponibilidadeVagas
 * @description Cria um novo período de disponibilidade para uma ou mais vagas.
 *
 * @param formData - Formulário com dados da disponibilidade
 * @param formData.vagaid - ID(s) da(s) vaga(s) (pode ser múltiplo)
 * @param formData.inicio - Data/hora de início (formato ISO)
 * @param formData.fim - Data/hora de fim (formato ISO)
 *
 * @returns Promise<DisponibilidadeResponse>
 *
 * @throws Erro se a requisição falhar
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('vagaid', '123');
 * formData.append('vagaid', '456'); // Múltiplas vagas
 * formData.append('inicio', '2024-01-01T08:00:00');
 * formData.append('fim', '2024-01-01T18:00:00');
 *
 * const result = await addDisponibilidadeVagas(formData);
 * ```
 */
export async function addDisponibilidadeVagas(formData: FormData) {
  const vagaIds = formData.getAll('vagaid') as string[];

  const body = {
    listaVagaId: vagaIds,
    inicio: new Date(formData.get('inicio') as string).toISOString(),
    fim: new Date(formData.get('fim') as string).toISOString(),
  };

  try {
    const res = await clientApi('/petrocarga/disponibilidade-vagas/vagas', {
      method: 'POST',
      json: body,
    });
    return await res.json();
  } catch (err) {
    console.error('Erro ao adicionar disponibilidade:', err);
    throw err;
  }
}

// ----------------------
// GET DISPONIBILIDADE VAGAS
// ----------------------

/**
 * @function getDisponibilidadeVagas
 * @description Lista todas as disponibilidades cadastradas no sistema.
 *
 * @returns Promise<DisponibilidadeVaga[]> - Array de disponibilidades
 * @throws Erro se a requisição falhar
 *
 * @example
 * ```ts
 * try {
 *   const disponibilidades = await getDisponibilidadeVagas();
 *   console.log(`Total: ${disponibilidades.length}`);
 * } catch (error) {
 *   console.error('Erro ao buscar disponibilidades:', error);
 * }
 * ```
 */
export async function getDisponibilidadeVagas() {
  try {
    const res = await clientApi('/petrocarga/disponibilidade-vagas', {
      method: 'GET',
    });
    return await res.json();
  } catch (err) {
    console.error('Erro ao buscar disponibilidade:', err);
    throw err;
  }
}

// ----------------------
// GET DISPONIBILIDADE VAGAS POR VAGAID
// ----------------------

/**
 * @function getDisponibilidadeVagasByVagaId
 * @description Lista disponibilidades de uma vaga específica.
 *
 * @param vagaId - ID da vaga
 * @returns Promise<DisponibilidadeVaga[]> - Array de disponibilidades da vaga
 * @throws Erro se a requisição falhar
 *
 * @example
 * ```ts
 * try {
 *   const disponibilidades = await getDisponibilidadeVagasByVagaId('123');
 *   console.log(`Vaga 123 tem ${disponibilidades.length} períodos`);
 * } catch (error) {
 *   console.error('Erro ao buscar disponibilidades da vaga:', error);
 * }
 * ```
 */
export async function getDisponibilidadeVagasByVagaId(vagaId: string) {
  try {
    const res = await clientApi(
      `/petrocarga/disponibilidade-vagas/vaga/${vagaId}`,
      {
        method: 'GET',
      },
    );
    return await res.json();
  } catch (err) {
    console.error('Erro ao buscar disponibilidade por vagaId', err);
    throw err;
  }
}
// ----------------------

// ----------------------
// PATCH DISPONIBILIDADE VAGAS
// ----------------------

/**
 * @function editarDisponibilidadeVagas
 * @description Atualiza um período de disponibilidade existente.
 *
 * @param id - ID da disponibilidade a ser editada
 * @param vagaId - ID da vaga
 * @param inicio - Nova data/hora de início (formato ISO)
 * @param fim - Nova data/hora de fim (formato ISO)
 *
 * @returns Promise<DisponibilidadeResponse>
 *
 * @example
 * ```ts
 * const result = await editarDisponibilidadeVagas(
 *   'disp123',
 *   'vaga456',
 *   '2024-01-01T09:00:00',
 *   '2024-01-01T17:00:00'
 * );
 *
 * if (result.success) {
 *   console.log('Disponibilidade atualizada!');
 * }
 * ```
 */
export async function editarDisponibilidadeVagas(
  id: string,
  vagaId: string,
  inicio: string,
  fim: string,
): Promise<DisponibilidadeResponse> {
  const body: DisponibilidadeVaga = { vagaId, inicio, fim };

  try {
    const res = await clientApi(`/petrocarga/disponibilidade-vagas/${id}`, {
      method: 'PATCH',
      json: body,
    });
    return { success: true, valores: body };
  } catch (err: unknown) {
    console.error('Erro ao atualizar disponibilidade:', err);
    return {
      error: true,
      message:
        err instanceof Error ? err.message : 'Erro desconhecido ao atualizar',
      valores: body,
    };
  }
}

// ----------------------
// DELETE DISPONIBILIDADE VAGAS
// ----------------------

/**
 * @function deleteDisponibilidadeVagas
 * @description Remove um período de disponibilidade.
 *
 * @param disponibilidadeId - ID da disponibilidade a ser deletada
 * @returns Promise<true> - Retorna true se deletado com sucesso
 * @throws Erro se o ID não for fornecido ou se a requisição falhar
 *
 * @example
 * ```ts
 * try {
 *   await deleteDisponibilidadeVagas('disp123');
 *   console.log('Disponibilidade removida!');
 * } catch (error) {
 *   console.error('Erro ao deletar:', error);
 * }
 * ```
 */
export async function deleteDisponibilidadeVagas(disponibilidadeId: string) {
  if (!disponibilidadeId) {
    throw new Error('ID da disponibilidade não enviado.');
  }

  try {
    await clientApi(`/petrocarga/disponibilidade-vagas/${disponibilidadeId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (err) {
    console.error('Erro ao deletar disponibilidade:', err);
    throw err;
  }
}
