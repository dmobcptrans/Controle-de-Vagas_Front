'use client';

import { clientApi } from '../clientApi';
import type {
  Vaga,
  VagaPayload,
  VagaResponse,
  FiltrosVaga,
  ApiError,
  OperacoesVaga,
} from '@/lib/types/vaga';

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
 * ----------------------------------------------------------------------------
 * 🔧 FUNÇÃO AUXILIAR INTERNA:
 * ----------------------------------------------------------------------------
 *
 * buildVagaPayload - Constrói payload padronizado a partir do FormData
 */

/**
 * @function buildVagaPayload
 * @description Função interna que converte FormData em VagaPayload.
 * Processa campos complexos como dias da semana (JSON parse) e coordenadas.
 *
 * @param formData - Formulário com dados da vaga
 * @returns VagaPayload - Objeto formatado para envio à API
 *
 * @private
 */
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

type GetVagasParams = {
  status?: string;
  numeroPagina?: number;
  tamanhoPagina?: number;
  ordenarPor?: string;
  logradouro?: string;
};

export async function getVagasFiltradas(params?: GetVagasParams): Promise<Vaga[]> {
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

    if (params?.logradouro !== undefined && params.logradouro !== "") {
      queryParams.append('logradouro', String(params.logradouro));
    }

    // AJUSTE 1: Troca os sinais de '+' gerados pelo URLSearchParams por '%20'
    const queryString = queryParams.toString().replace(/\+/g, '%20');

    const query = queryString
      ? `?${queryString}`
      : '';

    // AJUSTE 2: Remove o '/all' da rota para bater com o seu padrão
    const res = await clientApi(`/petrocarga/vagas${query}`, {
      method: 'GET',
    });

    const data = await res.json();
    return Array.isArray(data) ? data : (data?.content ?? []);
  } catch (err) {
    const error = err as ApiError; // Assumindo que ApiError está tipado em outro lugar
    console.error('Erro ao buscar vagas:', error);
    return [];
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
