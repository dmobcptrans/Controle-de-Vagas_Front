'use client';

import { TOKEN_KEY } from '@/service/api';
import { clientApi } from '../clientApi';

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
    }
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
    }
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
export async function getNotificacoesUsuario(
  usuarioId: string,
  lida?: boolean
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
export async function marcarNotificacaoComoLida(notificacaoId: string) {
  const res = await clientApi(
    `/petrocarga/notificacoes/lida/${notificacaoId}`,
    {
      method: 'PATCH',
    }
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
export async function marcarTodasNotificacoesComoLidas(
  usuarioId: string,
  listaNotificacaoId: string[]
) {
  const params = new URLSearchParams();
  listaNotificacaoId.forEach((id) => params.append('listaNotificacaoId', id));

  const res = await clientApi(
    `/petrocarga/notificacoes/marcarSelecionadasComoLida/${usuarioId}?${params.toString()}`,
    {
      method: 'PATCH',
    }
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
export async function deletarNotificacao(
  usuarioId: string,
  notificacaoId: string
) {
  const res = await clientApi(
    `/petrocarga/notificacoes/${usuarioId}/${notificacaoId}`,
    {
      method: 'DELETE',
    }
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
export async function deletarNotificacoesSelecionadas(
  usuarioId: string,
  listaNotificacaoId: string[]
) {
  const params = new URLSearchParams();
  listaNotificacaoId.forEach((id) => params.append('listaNotificacaoId', id));

  const res = await clientApi(
    `/petrocarga/notificacoes/deletarSelecionadas/${usuarioId}?${params.toString()}`,
    {
      method: 'DELETE',
    }
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
export async function buscarStatusPushToken(
  token: string | null
) {
  const res = await clientApi(
    `/petrocarga/notificacoes/pushToken/byToken?token=${encodeURIComponent(
      token ?? ''
    )}`,
    {
      method: 'GET',
    }
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
export async function atualizarStatusPushToken(
  usuarioId: string,
  token: string | null,
  ativo: boolean
) {
  const res = await clientApi(
    `/petrocarga/notificacoes/pushToken/${usuarioId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ token, ativo }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
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