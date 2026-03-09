'use client';

import { clientApi } from '../clientApi';
import type {
  AgenteInput,
  AgenteCompleto,
  AgenteResponse,
  FiltrosAgente,
} from '@/lib/types/agente';

export async function addAgente(
  _: unknown,
  formData: FormData,
): Promise<AgenteResponse<AgenteInput>> {
  const payload: AgenteInput = {
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
    matricula: formData.get('matricula') as string,
  };

  const res = await clientApi(`/petrocarga/agentes`, {
    method: 'POST',
    json: payload,
  });

  if (!res.ok) {
    let msg = 'Erro ao cadastrar agente';

    try {
      const data = await res.json();
      msg = data.message ?? msg;
    } catch {
      // Mantém a mensagem padrão
    }

    return { error: true, message: msg, valores: payload };
  }

  return { error: false, message: 'Agente cadastrado com sucesso!' };
}

export async function deleteAgente(agenteId: string): Promise<AgenteResponse> {
  try {
    await clientApi(`/petrocarga/agentes/${agenteId}`, { method: 'DELETE' });
    return { error: false, message: 'Agente deletado com sucesso!' };
  } catch (err: unknown) {
    console.error('Erro ao deletar agente:', err);
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}

export async function atualizarAgente(
  formData: FormData,
): Promise<AgenteResponse<AgenteInput>> {
  const usuarioid = formData.get('id') as string;

  const payload: AgenteInput = {
    id: usuarioid,
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
    matricula: formData.get('matricula') as string,
    senha: formData.get('senha') as string,
  };

  try {
    await clientApi(`/petrocarga/agentes/${usuarioid}`, {
      method: 'PATCH',
      json: payload,
    });

    return { error: false, message: 'Agente atualizado com sucesso!' };
  } catch (err: unknown) {
    console.error('Erro ao atualizar agente:', err);
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}

export async function getAgenteByUserId(
  userId: string,
): Promise<AgenteResponse<AgenteCompleto>> {
  const res = await clientApi(`/petrocarga/agentes/${userId}`);

  if (!res.ok) {
    let msg = 'Erro ao buscar agente';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {
      // Mantém a mensagem padrão
    }

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, agenteId: data.id, agente: data };
}

export async function getAgentes(
  filtros?: FiltrosAgente,
): Promise<AgenteResponse<AgenteCompleto>> {
  const params = new URLSearchParams();

  if (filtros?.nome) params.append('nome', filtros.nome);
  if (filtros?.matricula) params.append('matricula', filtros.matricula);
  if (filtros?.telefone) params.append('telefone', filtros.telefone);
  if (filtros?.email) params.append('email', filtros.email);
  if (filtros?.ativo !== undefined)
    params.append('ativo', filtros.ativo.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/petrocarga/agentes?${queryString}`
    : `/petrocarga/agentes`;

  const res = await clientApi(url);

  if (!res.ok) {
    let msg = 'Erro ao buscar agentes';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {
      // Mantém a mensagem padrão
    }

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, agentes: data };
}
