'use client';

import { clientApi } from '@/services/clientApi';
import {
  FiltrosVaga,
  VagaPayload,
  VagaResponse,
  VagasFiltradasParams,
  VagasMapaParams,
  VagasMapaResponse,
  VagasPaginadasResponse,
} from '../types/vaga2';
import { buildSearchParams } from '@/services/utils/buildSearchParams';

/**
 * @module vagaApi
 * @description Módulo de API para gerenciamento de vagas de estacionamento.
 * Fornece funções para criar, consultar, atualizar e deletar vagas,
 * incluindo dados complexos como endereço, operações por dia da semana e georreferenciamento.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. addVaga - Cadastra uma nova vaga
 * 2. deleteVaga - Remove uma vaga existente
 * 3. atualizarVaga - Atualiza dados de uma vaga
 * 4. getVagas - Lista vagas com filtro opcional por status
 * 5. getVagasComFiltros - Lista vagas com múltiplos filtros
 * 6. getVagaById - Busca vaga específica por ID
 *
 */

// ----------------------
// Criar uma vaga
// ----------------------

export async function criarVaga(payload: VagaPayload): Promise<VagaResponse> {
  const response = await clientApi('/petrocarga/vagas', {
    method: 'POST',
    json: payload,
  });

  return response.json();
}

// ----------------------
// Deletar uma vaga
// ----------------------

export async function deleteVaga(id: string): Promise<void> {
  await clientApi(`/petrocarga/vagas/${id}`, {
    method: 'DELETE',
  });
}

// ----------------------
// Atualizar uma vaga
// ----------------------

export async function atualizarVaga(
  vagaId: string,
  payload: VagaPayload,
): Promise<void> {
  await clientApi(`/petrocarga/vagas/${vagaId}`, {
    method: 'PATCH',
    json: payload,
  });
}

// ----------------------
// GET vagas
// ----------------------

export async function getVagas(params: FiltrosVaga): Promise<VagaResponse[]> {
  const searchParams = buildSearchParams({
    status: params.status,
  });

  const response = await clientApi(
    `/petrocarga/vagas/all${searchParams.toString()}`,
  );
  return response.json();
}

// ----------------------
// GET vagas para o mapa
// ----------------------

export async function getVagasPorMapa(
  params: VagasMapaParams,
): Promise<VagasMapaResponse> {
  const searchParams = buildSearchParams({
    ...params,
  });
  const response = await clientApi(
    `/petrocarga/vagas/mapa?${searchParams.toString()}`,
  );
  return response.json();
}

// ----------------------
// GET vagas filtradas
// ----------------------

export async function getVagasFiltradas(
  params?: VagasFiltradasParams,
): Promise<VagasPaginadasResponse> {
  const searchParams = buildSearchParams({
    ...params,
  });
  const response = await clientApi(
    `/petrocarga/vagas${searchParams.toString()}`,
  );
  return response.json();
}

// ----------------------
// GET vagas por ID
// ----------------------

export async function getVagaById(id: string): Promise<VagaResponse> {
  const response = await clientApi(`/petrocarga/vagas/${id}`);
  return response.json();
}
