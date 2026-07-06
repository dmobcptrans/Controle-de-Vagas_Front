'use client';

import { Veiculo } from '@/lib/types/veiculo';
import { clientApi } from '../clientApi';

/**
 * @module veiculoApi
 * @description Módulo de API para gerenciamento de veículos.
 * Fornece funções para criar, consultar, atualizar e deletar veículos,
 * com validação especial para CPF/CNPJ do proprietário (mutuamente exclusivos).
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. addVeiculo - Cadastra um novo veículo
 * 2. deleteVeiculo - Remove um veículo existente
 * 3. atualizarVeiculo - Atualiza dados de um veículo
 * 4. getVeiculosUsuario - Lista veículos de um usuário
 * 5. getVeiculo - Busca veículo específico por ID
 *
 * ----------------------------------------------------------------------------
 * 🔧 FUNÇÕES AUXILIARES INTERNAS:
 * ----------------------------------------------------------------------------
 *
 * - getCpfCnpj - Valida e retorna CPF/CNPJ (mutuamente exclusivos)
 * - buildVeiculoPayload - Constrói payload padronizado
 */

/**
 * @function getCpfCnpj
 * @description Função interna que valida e extrai CPF/CNPJ do FormData.
 * Garante que apenas um dos dois seja informado (nunca ambos).
 *
 * @param formData - Formulário com dados do veículo
 * @returns Objeto com { cpf, cnpj } ou { error: string }
 *
 * @private
 */
function getCpfCnpj(formData: FormData) {
  const cpf = (formData.get('cpfProprietario') as string) || null;
  const cnpj = (formData.get('cnpjProprietario') as string) || null;

  if (!cpf && !cnpj) return { error: 'Preencha o CPF ou CNPJ do proprietário' };
  if (cpf && cnpj) return { error: 'Preencha apenas CPF ou CNPJ, não ambos' };

  return { cpf, cnpj };
}

/**
 * @function buildVeiculoPayload
 * @description Função interna que constrói o payload padronizado do veículo.
 *
 * @param formData - Formulário com dados do veículo
 * @param cpf - CPF do proprietário (ou null)
 * @param cnpj - CNPJ do proprietário (ou null)
 * @returns Objeto formatado para envio à API
 *
 * @private
 */
function buildVeiculoPayload(
  formData: FormData,
  cpf: string | null,
  cnpj: string | null,
) {
  return {
    placa: formData.get('placa') as string,
    marca: formData.get('marca') as string,
    modelo: formData.get('modelo') as string,
    tipo: (formData.get('tipo') as string)?.toUpperCase(),
    comprimento: Number(formData.get('comprimento')),
    cpfProprietario: cpf,
    cnpjProprietario: cnpj,
    usuarioId: formData.get('usuarioId'),
  };
}

// ----------------------
// POST VEICULO
// ----------------------

/**
 * @function addVeiculo
 * @description Cadastra um novo veículo para um usuário.
 *
 * @param formData - Formulário com dados do veículo
 *
 * Campos do FormData:
 * - placa: Placa do veículo
 * - marca: Marca do veículo
 * - modelo: Modelo do veículo
 * - tipo: Tipo (convertido para maiúsculas)
 * - comprimento: Comprimento em metros
 * - cpfProprietario: CPF do proprietário (opcional, mutuamente exclusivo com CNPJ)
 * - cnpjProprietario: CNPJ do proprietário (opcional, mutuamente exclusivo com CPF)
 * - usuarioId: ID do usuário proprietário
 *
 * @returns Promise<{ error: boolean; message: string; valores?: any }>
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('placa', 'ABC1234');
 * formData.append('marca', 'Fiat');
 * formData.append('modelo', 'Uno');
 * formData.append('tipo', 'AUTOMOVEL');
 * formData.append('comprimento', '4.5');
 * formData.append('cpfProprietario', '12345678900');
 * formData.append('usuarioId', 'user123');
 *
 * const result = await addVeiculo(formData);
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function addVeiculo(formData: FormData) {
  const doc = getCpfCnpj(formData);
  const usuarioId = formData.get('usuarioId') as string;
  if ('error' in doc) return { error: true, message: doc.error, valores: null };

  const payload = buildVeiculoPayload(formData, doc.cpf, doc.cnpj);

  try {
    await clientApi(`/petrocarga/veiculos/${usuarioId}`, {
      method: 'POST',
      json: payload,
    });

    return {
      error: false,
      message: 'Veículo cadastrado com sucesso!',
      valores: null,
    };
  } catch (err: unknown) {
    console.error('Erro ao cadastrar veículo:', err);
    const message =
      err instanceof Error ? err.message : 'Erro ao cadastrar veículo';
    return { error: true, message, valores: payload };
  }
}

// ----------------------
// DELETE VEICULO
// ----------------------

/**
 * @function deleteVeiculo
 * @description Remove um veículo existente pelo ID.
 *
 * @param veiculoId - ID do veículo a ser deletado
 * @returns Promise<{ error: boolean; message: string }>
 *
 * @example
 * ```ts
 * const result = await deleteVeiculo('veiculo123');
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function deleteVeiculo(veiculoId: string) {
  try {
    await clientApi(`/petrocarga/veiculos/${veiculoId}`, { method: 'DELETE' });
    return { error: false, message: 'Veículo deletado com sucesso!' };
  } catch (err: unknown) {
    console.error('Erro ao deletar veículo:', err);
    const message =
      err instanceof Error ? err.message : 'Erro ao deletar veículo';
    return { error: true, message };
  }
}

// ----------------------
// PATCH VEICULO
// ----------------------

/**
 * @function atualizarVeiculo
 * @description Atualiza dados de um veículo existente.
 *
 * @param formData - Formulário com dados atualizados do veículo
 *
 * Campos adicionais do FormData:
 * - id: ID do veículo (obrigatório)
 * - usuarioId: ID do usuário proprietário
 *
 * @returns Promise<{ error: boolean; message: string; valores?: any }>
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('id', 'veiculo123');
 * formData.append('placa', 'XYZ5678');
 * formData.append('usuarioId', 'user123');
 *
 * const result = await atualizarVeiculo(formData);
 * ```
 */
export async function atualizarVeiculo(formData: FormData) {
  const id = formData.get('id') as string;
  const doc = getCpfCnpj(formData);
  if ('error' in doc) return { error: true, message: doc.error, valores: null };

  const payload = buildVeiculoPayload(formData, doc.cpf, doc.cnpj);
  const usuarioId = formData.get('usuarioId') as string;

  try {
    await clientApi(`/petrocarga/veiculos/${id}/${usuarioId}`, {
      method: 'PATCH',
      json: payload,
    });

    return {
      error: false,
      message: 'Veículo atualizado com sucesso!',
      valores: null,
    };
  } catch (err: unknown) {
    console.error('Erro ao atualizar veículo:', err);
    const message =
      err instanceof Error ? err.message : 'Erro ao atualizar veículo';
    return { error: true, message, valores: payload };
  }
}

// ----------------------
// GET VEICULO POR USUARIO
// ----------------------

/**
 * @function getVeiculosUsuario
 * @description Lista todos os veículos de um usuário específico.
 *
 * @param usuarioId - ID do usuário
 * @returns Promise<{ error: boolean; message: string; veiculos: Veiculo[] }>
 *
 * @example
 * ```ts
 * const result = await getVeiculosUsuario('user123');
 * if (!result.error) {
 *   console.log(`Usuário tem ${result.veiculos.length} veículos`);
 * }
 * ```
 */
export async function getVeiculosUsuario(usuarioId: string) {
  try {
    const res = await clientApi(`/petrocarga/veiculos/usuario/${usuarioId}`);
    const data: Veiculo[] = await res.json();
    return {
      error: false,
      message: 'Veículos carregados com sucesso',
      veiculos: data,
    };
  } catch (err: unknown) {
    console.error('Erro ao buscar veículos do usuário:', err);
    const message =
      err instanceof Error ? err.message : 'Erro ao buscar veículos do usuário';
    return { error: true, message, veiculos: [] };
  }
}

// ----------------------
// GET VEICULO POR ID
// ----------------------

/**
 * @function getVeiculo
 * @description Busca um veículo específico pelo ID.
 *
 * @param veiculoId - ID do veículo
 * @returns Promise<{ error: boolean; message: string; veiculo: Veiculo | null }>
 *
 * @example
 * ```ts
 * const result = await getVeiculo('veiculo123');
 * if (!result.error && result.veiculo) {
 *   console.log(result.veiculo.placa);
 * }
 * ```
 */
export async function getVeiculo(veiculoId: string) {
  try {
    const res = await clientApi(`/petrocarga/veiculos/${veiculoId}`);
    const data: Veiculo = await res.json();
    return {
      error: false,
      message: 'Veículo carregado com sucesso',
      veiculo: data,
    };
  } catch (err: unknown) {
    console.error(`Erro ao buscar veículo ${veiculoId}:`, err);
    const message =
      err instanceof Error ? err.message : 'Erro ao buscar veículo';
    return { error: true, message, veiculo: null };
  }
}

export interface GetVeiculosResult {
  error: boolean;
  message: string;
  veiculos: Veiculo[];
  veiculo?: Veiculo | null;
}
