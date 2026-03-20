'use client';

import { clientApi } from '../clientApi';

/**
 * @module notificacaoApi
 * @description Módulo de API para gerenciamento de notificações push.
 * Fornece funções para enviar, listar, marcar como lidas e deletar notificações,
 * além de gerenciar tokens de push notification.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Envio de Notificações
 *    - enviarNotificacaoParaUsuario - Envia para um usuário específico
 *    - enviarNotificacaoPorPermissao - Envia para todos de uma permissão
 *
 * 2. Consulta de Notificações
 *    - getNotificacoesUsuario - Lista notificações de um usuário
 *    - getNotificacaoById - Busca notificação específica (e marca como lida)
 *
 * 3. Gerenciamento de Estado
 *    - marcarNotificacaoComoLida - Marca uma notificação como lida
 *    - marcarTodasNotificacoesComoLidas - Marca múltiplas como lidas
 *
 * 4. Deleção
 *    - deletarNotificacao - Remove uma notificação
 *    - deletarNotificacoesSelecionadas - Remove múltiplas notificações
 *
 * 5. Push Tokens
 *    - buscarStatusPushToken - Verifica status de um token
 *    - atualizarStatusPushToken - Ativa/desativa notificações push
 *
 * ----------------------------------------------------------------------------
 * 🔗 TIPOS RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Tipos de notificação: 'RESERVA' | 'VAGA' | 'VEICULO' | 'MOTORISTA' | 'SISTEMA'
 * - Permissões: 'ADMIN' | 'GESTOR' | 'AGENTE'
 */

// ----------------------
// ENVIAR NOTIFICAÇÃO PARA USUÁRIO
// ----------------------

/**
 * @function enviarNotificacaoParaUsuario
 * @description Envia uma notificação para um usuário específico.
 *
 * @param formData - Formulário com dados da notificação
 * @param formData.usuarioId - ID do usuário destinatário
 * @param formData.titulo - Título da notificação
 * @param formData.mensagem - Conteúdo da mensagem
 * @param formData.tipo - Tipo da notificação
 *
 * @returns Promise<{ error: boolean; message: string }>
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('usuarioId', '123');
 * formData.append('titulo', 'Reserva confirmada');
 * formData.append('mensagem', 'Sua vaga foi reservada com sucesso');
 * formData.append('tipo', 'RESERVA');
 *
 * const result = await enviarNotificacaoParaUsuario(formData);
 * ```
 */
export async function enviarNotificacaoParaUsuario(formData: FormData) {
  const usuarioId = formData.get('usuarioId') as string;

  const payload = {
    titulo: formData.get('titulo') as string,
    mensagem: formData.get('mensagem') as string,
    tipo: formData.get('tipo') as
      | 'RESERVA'
      | 'VAGA'
      | 'VEICULO'
      | 'MOTORISTA'
      | 'SISTEMA',
  };

  const res = await clientApi(
    `/petrocarga/notificacoes/sendNotification/toUsuario/${usuarioId}`,
    {
      method: 'POST',
      json: payload,
    },
  );

  if (!res.ok) {
    let msg = 'Erro ao enviar notificação';
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }
  return { error: false, message: 'Notificação enviada com sucesso' };
}

// ----------------------
// ENVIAR NOTIFICAÇÃO POR PERMISSÃO
// ----------------------

/**
 * @function enviarNotificacaoPorPermissao
 * @description Envia notificação para todos os usuários com determinada permissão.
 *
 * @param formData - Formulário com dados da notificação
 * @param formData.permissao - Permissão alvo ('ADMIN' | 'GESTOR' | 'AGENTE')
 * @param formData.titulo - Título da notificação
 * @param formData.mensagem - Conteúdo da mensagem
 * @param formData.tipo - Tipo da notificação
 *
 * @returns Promise<{ error: boolean; message: string }>
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('permissao', 'GESTOR');
 * formData.append('titulo', 'Manutenção programada');
 * formData.append('mensagem', 'Sistema ficará indisponível das 2h às 4h');
 *
 * const result = await enviarNotificacaoPorPermissao(formData);
 * ```
 */
export async function enviarNotificacaoPorPermissao(formData: FormData) {
  const permissao = formData.get('permissao') as 'ADMIN' | 'GESTOR' | 'AGENTE';

  const payload = {
    titulo: formData.get('titulo') as string,
    mensagem: formData.get('mensagem') as string,
    tipo: formData.get('tipo') as
      | 'RESERVA'
      | 'VAGA'
      | 'VEICULO'
      | 'MOTORISTA'
      | 'SISTEMA',
  };

  const res = await clientApi(
    `/petrocarga/notificacoes/sendNotification/byPermissao/${permissao}`,
    {
      method: 'POST',
      json: payload,
    },
  );

  if (!res.ok) {
    let msg = 'Erro ao enviar notificação';
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }
  return { error: false, message: 'Notificação enviada com sucesso' };
}

// ----------------------
// OBTER NOTIFICAÇÕES DO USUÁRIO
// ----------------------

/**
 * @function getNotificacoesUsuario
 * @description Lista notificações de um usuário, com filtro opcional por status de leitura.
 *
 * @param usuarioId - ID do usuário
 * @param lida - (opcional) Filtrar por lidas (true) ou não lidas (false)
 *
 * @returns Promise<{ error: boolean; message?: string; notificacoes?: Notificacao[] }>
 *
 * @example
 * ```ts
 * // Buscar todas as notificações do usuário
 * const result = await getNotificacoesUsuario('123');
 *
 * // Buscar apenas não lidas
 * const naoLidas = await getNotificacoesUsuario('123', false);
 * ```
 */
export async function getNotificacoesUsuario(
  usuarioId: string,
  lida?: boolean,
) {
  let url = `/petrocarga/notificacoes/byUsuario/${usuarioId}`;

  if (lida !== undefined) {
    url += `?lida=${lida}`;
  }

  const res = await clientApi(url, {
    method: 'GET',
  });

  if (!res.ok) {
    let msg = 'Erro ao buscar notificações';
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, notificacoes: data };
}

// ----------------------
// OBTER NOTIFICAÇÃO POR ID (e marca como lida)
// ----------------------

/**
 * @function getNotificacaoById
 * @description Busca uma notificação específica e automaticamente a marca como lida.
 *
 * @param id - ID da notificação
 * @returns Promise<{ error: boolean; message?: string; notificacao?: Notificacao }>
 *
 * @example
 * ```ts
 * const result = await getNotificacaoById('notif123');
 * if (!result.error) {
 *   console.log(result.notificacao.titulo);
 * }
 * ```
 */
export async function getNotificacaoById(id: string) {
  const res = await clientApi(`/petrocarga/notificacoes/${id}`, {
    method: 'GET',
  });

  if (!res.ok) {
    let msg = 'Erro ao buscar notificação';
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, notificacao: data };
}

// ----------------------
// MARCAR NOTIFICAÇÃO COMO LIDA
// ----------------------

/**
 * @function marcarNotificacaoComoLida
 * @description Marca uma notificação específica como lida.
 *
 * @param notificacaoId - ID da notificação
 * @returns Promise<{ error: boolean; message: string; notificacao?: Notificacao }>
 *
 * @example
 * ```ts
 * const result = await marcarNotificacaoComoLida('notif123');
 * ```
 */
export async function marcarNotificacaoComoLida(notificacaoId: string) {
  const res = await clientApi(
    `/petrocarga/notificacoes/lida/${notificacaoId}`,
    {
      method: 'PATCH',
    },
  );

  if (!res.ok) {
    let msg = 'Erro ao alterar notificação para lida';
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return {
    error: false,
    message: 'Notificação marcada como lida',
    notificacao: data,
  };
}

// ----------------------
// MARCAR NOTIFICAÇÕES SELECIONADAS COMO LIDAS
// ----------------------

/**
 * @function marcarTodasNotificacoesComoLidas
 * @description Marca múltiplas notificações como lidas em lote.
 *
 * @param usuarioId - ID do usuário
 * @param listaNotificacaoId - Array com IDs das notificações
 * @returns Promise<{ error: boolean; message: string; notificacoes?: Notificacao[] }>
 *
 * @example
 * ```ts
 * const result = await marcarTodasNotificacoesComoLidas('123', ['notif1', 'notif2']);
 * ```
 */
export async function marcarTodasNotificacoesComoLidas(
  usuarioId: string,
  listaNotificacaoId: string[],
) {
  const params = new URLSearchParams();
  listaNotificacaoId.forEach((id) => params.append('listaNotificacaoId', id));

  const res = await clientApi(
    `/petrocarga/notificacoes/marcarSelecionadasComoLida/${usuarioId}?${params.toString()}`,
    {
      method: 'PATCH',
    },
  );

  if (!res.ok) {
    let msg = 'Erro ao marcar notificações como lidas';
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return {
    error: false,
    message: 'Notificações marcadas como lidas',
    notificacoes: data,
  };
}

// ----------------------
// DELETAR NOTIFICAÇÃO
// ----------------------

/**
 * @function deletarNotificacao
 * @description Remove uma notificação específica.
 *
 * @param usuarioId - ID do usuário
 * @param notificacaoId - ID da notificação
 * @returns Promise<{ error: boolean; message: string }>
 *
 * @example
 * ```ts
 * const result = await deletarNotificacao('123', 'notif1');
 * ```
 */
export async function deletarNotificacao(
  usuarioId: string,
  notificacaoId: string,
) {
  const res = await clientApi(
    `/petrocarga/notificacoes/${usuarioId}/${notificacaoId}`,
    {
      method: 'DELETE',
    },
  );

  if (!res.ok) {
    let msg = 'Erro ao deletar notificação';
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  return { error: false, message: 'Notificação deletada com sucesso' };
}

// ----------------------
// DELETAR NOTIFICAÇÕES SELECIONADAS
// ----------------------

/**
 * @function deletarNotificacoesSelecionadas
 * @description Remove múltiplas notificações em lote.
 *
 * @param usuarioId - ID do usuário
 * @param listaNotificacaoId - Array com IDs das notificações
 * @returns Promise<{ error: boolean; message: string }>
 *
 * @example
 * ```ts
 * const result = await deletarNotificacoesSelecionadas('123', ['notif1', 'notif2']);
 * ```
 */
export async function deletarNotificacoesSelecionadas(
  usuarioId: string,
  listaNotificacaoId: string[],
) {
  const params = new URLSearchParams();
  listaNotificacaoId.forEach((id) => params.append('listaNotificacaoId', id));

  const res = await clientApi(
    `/petrocarga/notificacoes/deletarSelecionadas/${usuarioId}?${params.toString()}`,
    {
      method: 'DELETE',
    },
  );

  if (!res.ok) {
    let msg = 'Erro ao deletar notificações';
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  return { error: false, message: 'Notificações deletadas com sucesso' };
}

// ----------------------
// BUSCAR STATUS DO PUSH TOKEN
// ----------------------

/**
 * @function buscarStatusPushToken
 * @description Verifica o status de um token de push notification.
 *
 * @param token - Token push (pode ser null)
 * @returns Promise<{ error: boolean; message?: string; data?: any }>
 *
 * @example
 * ```ts
 * const result = await buscarStatusPushToken('token123');
 * if (result.data) {
 *   console.log('Token ativo:', result.data.ativo);
 * }
 * ```
 */
export async function buscarStatusPushToken(token: string | null) {
  const res = await clientApi(
    `/petrocarga/notificacoes/pushToken/byToken?token=${encodeURIComponent(
      token ?? '',
    )}`,
    {
      method: 'GET',
    },
  );

  if (!res.ok) {
    let msg = 'Erro ao buscar status do push token';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg, data: null };
  }

  try {
    const data = await res.json();
    return { error: false, data };
  } catch {
    return { error: false, data: null };
  }
}
// ----------------------
// ATUALIZAR STATUS DO PUSH TOKEN
// ----------------------

/**
 * @function atualizarStatusPushToken
 * @description Ativa ou desativa notificações push para um usuário.
 *
 * @param usuarioId - ID do usuário
 * @param token - Token push (pode ser null para desativar)
 * @param ativo - Status desejado (true = ativo, false = inativo)
 * @returns Promise<{ error: boolean; message: string }>
 *
 * @example
 * ```ts
 * // Ativar notificações
 * const result = await atualizarStatusPushToken('123', 'token123', true);
 *
 * // Desativar notificações
 * const result = await atualizarStatusPushToken('123', null, false);
 * ```
 */
export async function atualizarStatusPushToken(
  usuarioId: string,
  token: string | null,
  ativo: boolean,
) {
  const res = await clientApi(
    `/petrocarga/notificacoes/pushToken/${usuarioId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ token, ativo }),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!res.ok) {
    let msg = 'Erro ao atualizar status do push token';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  return { error: false, message: 'Status atualizado com sucesso' };
}
