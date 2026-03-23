import {
  getDisponibilidadeVagas,
  addDisponibilidadeVagas,
  editarDisponibilidadeVagas,
  deleteDisponibilidadeVagas,
} from '@/lib/api/disponibilidadeVagasApi';

/**
 * @module disponibilidadeService
 * @description Camada de serviço para gerenciamento de disponibilidade de vagas.
 * Encapsula as funções da API com tratamento simplificado.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. fetchDisponibilidades - Lista todas as disponibilidades
 * 2. postDisponibilidade - Cria nova disponibilidade (suporta múltiplas vagas)
 * 3. updateDisponibilidade - Atualiza uma disponibilidade existente
 * 4. removeDisponibilidade - Remove uma disponibilidade
 * 
 * ----------------------------------------------------------------------------
 * 🔗 FUNÇÕES INTERNAS (API):
 * ----------------------------------------------------------------------------
 * 
 * - getDisponibilidadeVagas: GET /petrocarga/disponibilidade-vagas
 * - addDisponibilidadeVagas: POST /petrocarga/disponibilidade-vagas/vagas
 * - editarDisponibilidadeVagas: PATCH /petrocarga/disponibilidade-vagas/{id}
 * - deleteDisponibilidadeVagas: DELETE /petrocarga/disponibilidade-vagas/{id}
 */

// -------------------------------------------------------
// GET — Carregar todas as disponibilidades
// -------------------------------------------------------

/**
 * @function fetchDisponibilidades
 * @description Lista todas as disponibilidades de vagas cadastradas no sistema.
 * 
 * @returns Promise<DisponibilidadeVaga[]> - Array de disponibilidades
 * 
 * @throws {Error} Dispara erro se a requisição falhar
 * 
 * @example
 * ```ts
 * try {
 *   const disponibilidades = await fetchDisponibilidades();
 *   console.log(`Total: ${disponibilidades.length}`);
 * } catch (error) {
 *   console.error('Erro ao carregar disponibilidades:', error);
 * }
 * ```
 */
export async function fetchDisponibilidades() {
  return await getDisponibilidadeVagas();
}

// -------------------------------------------------------
// POST — Criar disponibilidade
// -------------------------------------------------------

/**
 * @function postDisponibilidade
 * @description Cria um novo período de disponibilidade para uma ou mais vagas.
 * 
 * @param vagaIds - Array com IDs das vagas
 * @param inicio - Data/hora de início (ISO string)
 * @param fim - Data/hora de fim (ISO string)
 * 
 * @returns Promise<DisponibilidadeResponse>
 * 
 * @throws {Error} Dispara erro se a requisição falhar
 * 
 * @example
 * ```ts
 * // Criar disponibilidade para uma única vaga
 * await postDisponibilidade(
 *   ['vaga123'],
 *   '2024-01-01T08:00:00',
 *   '2024-01-01T18:00:00'
 * );
 * 
 * // Criar disponibilidade para múltiplas vagas
 * await postDisponibilidade(
 *   ['vaga123', 'vaga456', 'vaga789'],
 *   '2024-01-01T08:00:00',
 *   '2024-01-01T18:00:00'
 * );
 * ```
 */
export async function postDisponibilidade(
  vagaIds: string[],
  inicio: string,
  fim: string
) {
  const form = new FormData();

  vagaIds.forEach((id) => form.append('vagaid', id));
  form.append('inicio', inicio);
  form.append('fim', fim);

  return await addDisponibilidadeVagas(form);
}

// -------------------------------------------------------
// PUT — Editar disponibilidade
// -------------------------------------------------------

/**
 * @function updateDisponibilidade
 * @description Atualiza uma disponibilidade existente.
 * 
 * @param id - ID da disponibilidade a ser editada
 * @param vagaId - ID da vaga
 * @param inicio - Nova data/hora de início (ISO string)
 * @param fim - Nova data/hora de fim (ISO string)
 * 
 * @returns Promise<DisponibilidadeResponse>
 * 
 * @example
 * ```ts
 * await updateDisponibilidade(
 *   'disp123',
 *   'vaga456',
 *   '2024-01-01T09:00:00',
 *   '2024-01-01T17:00:00'
 * );
 * ```
 */
export async function updateDisponibilidade(
  id: string,
  vagaId: string,
  inicio: string,
  fim: string
) {
  return await editarDisponibilidadeVagas(id, vagaId, inicio, fim);
}

// -------------------------------------------------------
// DELETE — Deletar disponibilidade por ID
// -------------------------------------------------------

/**
 * @function removeDisponibilidade
 * @description Remove uma disponibilidade pelo ID.
 * 
 * @param id - ID da disponibilidade a ser deletada
 * @returns Promise<true> - Retorna true se deletado com sucesso
 * @throws {Error} Dispara erro se a requisição falhar
 * 
 * @example
 * ```ts
 * try {
 *   await removeDisponibilidade('disp123');
 *   toast.success('Disponibilidade removida!');
 * } catch (error) {
 *   toast.error('Erro ao remover disponibilidade');
 * }
 * ```
 */
export async function removeDisponibilidade(id: string) {
  return await deleteDisponibilidadeVagas(id);
}