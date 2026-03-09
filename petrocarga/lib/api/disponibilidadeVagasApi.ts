'use client';

import { clientApi } from '../clientApi';
import type {
  DisponibilidadeInput,
  DisponibilidadeVagasBody,
  DisponibilidadeCompleta,
  DisponibilidadeResponse,
} from '@/lib/types/disponibilidadeVagas';

export async function addDisponibilidadeVagas(
  formData: FormData,
): Promise<DisponibilidadeResponse<DisponibilidadeCompleta>> {
  const vagaIds = formData.getAll('vagaid') as string[];

  const body: DisponibilidadeVagasBody = {
    listaVagaId: vagaIds,
    inicio: new Date(formData.get('inicio') as string).toISOString(),
    fim: new Date(formData.get('fim') as string).toISOString(),
  };

  try {
    const res = await clientApi('/petrocarga/disponibilidade-vagas/vagas', {
      method: 'POST',
      json: body,
    });

    const data = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    console.error('Erro ao adicionar disponibilidade:', err);
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao adicionar disponibilidade',
    };
  }
}

export async function getDisponibilidadeVagas(): Promise<
  DisponibilidadeResponse<DisponibilidadeCompleta[]>
> {
  try {
    const res = await clientApi('/petrocarga/disponibilidade-vagas', {
      method: 'GET',
    });

    const data = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    console.error('Erro ao buscar disponibilidade:', err);
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao buscar disponibilidades',
    };
  }
}

export async function getDisponibilidadeVagasByVagaId(
  vagaId: string,
): Promise<DisponibilidadeResponse<DisponibilidadeCompleta[]>> {
  try {
    const res = await clientApi(
      `/petrocarga/disponibilidade-vagas/vaga/${vagaId}`,
      {
        method: 'GET',
      },
    );

    const data = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    console.error('Erro ao buscar disponibilidade por vagaId', err);
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao buscar disponibilidades por vaga',
    };
  }
}

export async function editarDisponibilidadeVagas(
  id: string,
  vagaId: string,
  inicio: string,
  fim: string,
): Promise<DisponibilidadeResponse<DisponibilidadeInput>> {
  const body: DisponibilidadeInput = { vagaId, inicio, fim };

  try {
    await clientApi(`/petrocarga/disponibilidade-vagas/${id}`, {
      method: 'PATCH',
      json: body,
    });

    return { success: true, valores: body };
  } catch (err: unknown) {
    console.error('Erro ao atualizar disponibilidade:', err);
    return {
      error: true,
      message:
        err instanceof Error ? err.message : 'Erro desconhecido ao atualizar',
      valores: body,
    };
  }
}

export async function deleteDisponibilidadeVagas(
  disponibilidadeId: string,
): Promise<DisponibilidadeResponse> {
  if (!disponibilidadeId) {
    return {
      error: true,
      message: 'ID da disponibilidade não enviado.',
    };
  }

  try {
    await clientApi(`/petrocarga/disponibilidade-vagas/${disponibilidadeId}`, {
      method: 'DELETE',
    });

    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao deletar disponibilidade:', err);
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao deletar disponibilidade',
    };
  }
}
