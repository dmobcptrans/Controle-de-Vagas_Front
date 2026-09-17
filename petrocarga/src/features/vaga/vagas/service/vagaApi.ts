'use client';

import { clientApi } from '@/services/clientApi';
import {
  AreaVaga,
  OperacoesVaga,
  StatusVaga,
  TipoResultadoMapa,
  TipoVaga,
  VagaPayload,
  VagaResponse,
  VagasFiltradasParams,
  VagasMapaParams,
  VagasMapaResponse,
  VagasPaginadasResponse,
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
export async function criarVaga(formData: FormData): Promise<VagaResponse> {
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

    operacoesVaga: diasSemana,
  };

  try {
    const res = await clientApi('/petrocarga/vagas', {
      method: 'POST',
      json: body,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const data: VagaResponse = await res.json();

    return data;
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
  body: VagaPayload,
  vagaId: string,
): Promise<ConfirmResult> {
  try {
    await clientApi(`/petrocarga/vagas/${vagaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return {
      success: true,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Erro ao atualizar vaga.'),
    };
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
export async function getVagas(status?: string): Promise<VagaResponse[]> {
  const queryParams = status
    ? new URLSearchParams({
        status,
      }).toString()
    : '';

  try {
    const res = await clientApi(
      `/petrocarga/vagas/all${queryParams ? `?${queryParams}` : ''}`,
      {
        method: 'GET',
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const data: VagaResponse[] = await res.json();

    return Array.isArray(data) ? data : [];
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao buscar vagas.'));
  }
}

export async function getVagasPorMapa(
  params: VagasMapaParams,
): Promise<VagasMapaResponse> {
  const queryParams = new URLSearchParams({
    north: params.north.toString(),
    south: params.south.toString(),
    east: params.east.toString(),
    west: params.west.toString(),
    zoom: params.zoom.toString(),
    ...(params.status && { status: params.status }),
  }).toString();

  try {
    const res = await clientApi(
      `/petrocarga/vagas/mapa?${queryParams}`,
      {
        method: 'GET',
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw errorBody ?? {
        message: `Erro HTTP ${res.status}`,
      };
    }

    const data: VagasMapaResponse = await res.json();

    return {
      tipo: data?.tipo === 'CLUSTERS' ? 'CLUSTERS' : 'VAGAS',
      vagas: Array.isArray(data?.vagas) ? data.vagas : [],
      clusters: Array.isArray(data?.clusters) ? data.clusters : [],
      limiteAtingido: Boolean(data?.limiteAtingido),
    };
  } catch (err: unknown) {
    throw new Error(
      getApiErrorMessage(
        err,
        'Erro ao buscar vagas no mapa.',
      ),
    );
  }
}

export async function getVagasFiltradas(
  params?: VagasFiltradasParams,
): Promise<VagasPaginadasResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append('status', params.status);
    }

    if (params?.numeroPagina !== undefined) {
      queryParams.append('numeroPagina', String(params.numeroPagina));
    }

    if (params?.tamanhoPagina !== undefined) {
      queryParams.append('tamanhoPagina', String(params.tamanhoPagina));
    }

    if (params?.ordenarPor) {
      queryParams.append('ordenarPor', params.ordenarPor);
    }

    if (params?.logradouro) {
      queryParams.append('logradouro', params.logradouro);
    }

    const query = queryParams.toString();

    const res = await clientApi(
      `/petrocarga/vagas${query ? `?${query}` : ''}`,
      {
        method: 'GET',
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const data: VagasPaginadasResponse = await res.json();

    return data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao buscar vagas filtradas.'));
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
  status?: StatusVaga,
): Promise<VagaResponse[]> {
  const queryParams = status
    ? new URLSearchParams({
        status,
      }).toString()
    : '';

  try {
    const res = await clientApi(
      `/petrocarga/vagas/all${queryParams ? `?${queryParams}` : ''}`,
      {
        method: 'GET',
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const data = await res.json();

    const vagas: VagaResponse[] = Array.isArray(data)
      ? data
      : (data?.vagas ?? []);

    return vagas;
  } catch (err: unknown) {
    throw new Error(
      getApiErrorMessage(err, 'Erro ao buscar vagas.'),
    );
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
export async function getVagaById(id: string): Promise<VagaResponse | null> {
  try {
    const res = await clientApi(`/petrocarga/vagas/${id}`, { method: 'GET' });
    return (await res.json()) ?? null;
  } catch (err: unknown) {
    throw new Error(
      getApiErrorMessage(err, 'Erro ao buscar vaga.'),
    );
  }
}
