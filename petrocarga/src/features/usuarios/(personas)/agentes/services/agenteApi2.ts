import { clientApi } from '@/services/clientApi';
import { buildSearchParams } from '@/services/utils/buildSearchParams';
import { agentePaginadoResponse, agenteParams, agentePayload, agenteResponse, atualizarAgente } from '../types/agente2';


export async function CriarAgente(payload: agentePayload): Promise<agenteResponse> {
    const response = await clientApi('/petrocarga/agentes', {
        method: 'POST',
        json: payload
    });
    return response.json();
}

export async function AtualizarAgente(agenteId: string, payload: atualizarAgente): Promise<agenteResponse> {
    const response = await clientApi(`/petrocarga/agentes/${agenteId}`, {
        method: 'PATCH',
        json: payload
    })
    return response.json();
}

export async function DeletarAgente(agenteId: string) {
    const response = await clientApi(`/petrocarga/agentes/${agenteId}`, {
        method: 'DELETE'
    })
    return response.json();
}

export async function getAgentePorId(agenteId: string): Promise<agenteResponse> {
    const response = await clientApi(`/petrocarga/agentes/${agenteId}`)
    return response.json();
}

export async function getAgentes(params: agenteParams): Promise<agentePaginadoResponse> {
    const searchParams = buildSearchParams({
        ...params
    })
    const response = await clientApi(`/petrocarga/agentes?${searchParams.toString()}`)
    return response.json();
}

