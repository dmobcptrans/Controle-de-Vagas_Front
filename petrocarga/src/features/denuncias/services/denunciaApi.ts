'use client';

import { clientApi } from '@/services/clientApi';

import {
  DenunciaResponse,
  DenunciaPaginadaResponse,
  DenunciaParams,
  DenunciaPayload,
  RespostaDenunciaPayload,
} from '../types/denuncia2';
import { buildSearchParams } from '@/services/utils/buildSearchParams';

// ----------------------
// POST DENUNCIA
// ----------------------

export async function CriarDenuncia(
  payload: DenunciaPayload,
): Promise<DenunciaResponse> {
  const response = await clientApi('/petrocarga/denuncias', {
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
    `/petrocarga/denuncias/all?${searchParams.toString()}`,
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
    `/petrocarga/denuncias/byUsuario/${usuarioId}?${searchParams}`,
  );

  return response.json();
}
// ----------------------
// PATCH DENUNCIA INICIAR ANALISE
// ----------------------

export async function iniciarAnaliseDenuncia(denunciaId: string) {
  return await clientApi(`/petrocarga/denuncias/iniciarAnalise/${denunciaId}`, {
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
    `/petrocarga/denuncias/finalizarAnalise/${denunciaId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  return response.json();
}
