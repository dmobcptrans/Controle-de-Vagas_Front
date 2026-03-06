'use client';

import { clientApi } from '../clientApi';
import {
  MotoristaPayload,
  MotoristaPatchPayload,
  MotoristaResult,
} from '../types/motorista';

// ----------------------
// ADD MOTORISTA
// ----------------------
export async function addMotorista(
  prevState: MotoristaResult | null,
  formData: FormData,
): Promise<MotoristaResult> {
  const payload: MotoristaPayload = {
    usuario: {
      nome: formData.get('nome') as string,
      cpf: formData.get('cpf') as string,
      telefone: formData.get('telefone') as string,
      email: (formData.get('email') as string).toLowerCase(),
      senha: formData.get('senha') as string,
    },
    tipoCnh: (formData.get('tipoCnh') as string)?.toUpperCase(),
    numeroCnh: formData.get('numeroCnh') as string,
    dataValidadeCnh: formData.get('dataValidadeCnh') as string,
  };

  try {
    await clientApi('/petrocarga/motoristas/cadastro', {
      method: 'POST',
      json: payload,
    });
    return { error: false, message: 'Motorista cadastrado com sucesso!' };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error ? err.message : 'Erro ao cadastrar motorista',
      valores: payload,
    };
  }
}

// ----------------------
// DELETE MOTORISTA
// ----------------------
export async function deleteMotorista(
  usuarioId: string,
): Promise<MotoristaResult> {
  try {
    await clientApi(`/petrocarga/motoristas/${usuarioId}`, {
      method: 'DELETE',
    });
    return { error: false, message: 'Motorista deletado com sucesso!' };
  } catch (err: unknown) {
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro ao deletar motorista',
    };
  }
}

// ----------------------
// ATUALIZAR MOTORISTA
// ----------------------
export async function atualizarMotorista(
  formData: FormData,
): Promise<MotoristaResult> {
  const id = formData.get('id') as string;

  const payload: MotoristaPatchPayload = {
    nome: formData.get('nome') as string,
    cpf: formData.get('cpf') as string,
    telefone: formData.get('telefone') as string,
    email: formData.get('email') as string,
    senha: formData.get('senha') as string,
    tipoCnh: (formData.get('tipoCnh') as string)?.toUpperCase(),
    numeroCnh: formData.get('numeroCnh') as string,
    dataValidadeCnh: formData.get('dataValidadeCnh') as string,
  };

  try {
    await clientApi(`/petrocarga/motoristas/${id}`, {
      method: 'PATCH',
      json: payload,
    });
    return { error: false, message: 'Motorista atualizado com sucesso!' };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error ? err.message : 'Erro ao atualizar motorista',
    };
  }
}

// ----------------------
// GET MOTORISTA BY USER ID
// ----------------------
export async function getMotoristaByUserId(userId: string) {
  const res = await clientApi(`/petrocarga/motoristas/${userId}`);

  if (!res.ok) {
    let msg = 'Erro ao buscar motorista';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, motoristaId: data.id, motorista: data };
}

// ----------------------
// GET MOTORISTAS COM FILTROS
// ----------------------
export async function getMotoristas(filtros?: {
  nome?: string;
  cnh?: string;
  telefone?: string;
  ativo?: boolean;
}) {
  // Construir query string com filtros
  const params = new URLSearchParams();

  if (filtros?.nome) params.append('nome', filtros.nome);
  if (filtros?.cnh) params.append('cnh', filtros.cnh);
  if (filtros?.telefone) params.append('telefone', filtros.telefone);
  if (filtros?.ativo !== undefined)
    params.append('ativo', filtros.ativo.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/petrocarga/motoristas?${queryString}`
    : `/petrocarga/motoristas`;

  const res = await clientApi(url);

  if (!res.ok) {
    let msg = 'Erro ao buscar motoristas';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const data = await res.json();
  return { error: false, motoristas: data };
}
