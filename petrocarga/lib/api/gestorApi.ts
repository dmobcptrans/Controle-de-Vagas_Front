'use client';

import { clientApi } from '../clientApi';
import type {
  GestorInput,
  GestorCompleto,
  GestorResponse,
  FiltrosGestor,
} from '@/lib/types/gestor';

// ----------------------
// ADD GESTOR
// ----------------------
export async function addGestor(
  _: unknown,
  formData: FormData,
): Promise<GestorResponse<GestorInput>> {
  const payload: GestorInput = {
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
  };

  const res = await clientApi(`/petrocarga/gestores`, {
    method: 'POST',
    json: payload,
  });

  if (!res.ok) {
    let msg = 'Erro ao cadastrar gestor';

    try {
      const data = await res.json();
      msg = data.message ?? msg;
    } catch {
      // Mantém a mensagem padrão
    }

    return { error: true, message: msg, valores: payload };
  }

  return { error: false, message: 'Gestor cadastrado com sucesso!' };
}

// ----------------------
// DELETE GESTOR
// ----------------------
export async function deleteGestor(gestorId: string): Promise<GestorResponse> {
  try {
    await clientApi(`/petrocarga/gestores/${gestorId}`, { method: 'DELETE' });
    return { error: false, message: 'Gestor deletado com sucesso!' };
  } catch (err: unknown) {
    console.error('Erro ao deletar gestor:', err);
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro ao deletar gestor',
    };
  }
}

// ----------------------
// ATUALIZAR GESTOR
// ----------------------
export async function atualizarGestor(
  formData: FormData,
): Promise<GestorResponse<GestorInput>> {
  const usuarioId = formData.get('id') as string;

  const payload: GestorInput = {
    id: usuarioId,
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
    senha: formData.get('senha') as string,
  };

  try {
    await clientApi(`/petrocarga/gestores/${usuarioId}`, {
      method: 'PATCH',
      json: payload,
    });
    return { error: false, message: 'Gestor atualizado com sucesso!' };
  } catch (err: unknown) {
    console.error('Erro ao atualizar gestor:', err);
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro ao atualizar gestor',
      valores: payload,
    };
  }
}

// ----------------------
// GET GESTORES COM FILTROS
// ----------------------
export async function getGestores(
  filtros?: FiltrosGestor,
): Promise<GestorResponse<GestorCompleto>> {
  // Construir query string com filtros
  const params = new URLSearchParams();

  if (filtros?.nome) params.append('nome', filtros.nome);
  if (filtros?.email) params.append('email', filtros.email);
  if (filtros?.telefone) params.append('telefone', filtros.telefone);
  if (filtros?.ativo !== undefined)
    params.append('ativo', filtros.ativo.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/petrocarga/gestores?${queryString}`
    : `/petrocarga/gestores`;

  const res = await clientApi(url);

  if (!res.ok) {
    let msg = 'Erro ao buscar gestores';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {
      // Mantém a mensagem padrão
    }

    return { error: true, message: msg };
  }

  const gestores = await res.json();
  return { error: false, gestores };
}

// ----------------------
// GET GESTOR BY USER ID
// ----------------------
export async function getGestorByUserId(
  userId: string,
): Promise<GestorResponse<GestorCompleto>> {
  const res = await clientApi(`/petrocarga/gestores/${userId}`);

  if (!res.ok) {
    let msg = 'Erro ao buscar gestor';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {
      // Mantém a mensagem padrão
    }

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, gestorId: data.id, gestor: data };
}
