import { clientApi } from '@/services/clientApi';
import { buildSearchParams } from '@/services/utils/buildSearchParams';

import {
  VeiculoParams,
  VeiculoPayload,
  VeiculoPaginadoResponse,
  VeiculoResponse,
} from '../types/veiculo2';

/**
 * Cria um veículo para determinado usuário.
 */
export async function criarVeiculo(
  usuarioId: string,
  payload: VeiculoPayload,
): Promise<VeiculoResponse> {
  const response = await clientApi(`/petrocarga/veiculos/${usuarioId}`, {
    method: 'POST',
    json: payload,
  });

  return response.json();
}

/**
 * Atualiza um veículo.
 */

export async function atualizarVeiculo(
  veiculoId: string,
  usuarioId: string,
  payload: VeiculoPayload,
): Promise<void> {
  await clientApi(`/petrocarga/veiculos/${veiculoId}/${usuarioId}`, {
    method: 'PATCH',
    json: payload,
  });
}

/**
 * Remove um veículo.
 */

export async function deletarVeiculo(veiculoId: string): Promise<void> {
  await clientApi(`/petrocarga/veiculos/${veiculoId}`, {
    method: 'DELETE',
  });
}

/**
 * Busca veículos pertencentes a um usuário.
 */
export async function getVeiculosPorUsuario(
  usuarioId: string,
  params: VeiculoParams = {},
): Promise<VeiculoPaginadoResponse> {
  const searchParams = buildSearchParams({
    ...params,
    pagina: params.pagina ?? 0,
    tamanhoPagina: params.tamanhoPagina ?? 10,
    ordem: params.ordem ?? 'DESC',
  });

  const response = await clientApi(
    `/petrocarga/veiculos/usuario/${usuarioId}?${searchParams.toString()}`,
  );

  return response.json();
}

/**
 * Busca um veículo pelo ID.
 */
export async function getVeiculoPorId(
  veiculoId: string,
): Promise<VeiculoResponse> {
  const response = await clientApi(`/petrocarga/veiculos/${veiculoId}`);

  return response.json();
}
