'use client';

import { clientApi } from '@/services/clientApi';
import { buildSearchParams } from '@/services/utils/buildSearchParams';

import {
  AtualizarReservaPayload,
  CriarReservaPayload,
  ReservaPorUsuarioResponse,
  ReservaBloqueiosResponse,
  ReservaPaginadaDeUmUsuario,
  ReservaResponse,
  ReservaParams,
} from '../types/reservas';

import {
  CriarReservaRapidaPayload,
  ReservaRapidaPaginadaResponse,
} from '../types/reservaRapida';

// =================================================================
//                      RESERVAS DE MOTORISTAS
// =================================================================

// ----------------------
// POST RESERVA MOTORISTA
// ----------------------

export async function criarReserva(
  payload: CriarReservaPayload,
): Promise<ReservaPorUsuarioResponse> {
  const response = await clientApi('/petrocarga/reservas', {
    method: 'POST',
    json: payload,
  });

  return response.json();
}

// ----------------------
// GET RESERVAS POR USUARIO
// ----------------------

export async function getReservasPorUsuario(
  usuarioId: string,
  params: ReservaParams,
): Promise<ReservaPaginadaDeUmUsuario> {
  const searchParams = buildSearchParams({
    ...params,
    tamanhoPagina: params.tamanhoPagina ?? 10,
  });
  const response = await clientApi(
    `/petrocarga/reservas/usuario/${usuarioId}?${searchParams.toString()}`,
  );

  return response.json();
}

// ----------------------
// GET RESERVAS
// ----------------------

export async function getReservas(
  params?: ReservaParams,
): Promise<ReservaResponse[]> {
  const searchParams = buildSearchParams({
    status: params?.status,
    vagaId: params?.vagaId,
    placa: params?.placa,
    data: params?.data,
    usuarioId: params?.usuarioId,
    mes: params?.mes,
    ano: params?.ano,
  });

  const response = await clientApi(
    `/petrocarga/reservas/all?${searchParams.toString()}`,
  );

  return response.json();
}

// ----------------------
// GET RESERVAS BLOQUEIOS
// ----------------------

export async function getReservasBloqueios(
  vagaId: string,
  params: ReservaParams,
): Promise<ReservaBloqueiosResponse[]> {
  const searchParams = buildSearchParams({
    data: params.data,
    tipoVeiculo: params.tipoVeiculo,
  });

  const response = await clientApi(
    `/petrocarga/reservas/bloqueios/${vagaId}?${searchParams.toString()}`,
  );

  return response.json();
}

// ----------------------
// GET RESERVAS POR PLACA
// ----------------------

export async function getReservasPorPlaca(
  placa: string,
): Promise<ReservaResponse[]> {
  const response = await clientApi(
    `/petrocarga/reservas/placa?placa=${placa.trim().toUpperCase()}`,
    { method: 'GET' },
  );

  return response.json();
}

// ----------------------
// DELETE RESERVA POR ID
// ----------------------

export async function deleteReservaByID(
  reservaId: string,
  usuarioId: string,
): Promise<void> {
  await clientApi(`/petrocarga/reservas/${reservaId}/${usuarioId}`, {
    method: 'DELETE',
  });
}

// ----------------------
// DOCUMENTO RESERVA ID PDF
// ----------------------

export async function getGerarComprovanteReserva(
  reservaId: string,
): Promise<void> {
  const response = await clientApi(
    `/petrocarga/documentos/reservas/${reservaId}/comprovante`,
  );
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comprovante-${reservaId}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ----------------------
// PATCH RESERVA
// ----------------------

export async function atualizarReserva(
  payload: AtualizarReservaPayload,
  reservaId: string,
  usuarioId: string,
): Promise<ReservaPorUsuarioResponse> {
  const response = await clientApi(
    `/petrocarga/reservas/${reservaId}/${usuarioId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
  return response.json();
}

// ----------------------
// CHECKIN RESERVA
// ----------------------

export async function checkinReserva(
  reservaID: string,
): Promise<ReservaPorUsuarioResponse> {
  const response = await clientApi(
    `/petrocarga/reservas/${reservaID}/checkin`,
    {
      method: 'POST',
    },
  );

  return response.json();
}

// ----------------------
// CHECKOUT RESERVA
// ----------------------

export async function checkoutReserva(
  reservaID: string,
): Promise<ReservaPorUsuarioResponse> {
  const response = await clientApi(
    `/petrocarga/reservas/checkout/${reservaID}`,
    {
      method: 'PATCH',
    },
  );

  return response.json();
}

// ----------------------
// POST RESERVA CHECKOUT-FORÇADO
// ----------------------

export async function finalizarForcado(
  reservaID: string,
): Promise<ReservaResponse> {
  const response = await clientApi(
    `/petrocarga/reservas/${reservaID}/finalizar-forcado`,
    {
      method: 'POST',
    },
  );

  return response.json();
}

// =================================================================
//              RESERVAS DO AGENTE (RESERVA RAPIDA)
// =================================================================

// ----------------------
// POST RESERVA RAPIDA
// ----------------------

export async function criarReservaRapida(
  payload: CriarReservaRapidaPayload,
): Promise<ReservaPorUsuarioResponse> {
  const response = await clientApi('/petrocarga/reserva-rapida', {
    method: 'POST',
    json: payload,
  });

  return response.json();
}

// ----------------------
// GET RESERVAS RÁPIDAS
// ----------------------

export async function getReservasRapidas(
  usuarioId: string,
  params: ReservaParams,
): Promise<ReservaRapidaPaginadaResponse> {
  const SearchParams = buildSearchParams({
    vagaId: params.vagaId,
    placaVeiculo: params.placa,
    data: params.data,
    listaStatus: params.status,
    mes: params.mes,
    ano: params.ano,
    numeroPagina: params.numeroPagina,
    tamanhoPagina: params.tamanhoPagina,
  });

  const response = await clientApi(
    `/petrocarga/reserva-rapida/${usuarioId}${SearchParams}`,
  );

  return response.json();
}
