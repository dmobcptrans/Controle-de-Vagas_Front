
import { clientApi } from "@/services/clientApi";
import { buildSearchParams } from "@/services/utils/buildSearchParams";
import { atualizarGestorPayload, gestorPaginadoResponse, gestorParams, gestorPayload, gestorResponse } from "../types/gestor2";

const BASE_URL = '/petrocarga/gestores'

export async function getGestores(params: gestorParams): Promise<gestorPaginadoResponse> {
    const searchParams = buildSearchParams({
        ...params
    })
    const response =  await clientApi(`${BASE_URL}?${searchParams.toString()}`)
    return response.json();
}
 
export async function CriarGestor(payload: gestorPayload): Promise<gestorResponse> {
    const response = await clientApi(`${BASE_URL}`, {
        method: 'POST',
        json: payload
    })
    return response.json();
}

export async function getGestorPorId(gestorId: string): Promise<gestorResponse> {
    const response = await clientApi(`${BASE_URL}/${gestorId}`)
    return response.json();
}

export async function DeleteGestor(gestorId: string) {
    const response = await clientApi(`${BASE_URL}/${gestorId}`, {
        method: 'DELETE'
    })
    return response.json();
}

export async function AtualizarGestor(gestorId: string, payload: atualizarGestorPayload): Promise<gestorResponse> {
    const response = await clientApi(`${BASE_URL}/${gestorId}`, {
        method: 'PATCH',
        json: payload
    })

    return response.json();
}