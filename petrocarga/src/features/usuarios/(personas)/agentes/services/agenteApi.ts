import { clientApi } from '@/services/clientApi';
import { buildSearchParams } from '@/services/utils/buildSearchParams';
import {
  agentePaginadoResponse,
  agenteParams,
  agentePayload,
  agenteResponse,
  atualizarAgente,
} from '../types/agente';

const BASE_URL = '/agentes';

export async function CriarAgente(
  payload: agentePayload,
): Promise<agenteResponse> {
  const response = await clientApi(`${BASE_URL}`, {
    method: 'POST',
    json: payload,
  });
  return response.json();
}

export async function AtualizarAgente(
  agenteId: string,
  payload: atualizarAgente,
): Promise<agenteResponse> {
  const response = await clientApi(`${BASE_URL}/${agenteId}`, {
    method: 'PATCH',
    json: payload,
  });
  return response.json();
}

export async function DeletarAgente(agenteId: string) {
  await clientApi(`${BASE_URL}/${agenteId}`, {
    method: 'DELETE',
  });
}

export async function getAgentePorId(
  agenteId: string,
): Promise<agenteResponse> {
  const response = await clientApi(`${BASE_URL}/${agenteId}`);
  return response.json();
}

export async function getAgentes(
  params: agenteParams,
): Promise<agentePaginadoResponse> {
  const searchParams = buildSearchParams({
    ...params,
  });
  const response = await clientApi(
    `${BASE_URL}?${searchParams.toString()}`,
  );
  return response.json();
}
