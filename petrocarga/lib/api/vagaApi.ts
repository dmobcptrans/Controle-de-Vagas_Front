'use client';

import { clientApi } from '../clientApi';
import type {
  VagaCompleta,
  VagaPayload,
  VagaResponse,
  FiltrosVaga,
  ApiError,
  OperacoesVaga,
} from '@/lib/types/vaga';

function buildVagaPayload(formData: FormData): VagaPayload {
  const diasSemanaRaw = formData.get('diaSemana') as string;
  const diasSemana: OperacoesVaga[] = diasSemanaRaw
    ? JSON.parse(diasSemanaRaw)
    : [];

  return {
    endereco: {
      codigoPmp: formData.get('codigo') ?? formData.get('codigoPmp'),
      logradouro: formData.get('logradouro'),
      bairro: formData.get('bairro'),
    },
    area: (formData.get('area') as string)?.toUpperCase(),
    numeroEndereco: formData.get('numeroEndereco'),
    referenciaEndereco: formData.get('descricao'),
    tipoVaga: (formData.get('tipo') as string)?.toUpperCase(),
    status: (formData.get('status') as string)?.toUpperCase() ?? 'DISPONIVEL',
    referenciaGeoInicio: formData.get('localizacao-inicio'),
    referenciaGeoFim: formData.get('localizacao-fim'),
    comprimento: Number(formData.get('comprimento')),
    operacoesVaga: diasSemana.map((dia) => ({
      codigoDiaSemana: dia.codigoDiaSemana
        ? Number(dia.codigoDiaSemana)
        : undefined,
      horaInicio: dia.horaInicio,
      horaFim: dia.horaFim,
      ...(dia.diaSemanaAsEnum ? { diaSemanaAsEnum: dia.diaSemanaAsEnum } : {}),
    })),
  };
}

// ----------------------
// POST VAGA
// ----------------------
export async function addVaga(
  formData: FormData,
): Promise<VagaResponse<VagaPayload>> {
  const payload = buildVagaPayload(formData);

  try {
    await clientApi('/petrocarga/vagas', { method: 'POST', json: payload });
    return {
      error: false,
      message: 'Vaga cadastrada com sucesso!',
      valores: null,
    };
  } catch (err) {
    const error = err as ApiError;
    console.error('Erro ao cadastrar vaga:', error);
    return { error: true, message: error.message, valores: payload };
  }
}

// ----------------------
// DELETE VAGA
// ----------------------
export async function deleteVaga(id: string): Promise<VagaResponse> {
  try {
    await clientApi(`/petrocarga/vagas/${id}`, { method: 'DELETE' });
    return { error: false, message: 'Vaga deletada com sucesso!' };
  } catch (err) {
    const error = err as ApiError;
    console.error('Erro ao deletar vaga:', error);
    return { error: true, message: error.message };
  }
}

// ----------------------
// PATCH VAGA
// ----------------------
export async function atualizarVaga(
  formData: FormData,
): Promise<VagaResponse<VagaPayload>> {
  const id = formData.get('id') as string;
  const payload = buildVagaPayload(formData);

  try {
    await clientApi(`/petrocarga/vagas/${id}`, {
      method: 'PATCH',
      json: payload,
    });
    return { error: false, message: 'Vaga atualizada com sucesso!' };
  } catch (err) {
    const error = err as ApiError;
    console.error('Erro ao atualizar vaga:', error);
    return { error: true, message: error.message, valores: payload };
  }
}

// ----------------------
// GET VAGAS
// ----------------------
export async function getVagas(status?: string): Promise<VagaCompleta[]> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';

    const res = await clientApi(`/petrocarga/vagas/all${query}`, {
      method: 'GET',
    });

    const data = await res.json();
    return Array.isArray(data) ? data : (data?.vagas ?? []);
  } catch (err) {
    const error = err as ApiError;
    console.error('Erro ao buscar vagas:', error);
    return [];
  }
}

// ----------------------
// GET VAGAS COM FILTROS (versão alternativa com mais filtros)
// ----------------------
export async function getVagasComFiltros(
  filtros?: FiltrosVaga,
): Promise<VagaResponse<VagaCompleta>> {
  try {
    const params = new URLSearchParams();

    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.area) params.append('area', filtros.area);
    if (filtros?.tipoVaga) params.append('tipoVaga', filtros.tipoVaga);
    if (filtros?.bairro) params.append('bairro', filtros.bairro);

    const queryString = params.toString();
    const url = queryString
      ? `/petrocarga/vagas/all?${queryString}`
      : '/petrocarga/vagas/all';

    const res = await clientApi(url, { method: 'GET' });
    const data = await res.json();

    const vagas = Array.isArray(data) ? data : (data?.vagas ?? []);

    return { error: false, vagas };
  } catch (err) {
    const error = err as ApiError;
    console.error('Erro ao buscar vagas:', error);
    return { error: true, message: error.message };
  }
}

// ----------------------
// GET VAGA POR ID
// ----------------------
export async function getVagaById(id: string): Promise<VagaCompleta | null> {
  try {
    const res = await clientApi(`/petrocarga/vagas/${id}`, { method: 'GET' });
    return (await res.json()) ?? null;
  } catch (err) {
    const error = err as ApiError;
    console.error(`Erro ao buscar vaga ${id}:`, error);
    return null;
  }
}
