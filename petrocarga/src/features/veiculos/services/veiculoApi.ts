'use client';

import {
  VeiculoResponse,
  VeiculoPaginadoResponse,
  VeiculoPayload,
  VeiculoParams,
} from '@/features/veiculos/types/veiculo2';
import { clientApi } from '@/services/clientApi';
import { TipoVeiculo } from '../types/tipoVeiculo';
import { getApiErrorMessage } from '@/lib/types/response/getApiErrorMessage';
import { ConfirmResult } from '@/lib/types/confirmResult';
import { buildSearchParams } from '@/services/utils/buildSearchParams';

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

// ----------------------
// POST VEICULO
// ----------------------

 */

export async function criarVeiculo(
  formData: FormData,
  usuarioId: string,
): Promise<VeiculoResponse> {
  const body: VeiculoPayload = {
    placa: formData.get('placa') as string,
    marca: formData.get('marca') as string,
    modelo: formData.get('modelo') as string,
    tipo: (formData.get('tipo') as TipoVeiculo).toUpperCase() as TipoVeiculo,
    cpfProprietario: formData.get('cpfProprieatario') as string,
    cnpjProprietario: formData.get('cnpjProprietario') as string,
  };

  try {
    const res = await clientApi(`/petrocarga/veiculos/${usuarioId}`, {
      method: 'POST',
      json: body,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const data: VeiculoResponse = await res.json();

    return data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao cadastrar veículo.'));
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
    return {
      success: true,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Erro ao deletar veículo.'),
    };
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
export async function atualizarVeiculo(
  body: VeiculoPayload,
  veiculoId: string,
  usuarioId: string,
): Promise<ConfirmResult> {
  try {
    await clientApi(`/petrocarga/veiculos/${veiculoId}/${usuarioId}`, {
      method: 'PATCH',
      json: JSON.stringify(body),
    });

    return {
      success: true,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Erro ao atualizar veículo.'),
    };
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

export async function getVeiculosPorUsuario(
  usuarioId: string,
  params: VeiculoParams = {},
): Promise<VeiculoPaginadoResponse> {
  try {
    const searchParams = buildSearchParams({
      placa: params?.placa,
      marca: params?.marca,
      modelo: params?.modelo,
      tipo: params?.tipo,
      telefoneUsuario: params?.telefoneUsuario,
      cpfProprietario: params?.cpfProprietario,
      cnpjProprietario: params?.cnpjProprietario,
      ativo: params.ativo,
      pagina: params?.pagina ?? 0,
      tamanhoPagina: params?.tamanhoPagina ?? 10,
      ordem: params?.ordem ?? 'DESC',
    });

    const res = await clientApi(
      `/petrocarga/veiculos/usuario/${usuarioId}?${searchParams.toString()}`,
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const data: VeiculoPaginadoResponse = await res.json();

    return data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao buscar veículos.'));
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
export async function getVeiculoPorId(
  veiculoId: string,
): Promise<VeiculoResponse> {
  try {
    const res = await clientApi(`/petrocarga/veiculos/${veiculoId}`);
    return (await res.json()) ?? null;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao buscar veículo.'));
  }
}
