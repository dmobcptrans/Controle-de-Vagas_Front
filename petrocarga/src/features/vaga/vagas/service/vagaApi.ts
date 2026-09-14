'use client';

import { clientApi } from '@/services/clientApi';
import {
  AreaVaga,
  OperacoesVaga,
  StatusVaga,
  TipoVaga,
  VagaPayload,
  VagasResponse,
} from '../types/vaga2';
import { getApiErrorMessage } from '@/lib/types/response/getApiErrorMessage';
import { ConfirmResult } from '@/lib/types/confirmResult';

/**
 * @module vagaApi
 * @description Módulo de API para gerenciamento de vagas de estacionamento.
 * Fornece funções para criar, consultar, atualizar e deletar vagas,
 * incluindo dados complexos como endereço, operações por dia da semana e georreferenciamento.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. addVaga - Cadastra uma nova vaga
 * 2. deleteVaga - Remove uma vaga existente
 * 3. atualizarVaga - Atualiza dados de uma vaga
 * 4. getVagas - Lista vagas com filtro opcional por status
 * 5. getVagasComFiltros - Lista vagas com múltiplos filtros
 * 6. getVagaById - Busca vaga específica por ID
 *

// ----------------------
// POST VAGA
// ----------------------

/**
 * @function addVaga
 * @description Cadastra uma nova vaga de estacionamento.
 *
 * @param formData - Formulário com dados completos da vaga
 *
 * Campos do FormData:
 * - codigo/codigoPmp: Código PMP da rua
 * - logradouro: Nome da rua/avenida
 * - bairro: Bairro
 * - area: Área (vermelha, amarela, azul, branca) - convertido para maiúsculas
 * - numeroEndereco: Números de referência
 * - descricao: Descrição/referências
 * - tipo: Tipo (paralela, perpendicular) - convertido para maiúsculas
 * - status: Status da vaga (padrão: DISPONIVEL)
 * - localizacao-inicio: Coordenadas de início
 * - localizacao-fim: Coordenadas de fim
 * - comprimento: Comprimento em metros
 * - diaSemana: JSON string com operações por dia
 *
 * @returns Promise<VagaResponse<VagaPayload>>
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('codigo', 'Md-1234');
 * formData.append('logradouro', 'Rua do Imperador');
 * formData.append('area', 'vermelha');
 * formData.append('comprimento', '10');
 * formData.append('diaSemana', JSON.stringify([
 *   { codigoDiaSemana: 1, horaInicio: '08:00', horaFim: '18:00' }
 * ]));
 *
 * const result = await addVaga(formData);
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function CriarVaga(formData: FormData): Promise<VagasResponse> {
  const diasSemanaRaw = formData.get('diaSemana') as string;

  const diasSemana: OperacoesVaga[] = diasSemanaRaw
    ? JSON.parse(diasSemanaRaw)
    : [];

  const body: VagaPayload = {
    endereco: {
      codigoPmp: formData.get('codigo') as string,
      logradouro: formData.get('logradouro') as string,
      bairro: formData.get('bairro') as string,
    },
    area: formData.get('area') as AreaVaga,
    numeroEndereco: formData.get('numeroEndereco') as string,
    referenciaEndereco: formData.get('descricao') as string,
    TipoVaga: formData.get('tipo') as TipoVaga,
    latitudeInicio: Number(formData.get('latitudeInicio')),
    latitudeFim: Number(formData.get('latitudeFim')),
    longitudeInicio: Number(formData.get('longitudeInicio')),
    longitudeFim: Number(formData.get('longitudeFim')),
    comprimento: Number(formData.get('comprimento')),
    operacoesVaga: diasSemana[0],
  };

  try {
    const res = await clientApi('/petrocarga/vagas', {
      method: 'POST',
      json: body,
    });

    return (await res.json()) as VagasResponse;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao criar vaga.'));
  }
}

// ----------------------
// DELETE VAGA
// ----------------------

/**
 * @function deleteVaga
 * @description Remove uma vaga existente pelo ID.
 *
 * @param id - ID da vaga a ser deletada
 * @returns Promise<VagaResponse>
 *
 * @example
 * ```ts
 * const result = await deleteVaga('vaga123');
 * if (result.error) {
 *   toast.error(result.message);
 * } else {
 *   toast.success(result.message);
 * }
 * ```
 */
export async function deleteVaga(id: string): Promise<ConfirmResult> {
  try {
    await clientApi(`/petrocarga/vagas/${id}`, {
      method: 'DELETE',
    });

    return {
      success: true,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Erro ao deletar vaga.'),
    };
  }
}

// ----------------------
// PATCH VAGA
// ----------------------

/**
 * @function atualizarVaga
 * @description Atualiza dados de uma vaga existente.
 *
 * @param formData - Formulário com dados atualizados da vaga (inclui id)
 * @returns Promise<VagaResponse<VagaPayload>>
 *
 * Campos adicionais do FormData:
 * - id: ID da vaga (obrigatório)
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('id', 'vaga123');
 * formData.append('status', 'INDISPONIVEL');
 *
 * const result = await atualizarVaga(formData);
 * ```
 */
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

/**
 * @function getVagas
 * @description Lista vagas com filtro opcional por status.
 *
 * @param status - (opcional) Filtro por status ('DISPONIVEL', 'INDISPONIVEL', etc.)
 * @returns Promise<Vaga[]>
 *
 * @example
 * ```ts
 * // Todas as vagas
 * const todas = await getVagas();
 *
 * // Apenas vagas disponíveis
 * const disponiveis = await getVagas('DISPONIVEL');
 *
 * console.log(`Total: ${todas.length}`);
 * ```
 */
export async function getVagas(status?: string): Promise<Vaga[]> {
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

export async function getVagasPorMapa(params: {
  north: number;
  south: number;
  east: number;
  west: number;
  status?: string;
}) {
  const query = new URLSearchParams({
    north: params.north.toString(),
    south: params.south.toString(),
    east: params.east.toString(),
    west: params.west.toString(),
    ...(params.status && { status: params.status }),
  });

  const response = await clientApi(`/petrocarga/vagas/mapa?${query}`);
  return response.json();
}

type GetVagasParams = {
  status?: string;
  numeroPagina?: number;
  tamanhoPagina?: number;
  ordenarPor?: string;
  logradouro?: string;
};

export type VagasPaginadas = {
  vagas: Vaga[];
  paginaAtual: number;
  totalPaginas: number;
  totalElementos: number;
};

export async function getVagasFiltradas(
  params?: GetVagasParams,
): Promise<VagasPaginadas> {
  const vazio: VagasPaginadas = {
    vagas: [],
    paginaAtual: params?.numeroPagina ?? 0,
    totalPaginas: 0,
    totalElementos: 0,
  };

  try {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);

    if (params?.numeroPagina !== undefined)
      queryParams.append('numeroPagina', String(params.numeroPagina));

    if (params?.tamanhoPagina !== undefined)
      queryParams.append('tamanhoPagina', String(params.tamanhoPagina));

    if (params?.ordenarPor) queryParams.append('ordenarPor', params.ordenarPor);

    if (params?.logradouro) queryParams.append('logradouro', params.logradouro);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const res = await clientApi(`/petrocarga/vagas${query}`, {
      method: 'GET',
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      return {
        vagas: data,
        paginaAtual: params?.numeroPagina ?? 0,
        totalPaginas: 1,
        totalElementos: data.length,
      };
    }

    return {
      vagas: data?.content ?? [],
      paginaAtual: data?.pagina ?? data?.number ?? 0,
      totalPaginas: data?.totalPaginas ?? data?.totalPages ?? 1,
      totalElementos:
        data?.totalElementos ??
        data?.totalElements ??
        data?.content?.length ??
        0,
    };
  } catch (err) {
    console.error('Erro ao buscar vagas:', err);
    return vazio;
  }
}

// ----------------------
// GET VAGAS COM FILTROS (versão alternativa com mais filtros)
// ----------------------

/**
 * @function getVagasComFiltros
 * @description Lista vagas com múltiplos filtros opcionais.
 * Versão mais completa que retorna objeto padronizado VagaResponse.
 *
 * @param filtros - Objeto com filtros para a busca
 * @param filtros.status - Status da vaga
 * @param filtros.area - Área (vermelha, amarela, etc.)
 * @param filtros.tipoVaga - Tipo (paralela, perpendicular)
 * @param filtros.bairro - Bairro
 *
 * @returns Promise<VagaResponse<Vaga>>
 *
 * @example
 * ```ts
 * const result = await getVagasComFiltros({
 *   area: 'vermelha',
 *   bairro: 'Centro',
 *   status: 'DISPONIVEL'
 * });
 *
 * if (!result.error) {
 *   result.vagas?.forEach(vaga => {
 *     console.log(vaga.endereco.logradouro);
 *   });
 * }
 * ```
 */
export async function getVagasComFiltros(
  filtros?: FiltrosVaga,
): Promise<VagaResponse<Vaga>> {
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

/**
 * @function getVagaById
 * @description Busca uma vaga específica pelo ID.
 *
 * @param id - ID da vaga
 * @returns Promise<Vaga | null> - Dados da vaga ou null se não encontrada
 *
 * @example
 * ```ts
 * const vaga = await getVagaById('vaga123');
 * if (vaga) {
 *   console.log(vaga.endereco.logradouro);
 * }
 * ```
 */
export async function getVagaById(id: string): Promise<Vaga | null> {
  try {
    const res = await clientApi(`/petrocarga/vagas/${id}`, { method: 'GET' });
    return (await res.json()) ?? null;
  } catch (err) {
    const error = err as ApiError;
    console.error(`Erro ao buscar vaga ${id}:`, error);
    return null;
  }
}
