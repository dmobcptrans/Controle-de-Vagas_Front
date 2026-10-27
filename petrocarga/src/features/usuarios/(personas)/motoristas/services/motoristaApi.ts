import { clientApi } from "@/services/clientApi";
import { buildSearchParams } from "@/services/utils/buildSearchParams";
import { AtualizarMotoristaPayload, MotoristaParams, MotoristaPayload1, MotoristaResponse1, MotoristaResumidoPaginadoResponse } from "../types/motorista";

const BASE_URL = '/petrocarga/motoristas'

export async function CriarMotorista(payload: MotoristaPayload1): Promise<MotoristaResponse1> {
    const response = await clientApi(`${BASE_URL}/cadastro`, {
        method: 'POST',
        json: payload
    })

    return response.json()
}

export async function getMotoristaPorId(motoristaId: string, ativo?: boolean): Promise<MotoristaResponse1> {
    const response = await clientApi(`${BASE_URL}/${motoristaId}?${ativo}`,)
    return response.json();
}

export async function DeleteMotorista(motoristaId: string){
    const response = await clientApi(`${BASE_URL}/${motoristaId}`, {
        method: 'DELETE'
    })
    return response.json();
}

export async function AtualizarMotorista(motoristaId: string, payload: AtualizarMotoristaPayload): Promise<MotoristaResponse1> {
    const response = await clientApi(`${BASE_URL}/${motoristaId}`, {
        method: 'PATCH',
        json: payload
    })
    return response.json();
}

export async function getMotoristas(params: MotoristaParams): Promise<MotoristaResumidoPaginadoResponse> {
    const searchParams = buildSearchParams({
        ...params
    })
    const response = await clientApi(`${BASE_URL}?${searchParams}`)
    return response.json();
}
