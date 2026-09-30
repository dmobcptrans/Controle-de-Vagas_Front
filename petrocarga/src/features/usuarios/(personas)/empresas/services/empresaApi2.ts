import { clientApi } from "@/services/clientApi";
import { buildSearchParams } from "@/services/utils/buildSearchParams";
import { AtualizarEmpresaPayload, EmpresaParams , EmpresaPayload, EmpresasPaginadaResponse, MotoristaEmpresaPaginadoResponse } from "../types/empresa2";
import { EmpresaResponse } from "../types/empresa2";


const BASE_URL = '/petrocarga/empresas';

export async function CriarEmpresa(payload: EmpresaPayload): Promise<EmpresaResponse> {
    const response = await clientApi(`${BASE_URL}/cadastro`, {
        method: 'POST',
        json: payload
    });

    return response.json();
}

export async function getEmpresaPorId(empresaId: string): Promise<EmpresaResponse> {
    const response = await clientApi(`${BASE_URL}/${empresaId}`)

    return response.json();
}

export async function AtualizarEmpresa(empresaId: string, payload: AtualizarEmpresaPayload): Promise<EmpresaResponse> {
    const response = await clientApi(`${BASE_URL}/${empresaId}`, {
        method: 'PATCH',
        json: payload
    })

    return response.json();
}

export async function getEmpresas(params: EmpresaParams): Promise<EmpresasPaginadaResponse> {

    const searchParam = buildSearchParams({
        ...params
    });

    const response = await clientApi(`${BASE_URL}?${searchParam.toString()}`)

    return response.json();
    
}

export async function getMotoristaEmpresa(empresaId: string, params: EmpresaParams): Promise<MotoristaEmpresaPaginadoResponse> {
    const searchParams = buildSearchParams({
        ... params
    })

    const response = await clientApi(`/petrocarga/motoristas/byEmpresa/${empresaId}?${searchParams.toString()}`)
    return response.json();
}
