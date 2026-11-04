'use client';

import { clientApi } from '@/services/clientApi';
import { NotificacaoParam } from '../types/notificacao';
import {
  NotificacaoPayload,
  NotificacaoPaginadasResponse,
  NotificacaoResponse,
  PushTokenPayload,
  AtualizaPushTokenPayload,
  PushTokenResponse,
} from '../types/notificacao';
import { buildSearchParams } from '@/services/utils/buildSearchParams';
import { Permissao } from '@/lib/types/personas/user2';

const BASE_URL = '/notificacoes';

// ----------------------
// Enviar Notificação Para um Usuário
// ----------------------

export async function EnviarNotificacaoParaUsuario(
  payload: NotificacaoPayload,
  usuarioId: string,
): Promise<NotificacaoResponse> {
  const response = await clientApi(
    `${BASE_URL}/sendNotification/toUsuario/${usuarioId}`,
    {
      method: 'POST',
      json: payload,
    },
  );

  return response.json();
}

// ----------------------
// Enviar Notificação Por Permissão
// ----------------------

export async function EnviarNotificacaoPorPermissao(
  payload: NotificacaoPayload,
  permissao: Permissao,
): Promise<NotificacaoResponse> {
  const response = await clientApi(
    `${BASE_URL}/sendNotification/byPermissao/${permissao}`,
    {
      method: 'POST',
      json: payload,
    },
  );
  return response.json();
}

// ----------------------
// Registrar Push Token
// ----------------------

export async function RegistrarPushToken(
  payload: PushTokenPayload,
): Promise<PushTokenResponse> {
  const response = await clientApi(`${BASE_URL}/pushToken`, {
    method: 'POST',
    json: payload,
  });
  return response.json();
}

// ----------------------
// Atualizar Push Token
// ----------------------

export async function AtualizarPushToken(
  payload: AtualizaPushTokenPayload,
  usuarioId: string,
): Promise<PushTokenResponse> {
  const response = await clientApi(
    `${BASE_URL}/pushToken/${usuarioId}`,
    {
      method: 'PATCH',
      json: payload,
    },
  );
  return response.json();
}

// ----------------------
// Marcar Várias Notificações Como Lidas
// ----------------------

export async function MarcarVariasNotificacoesComoLidas(
  listaNotificacaoId: string[],
  usuarioId: string,
): Promise<NotificacaoResponse[]> {
  const params = new URLSearchParams();

  listaNotificacaoId.forEach((id) => {
    params.append('listaNotificacaoId', id);
  });

  const response = await clientApi(
    `${BASE_URL}/marcarSelecionadasComoLida/${usuarioId}?${params.toString()}`,
    {
      method: 'PATCH',
    },
  );

  return response.json();
}

// ----------------------
// Marcar Uma Notificação Como Lida
// ----------------------

export async function MarcarUmaNotificacaoComoLida(
  notificacaoId: string,
): Promise<NotificacaoResponse> {
  const response = await clientApi(
    `${BASE_URL}/lida/${notificacaoId}`,
    {
      method: 'PATCH',
    },
  );
  return response.json();
}

// ----------------------
// Retornar Uma Notificação
// ----------------------

export async function getNotificacaoPorId(
  notificacaoId: string,
): Promise<NotificacaoResponse> {
  const response = await clientApi(`${BASE_URL}/${notificacaoId}`);
  return response.json();
}

// ----------------------
// Iniciar Conexão SSE
// ----------------------

export async function getNotificacaoStream(
  signal?: AbortSignal,
): Promise<Response> {
  return clientApi(`${BASE_URL}/stream`, {
    method: 'GET',
    signal,
    headers: { Accept: 'text/event-stream' },
  });
}

// ----------------------
// Visualizar Push Tokens De Um Usuário
// ----------------------

export async function getPushTokensDoUsuario(): Promise<PushTokenResponse[]> {
  const response = await clientApi(
    `${BASE_URL}/pushToken/byUsuarioId`,
  );
  return response.json();
}

// ----------------------
// Visualizar Um Push Token
// ----------------------

export async function getPushTokenPorId(
  pushTokenId: string,
): Promise<PushTokenResponse> {
  const response = await clientApi(
    `${BASE_URL}/pushToken/byToken?token=${pushTokenId}`,
  );
  return response.json();
}

// ----------------------
// Retorna Todas As Notificações De Um Usuário
// ----------------------

export async function getNotificacoesDoUsuario(
  params: NotificacaoParam,
  usuarioId: string,
): Promise<NotificacaoPaginadasResponse> {
  const searchParams = buildSearchParams({
    ...params,
    numeroPagina: params.numeroPagina ?? 0,
    tamanhoPagina: params.tamanhoPagina ?? 10,
  });
  const response = await clientApi(
    `${BASE_URL}/byUsuario/${usuarioId}?${searchParams.toString()}`,
  );
  return response.json();
}

export async function deleteNotificacao(
  notificacaoId: string,
  usuarioId: string,
): Promise<void> {
  const response = await clientApi(
    `${BASE_URL}/${usuarioId}/${notificacaoId}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error('Erro ao excluir notificação');
  }
}

// ----------------------
// Deletar Uma Notificação
// ----------------------

export async function deleteVariasNotificacoes(
  listaNotificacaoId: string[],
  usuarioId: string,
): Promise<void> {
  const params = new URLSearchParams();
  listaNotificacaoId.forEach((id) => {
    params.append('listaNotificacaoId', id);
  });

  const response = await clientApi(
    `${BASE_URL}/deletarSelecionadas/${usuarioId}?${params.toString()}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error('Erro ao excluir notificações');
  }
}