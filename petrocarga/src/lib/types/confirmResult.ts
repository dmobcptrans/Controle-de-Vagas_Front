/**
 * @module types/confirmResult
 * @description Tipo utilitário para padronizar respostas de operações que requerem confirmação.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. ConfirmResult - Resultado padronizado para operações com confirmação
 */

/**
 * @type ConfirmResult
 * @description Tipo genérico para respostas de operações que podem ser bem-sucedidas ou falhar.
 * Usado principalmente em ações que retornam um status simples (sucesso/erro) com mensagem opcional.
 *
 * @property {boolean} success - Indica se a operação foi bem-sucedida
 * @property {string} [message] - Mensagem descritiva (opcional, usada para feedback ao usuário)
 *
 * @example
 * ```ts
 * // Operação bem-sucedida
 * const successResult: ConfirmResult = {
 *   success: true,
 *   message: 'Operação realizada com sucesso!'
 * };
 *
 * // Operação com erro
 * const errorResult: ConfirmResult = {
 *   success: false,
 *   message: 'Erro ao processar a solicitação'
 * };
 *
 * // Resposta mínima (apenas sucesso)
 * const minimalResult: ConfirmResult = {
 *   success: true
 * };
 * ```
 *
 * @example
 * ```ts
 * // Uso típico em uma função
 * async function deleteItem(id: string): Promise<ConfirmResult> {
 *   try {
 *     await api.delete(`/items/${id}`);
 *     return {
 *       success: true,
 *       message: 'Item deletado com sucesso'
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       message: 'Erro ao deletar item'
 *     };
 *   }
 * }
 *
 * // Uso no componente
 * const result = await deleteItem('123');
 * if (result.success) {
 *   toast.success(result.message);
 * } else {
 *   toast.error(result.message);
 * }
 * ```
 */
export type ConfirmResult = {
  success: boolean;
  message?: string;
};
