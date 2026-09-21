'use client';

import { clientApi } from '@/services/clientApi';
import { buildSearchParams } from '@/services/utils/buildSearchParams';
import {
  DisponibildadeVagaResponse,
  DisponibilidadesParam,
  DisponibilidadeVagaResumoResponse,
  DisponibilidadeVagasMultiplasPayload,
  DisponibilidadeVagasPayload,
} from '../types/disponibilidadeVaga2';

// ----------------------
// POST DISPONIBILIDADE VAGAS (MULTIPLAS)
// ----------------------

export async function criarMultiplasDisponibilidadesVaga(
  payload: DisponibilidadeVagasMultiplasPayload,
): Promise<DisponibildadeVagaResponse> {
  const response = await clientApi(`/petrocarga/disponibilidade-vagas/vagas`, {
    method: 'POST',
    json: payload,
  });
  return response.json();
}

// ----------------------
// GET DISPONIBILIDADE VAGAS
// ----------------------

export async function getDisponibilidadeVagas(
  params?: DisponibilidadesParam,
): Promise<DisponibildadeVagaResponse[]> {
  const searchParams = buildSearchParams({
    ...params,
  });

  const response = await clientApi(
    `/petrocarga/disponibilidade-vagas?${searchParams.toString()}`,
  );
  return response.json();
}

// ----------------------
// GET DISPONIBILIDADE VAGAS POR VAGAID
// ----------------------

export async function getDisponibilidadeVagasByVagaId(
  vagaId: string,
): Promise<DisponibildadeVagaResponse> {
  const response = await clientApi(
    `/petrocarga/disponibilidade-vagas/vaga/${vagaId}`,
  );
  return response.json();
}

// ----------------------
// PATCH DISPONIBILIDADE VAGAS
// ----------------------

export async function atualizarDisponibilidadeVagas(
  disponibilidadeId: string,
  payload: DisponibilidadeVagasPayload,
): Promise<DisponibilidadeVagaResumoResponse> {
  const response = await clientApi(
    `/petrocarga/disponibilidade-vagas/${disponibilidadeId}`,
    {
      method: 'PATCH',
      json: payload,
    },
  );
  return response.json();
}

// ----------------------
// DELETE DISPONIBILIDADE VAGAS
// ----------------------

export async function deleteDisponibilidadeVagas(disponibilidadeId: string) {
  await clientApi(`/petrocarga/disponibilidade-vagas/${disponibilidadeId}`, {
    method: 'DELETE',
  });
}
