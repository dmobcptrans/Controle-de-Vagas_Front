'use client';

import toast from 'react-hot-toast';
import { clientApi } from '@/services/clientApi';

import {
  DenunciaResponse,
  DenunciaPaginadaResponse,
  DenunciaParams,
  DenunciaPayload,
  TipoDenuncia,
} from '../types/denuncia2';
import { getApiErrorMessage } from '@/lib/types/response/getApiErrorMessage';
import { buildSearchParams } from '@/services/utils/buildSearchParams';

/**
 * @module denunciaApi
 * @description Módulo de API para gerenciamento de denúncias.
 * Fornece funções para criar, listar e gerenciar o fluxo de análise de denúncias.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Denunciar - Cria uma nova denúncia (agente/motorista)
 * 2. getDenuncias - Lista todas as denúncias (gestor)
 * 3. getDenunciasByUsuario - Lista denúncias por usuário (agente/motorista)
 * 4. iniciarAnaliseDenuncia - Inicia análise de uma denúncia (gestor)
 * 5. finalizarAnaliseDenuncia - Finaliza análise com parecer (gestor)
 *
 * ----------------------------------------------------------------------------
 * 🔗 TIPOS RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ConfirmResult: { success: boolean; message?: string }
 *
 * ----------------------------------------------------------------------------
 * 📊 FLUXO DE ANÁLISE:
 * ----------------------------------------------------------------------------
 *
 * 1. Denúncia criada (pendente)
 * 2. Gestor inicia análise (status: EM_ANALISE)
 * 3. Gestor finaliza com parecer (PROCEDENTE ou IMPROCEDENTE)
 */

// ----------------------
// POST DENUNCIA
// ----------------------

/**
 * @function Denunciar
 * @description Cria uma nova denúncia para uma reserva.
 * Acessível para agentes e motoristas.
 *
 * @param formData - Formulário com dados da denúncia
 * @param formData.descricao - Descrição detalhada da denúncia
 * @param formData.reservaId - ID da reserva denunciada
 * @param formData.tipo - Tipo da denúncia (ex: "VAGA_OCUPADA", "VEICULO_INCORRETO")
 *
 * @returns Promise<ConfirmResult>
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('descricao', 'Vaga ocupada por veículo não autorizado');
 * formData.append('reservaId', '123');
 * formData.append('tipo', 'VAGA_OCUPADA');
 *
 * const result = await Denunciar(formData);
 * if (result.success) {
 *   // Denúncia enviada com sucesso (toast já exibido)
 * }
 * ```
 */

export async function CriarDenuncia(
  formData: FormData,
): Promise<DenunciaResponse> {
  const body: DenunciaPayload = {
    descricao: formData.get('descricao') as string,
    reservaId: formData.get('reservaId') as string,
    tipo: (formData.get('tipo') as TipoDenuncia).toUpperCase() as TipoDenuncia,
  };

  try {
    const res = await clientApi('/petrocarga/denuncias', {
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

    const data: DenunciaResponse = await res.json();

    return data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao cadastrar denuncia.'));
  }
}

// ----------------------
// GET TODAS AS DENUNCIAS (GESTOR)
// ----------------------

/**
 * @function getDenuncias
 * @description Lista todas as denúncias do sistema.
 * Acesso restrito a gestores.
 *
 * @returns Promise<Denuncia[]> - Array de denúncias
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * try {
 *   const denuncias = await getDenuncias();
 *   console.log(`Total de denúncias: ${denuncias.length}`);
 * } catch (error) {
 *   console.error('Erro ao carregar denúncias:', error);
 * }
 * ```
 */
export async function getDenuncias(
  params?: DenunciaParams,
): Promise<DenunciaPaginadaResponse> {
  try {
    const searchParams = buildSearchParams({
      denunciaId: params?.denunciaId,
      vagaId: params?.vagaId,
      reservaId: params?.reservaId,
      criadoPorId: params?.criadoPorId,
      criadoPorNome: params?.criadoPorNome,
      criadoPorTelefone: params?.criadoPorTelefone,

      listaStatus: params?.listaStatus,
      listaTipos: params?.listaTipos,

      pagina: params?.pagina ?? 0,
      tamanhoPagina: params?.tamanhoPagina ?? 10,
      ordem: params?.ordem ?? 'DESC',
    });

    const res = await clientApi(
      `/petrocarga/denuncias/all?${searchParams.toString()}`,
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();

    return {
      content: data.content ?? [],
      totalElementos: data.totalElementos ?? 0,
      totalPaginas: data.totalPaginas ?? 0,
      tamanhoPagina: data.tamanhoPagina ?? params?.tamanhoPagina ?? 10,
      pagina: data.pagina ?? params?.pagina ?? 0,
    };
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Erro ao buscar denúncias.'));
  }
}

// ----------------------
// GET DENUNCIAS POR USUARIO
// ----------------------

/**
 * @function getDenunciasByUsuario
 * @description Lista denúncias criadas por um usuário específico.
 * Acessível para agentes e motoristas (apenas suas próprias denúncias).
 *
 * @param usuarioId - ID do usuário
 * @returns Promise<Denuncia[]> - Array de denúncias do usuário
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * try {
 *   const minhasDenuncias = await getDenunciasByUsuario(user.id);
 *   console.log(`Você fez ${minhasDenuncias.length} denúncias`);
 * } catch (error) {
 *   console.error('Erro ao carregar suas denúncias:', error);
 * }
 * ```
 */
export async function getDenunciasByUsuario(
  usuarioId: string,
  params?: DenunciaParams,
): Promise<DenunciaPaginadaResponse> {
  try {
    const searchParams = buildSearchParams({
      listaStatus: params?.listaStatus,
      pagina: params?.pagina ?? 0,
      tamanhoPagina: params?.tamanhoPagina ?? 10,
      ordem: params?.ordem ?? 'DESC',
    });
    const res = await clientApi(
      `/petrocarga/denuncias/byUsuario/${usuarioId}?${searchParams}`,
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();

    return {
      content: data.content ?? [],
      totalElementos: data.totalElementos ?? 0,
      totalPaginas: data.totalPaginas ?? 0,
      tamanhoPagina: data.tamanhoPagina ?? params?.tamanhoPagina ?? 10,
      pagina: data.pagina ?? params?.pagina ?? 0,
    };
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao buscar denúncias.'));
  }
}
// ----------------------
// PATCH DENUNCIA INICIAR ANALISE
// ----------------------

/**
 * @function iniciarAnaliseDenuncia
 * @description Inicia o processo de análise de uma denúncia.
 * Altera o status da denúncia para "EM_ANALISE".
 * Acesso restrito a gestores.
 *
 * @param denunciaId - ID da denúncia
 * @returns Promise<ConfirmResult>
 *
 * @example
 * ```ts
 * const result = await iniciarAnaliseDenuncia('123');
 * if (result.success) {
 *   // Análise iniciada (toast já exibido)
 * }
 * ```
 */
export async function iniciarAnaliseDenuncia(denunciaId: string) {
  try {
    await clientApi(`/petrocarga/denuncias/iniciarAnalise/${denunciaId}`, {
      method: 'PATCH',
    });
    toast.success('Análise Iniciada Com Sucesso!');
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao Iniciar Denúncia Reserva.';
    toast.error(message);
    return { success: false, message };
  }
}

// ----------------------
// PATCH DENUNCIA FINALIZAR ANALISE
// ----------------------

/**
 * @function finalizarAnaliseDenuncia
 * @description Finaliza a análise de uma denúncia com um parecer.
 * Acesso restrito a gestores.
 *
 * @param denunciaId - ID da denúncia
 * @param body - Objeto com status e resposta
 * @param body.status - Parecer final: 'PROCEDENTE' ou 'IMPROCEDENTE'
 * @param body.resposta - Texto explicativo da decisão
 *
 * @returns Promise<ConfirmResult>
 *
 * @example
 * ```ts
 * const result = await finalizarAnaliseDenuncia('123', {
 *   status: 'PROCEDENTE',
 *   resposta: 'Confirmado que a vaga estava ocupada irregularmente'
 * });
 *
 * if (result.success) {
 *   // Análise finalizada (toast já exibido)
 * }
 * ```
 */
export async function finalizarAnaliseDenuncia(
  denunciaId: string,
  body: {
    status: 'PROCEDENTE' | 'IMPROCEDENTE';
    resposta: string;
  },
) {
  try {
    await clientApi(`/petrocarga/denuncias/finalizarAnalise/${denunciaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    toast.success('Análise Finalizada com sucesso!');
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao finalizar análise da denúncia.';

    toast.error(message);
    return { success: false, message };
  }
}
