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

// ----------------------
// Enviar Notificação Para um Usuário
// ----------------------

export async function EnviarNotificacaoParaUsuario(
  payload: NotificacaoPayload,
  usuarioId: string,
): Promise<NotificacaoResponse> {
  const response = await clientApi(
    `/petrocarga/notificacoes/sendNotification/toUsuario/${usuarioId}`,
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
    `/petrocarga/notificacoes/sendNotification/byPermissao/${permissao}`,
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
  const response = await clientApi('/petrocarga/notificacao/pushToken', {
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
    `/petrocarga/notificacoes/pushToken/${usuarioId}`,
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
    `/petrocarga/notificacoes/marcarSelecionadasComoLida/${usuarioId}?${params.toString()}`,
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
    `/petrocarga/notificacoes/lida/${notificacaoId}`,
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
  const response = await clientApi(`/petrocarga/notificacoes/${notificacaoId}`);
  return response.json();
}

// ----------------------
// Iniciar Conexão SSE
// ----------------------

export async function getNotificacaoStream(
  signal?: AbortSignal,
): Promise<Response> {
  return clientApi(`/petrocarga/notificacoes/stream`, {
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
    `/petrocarga/notificacoes/pushToken/byUsuarioId`,
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
    `/petrocarga/notificacoes/pushToken/byToken?token=${pushTokenId}`,
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
    `/petrocarga/notificacoes/byUsuario/${usuarioId}?${searchParams.toString()}`,
  );
  return response.json();
}

export async function deleteNotificacao(
  notificacaoId: string,
  usuarioId: string,
) {
  const response = await clientApi(
    `/petrocarga/notificacoes/${usuarioId}/${notificacaoId}`,
    {
      method: 'DELETE',
    },
  );
  return response.json();
}

// ----------------------
// Deletar Uma Notificação
// ----------------------

export async function deleteVariasNotificacoes(
  listaNotificacaoId: string[],
  usuarioId: string,
) {
  const params = new URLSearchParams();
  listaNotificacaoId.forEach((id) => {
    params.append('listaNotificacaoId', id);
  });

  // ----------------------
  // Deletar Várias Notificações
  // ----------------------

  const response = await clientApi(
    `/petrocarga/notificacoes/deletarSelecionadas/${usuarioId}?${params.toString()}`,
    {
      method: 'DELETE',
    },
  );

  return response.json();
}
