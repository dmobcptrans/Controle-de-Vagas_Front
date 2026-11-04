'use client';

import { clientApi } from '@/services/clientApi';

import {
  DenunciaResponse,
  DenunciaPaginadaResponse,
  DenunciaParams,
  DenunciaPayload,
  RespostaDenunciaPayload,
} from '../types/denuncia';
import { buildSearchParams } from '@/services/utils/buildSearchParams';

const BASE_URL = "/denuncias";

// ----------------------
// POST DENUNCIA
// ----------------------

export async function CriarDenuncia(
  payload: DenunciaPayload,
): Promise<DenunciaResponse> {
  const response = await clientApi(`${BASE_URL}`, {
    method: 'POST',
    json: payload,
  });
  return response.json();
}

// ----------------------
// GET TODAS AS DENUNCIAS (GESTOR)
// ----------------------

export async function getDenuncias(
  params?: DenunciaParams,
): Promise<DenunciaPaginadaResponse> {
  const searchParams = buildSearchParams({
    ...params,
    pagina: params?.pagina ?? 0,
    tamanhoPagina: params?.tamanhoPagina ?? 10,
    ordem: params?.ordem ?? 'DESC',
  });
  const response = await clientApi(
    `${BASE_URL}/all?${searchParams.toString()}`,
  );
  return response.json();
}

// ----------------------
// GET DENUNCIAS POR USUARIO
// ----------------------

export async function getDenunciasByUsuario(
  usuarioId: string,
  params?: DenunciaParams,
): Promise<DenunciaPaginadaResponse> {
  const searchParams = buildSearchParams({
    listaStatus: params?.listaStatus,
    pagina: params?.pagina ?? 0,
    tamanhoPagina: params?.tamanhoPagina ?? 10,
    ordem: params?.ordem ?? 'DESC',
  });
  const response = await clientApi(
    `${BASE_URL}/byUsuario/${usuarioId}?${searchParams}`,
  );

  return response.json();
}
// ----------------------
// PATCH DENUNCIA INICIAR ANALISE
// ----------------------

export async function iniciarAnaliseDenuncia(denunciaId: string) {
  return await clientApi(`${BASE_URL}/iniciarAnalise/${denunciaId}`, {
    method: 'PATCH',
  });
}

// ----------------------
// PATCH DENUNCIA FINALIZAR ANALISE
// ----------------------

export async function finalizarAnaliseDenuncia(
  denunciaId: string,
  payload: RespostaDenunciaPayload,
): Promise<DenunciaResponse> {
  const response = await clientApi(
    `${BASE_URL}/finalizarAnalise/${denunciaId}`,
    {
      method: 'PATCH',
      json: payload,
    },
  );

  return response.json();
}
