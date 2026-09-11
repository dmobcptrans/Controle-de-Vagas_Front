'use client';

import toast from 'react-hot-toast';
import { clientApi } from '@/services/clientApi';

import { ConfirmResult } from '@/lib/types/confirmResult';
import { PaginatedReservaRapidaResponse } from '@/features/reserva/reservar-vaga/types/reservaRapida';
import { ReservaPlaca } from '../../reservar-vaga/types/reservaPlaca';
import {
  AtualizarReservaPayload,
  CriarReservaPayload,
  ReservaBloqueiosResponse,
  ReservaPaginadaDeUmUsuario,
  ReservaResponse,
} from '../types/reservas';
import { getApiErrorMessage } from '@/lib/types/response/getApiErrorMessage';
import { TipoVeiculo } from '@/features/veiculos/types/tipoVeiculo';

/**
 * @module reservaApi
 * @description Módulo de API para gerenciamento de reservas de vagas.
 * Fornece funções para criar, consultar, atualizar e gerenciar reservas,
 * incluindo reservas normais (motoristas) e reservas rápidas (agentes).
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Reservas de Motoristas
 *    - reservarVaga - Cria nova reserva para motorista
 *    - getReservasPorUsuario - Lista reservas de um usuário
 *    - getReservas - Lista todas as reservas (gestor)
 *    - getReservasBloqueios - Verifica bloqueios de horário
 *    - atualizarReserva - Atualiza dados de uma reserva
 *    - deleteReservaByID - Cancela/exclui reserva
 *
 * 2. Check-in/Check-out
 *    - checkinReserva - Realiza check-in da reserva
 *    - checkoutReserva - Realiza check-out da reserva
 *    - finalizarForcado - Finaliza reserva à força (gestor)
 *
 * 3. Documentos
 *    - getGerarComprovanteReserva - Gera PDF comprovante
 *
 * 4. Reservas Rápidas (Agentes)
 *    - reservarVagaAgente - Cria reserva rápida
 *    - getReservasRapidas - Lista reservas do agente
 *
 * 5. Consulta por Placa
 *    - getReservasPorPlaca - Busca reservas pela placa
 */

// =================================================================
// RESERVAS DE MOTORISTAS
// =================================================================

// ----------------------
// POST RESERVA MOTORISTA
// ----------------------

/**
 * @function reservarVaga
 * @description Cria uma nova reserva para um motorista.
 *
 * @param formData - Formulário com dados da reserva
 * @param formData.vagaId - ID da vaga selecionada
 * @param formData.motoristaId - ID do motorista
 * @param formData.veiculoId - ID do veículo
 * @param formData.cidadeOrigem - Cidade de origem do veículo
 * @param formData.entradaCidade - Ponto de entrada na cidade
 * @param formData.inicio - Data/hora de início (formato ISO)
 * @param formData.fim - Data/hora de fim (formato ISO)
 *
 * @returns Promise<ConfirmResult>
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('vagaId', 'vaga123');
 * formData.append('motoristaId', 'motorista456');
 * formData.append('veiculoId', 'veiculo789');
 *
 * const result = await reservarVaga(formData);
 * if (result.success) {
 *   toast.success('Reserva criada!');
 * }
 * ```
 */
export async function CriarReserva(formData: FormData): Promise<ConfirmResult> {
  const body: CriarReservaPayload = {
    vagaId: formData.get('vagaId') as string,
    motoristaId: formData.get('motoristaId') as string,
    veiculoId: formData.get('veiculoId') as string,
    cidadeOrigem: formData.get('cidadeOrigem') as string,
    entradaCidade: formData.get('entradaCidade') as string,
    inicio: formData.get('inicio') as string,
    fim: formData.get('fim') as string,
    posicaoPerpendicular: Number(formData.get('posicaoPerpendicular')),
  };
  try {
    await clientApi('/petrocarga/reservas', {
      method: 'POST',
      json: body,
    });
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Erro ao reservar vaga.'),
    };
  }
}

// ----------------------
// POST RESERVA CHECKOUT-FORÇADO
// ----------------------

/**
 * @function finalizarForcado
 * @description Finaliza uma reserva à força (uso do gestor).
 *
 * @param reservaID - ID da reserva
 * @returns Promise<any>
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * try {
 *   await finalizarForcado('reserva123');
 *   toast.success('Reserva finalizada à força!');
 * } catch (error) {
 *   toast.error(error.message);
 * }
 * ```
 */
export async function finalizarForcado(reservaID: string) {
  try {
    return await clientApi(
      `/petrocarga/reservas/${reservaID}/finalizar-forcado`,
      { method: 'POST' },
    );
  } catch (err: unknown) {
    throw new Error(
      getApiErrorMessage(err, 'Erro ao finalizar reserva forçadamente'),
    );
  }
}

// ----------------------
// GET RESERVAS POR USUARIO
// ----------------------

/**
 * @function getReservasPorUsuario
 * @description Lista todas as reservas de um usuário específico com paginação.
 *
 * @param usuarioId - ID do usuário
 * @param numeroPagina - Número da página (0-indexed, padrão: 0)
 * @param tamanhoPagina - Quantidade de itens por página (padrão: 10)
 * @returns Promise<PaginatedReservaResponse> - Objeto paginado com reservas e metadados
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * try {
 *   // Busca primeira página com 10 reservas
 *   const reservas = await getReservasPorUsuario('user123', 0, 10);
 *   console.log(`Total de reservas: ${reservas.totalElementos}`);
 *   console.log(`Reservas da página: ${reservas.content.length}`);
 * } catch (error) {
 *   console.error(error);
 * }
 * ```
 */
export async function getReservasPorUsuario(
  usuarioId: string,
  numeroPagina: number = 0,
  tamanhoPagina: number = 10,
): Promise<ReservaPaginadaDeUmUsuario> {
  try {
    const res = await clientApi(
      `/petrocarga/reservas/usuario/${usuarioId}?numeroPagina=${numeroPagina}&tamanhoPagina=${tamanhoPagina}`,
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw errorBody ?? new Error(`Erro HTTP ${res.status}`);
    }

    const data = await res.json();

    return data as ReservaPaginadaDeUmUsuario;
  } catch (err: unknown) {
    throw new Error(
      getApiErrorMessage(err, 'Erro ao buscar reservas do usuário.'),
    );
  }
}

// ----------------------
// GET RESERVAS
// ----------------------

/**
 * @function getReservas
 * @description Lista todas as reservas do sistema (acesso gestor).
 *
 * @returns Promise<Reserva[]> - Array com todas as reservas
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * const reservas = await getReservas();
 * console.log(`Total de reservas: ${reservas.length}`);
 * ```
 */
export type GetReservasParams = {
  data?: string;
  mes?: number;
  ano?: number;
  status?: string[];
};

export async function getReservas(
  params?: GetReservasParams,
): Promise<ReservaResponse[]> {
  try {
    let url = '/petrocarga/reservas/all';

    if (params) {
      const query = new URLSearchParams();

      if (params.data) {
        query.append('data', params.data);
      }

      if (params.mes !== undefined) {
        query.append('mes', String(params.mes));
      }

      if (params.ano !== undefined) {
        query.append('ano', String(params.ano));
      }

      if (params.status && params.status.length > 0) {
        params.status.forEach((status) => {
          query.append('status', status);
        });
      }

      const queryString = query.toString();

      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const res = await clientApi(url);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const data: ReservaResponse[] = await res.json();

    return data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao buscar reservas.'));
  }
}

// ----------------------
// GET RESERVAS BLOQUEIOS
// ----------------------

/**
 * @function getReservasBloqueios
 * @description Verifica bloqueios de horário para uma vaga.
 *
 * @param vagaId - ID da vaga
 * @param data - Data para consulta (formato YYYY-MM-DD)
 * @param tipoVeiculo - Tipo do veículo ('AUTOMOVEL' | 'VUC' | 'CAMINHONETA' | 'CAMINHAO_MEDIO' | 'CAMINHAO_LONGO')
 * @returns Promise<any> - Informações de bloqueios
 * @throws {Error} Dispara erro se a requisição falhar
 */
export async function getReservasBloqueios(
  vagaId: string,
  data: string,
  tipoVeiculo: TipoVeiculo,
): Promise<ReservaBloqueiosResponse[]> {
  const queryParams = new URLSearchParams({
    data,
    tipoVeiculo,
  }).toString();

  try {
    const res = await clientApi(
      `/petrocarga/reservas/bloqueios/${vagaId}?${queryParams}`,
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const data: ReservaBloqueiosResponse[] = await res.json();

    return data;
  } catch (err: unknown) {
    throw new Error(getApiErrorMessage(err, 'Erro ao buscar bloqueios.'));
  }
}

// ----------------------
// DELETE RESERVA POR ID
// ----------------------

/**
 * @function deleteReservaByID
 * @description Cancela/exclui uma reserva específica.
 *
 * @param reservaId - ID da reserva
 * @param usuarioId - ID do usuário (para validação)
 * @returns Promise<{ success: boolean; error?: boolean; message?: string }>
 */

export async function deleteReservaByID(
  reservaId: string,
  usuarioId: string,
): Promise<ConfirmResult> {
  try {
    await clientApi(`/petrocarga/reservas/${reservaId}/${usuarioId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    return {
      success: true,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Erro ao deletar reserva.'),
    };
  }
}

// ----------------------
// DOCUMENTO RESERVA ID PDF
// ----------------------

/**
 * @function getGerarComprovanteReserva
 * @description Gera e faz download do comprovante da reserva em PDF.
 *
 * @param reservaID - ID da reserva
 * @returns Promise<void>
 * @throws {Error} Dispara erro se não for possível gerar o comprovante
 *
 * @example
 * ```ts
 * await getGerarComprovanteReserva('reserva123');
 * // O arquivo será baixado automaticamente
 * ```
 */
export async function getGerarComprovanteReserva(
  reservaID: string,
): Promise<void> {
  try {
    const res = await clientApi(
      `/petrocarga/documentos/reservas/${reservaID}/comprovante`,
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = `comprovante-${reservaID}.pdf`;

    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    throw new Error(
      getApiErrorMessage(err, 'Erro ao gerar comprovante da reserva.'),
    );
  }
}

// ----------------------
// PATCH RESERVA
// ----------------------

/**
 * @function atualizarReserva
 * @description Atualiza dados de uma reserva existente.
 *
 * @param body - Dados atualizados da reserva
 * @param body.veiculoId - ID do veículo
 * @param body.cidadeOrigem - Cidade de origem
 * @param body.inicio - Nova data/hora de início
 * @param body.fim - Nova data/hora de fim
 * @param body.status - Novo status
 * @param reservaID - ID da reserva
 * @param usuarioId - ID do usuário
 *
 * @returns Promise<{ success: boolean; data?: any; message?: string; status?: number }>
 */
export async function atualizarReserva(
  body: AtualizarReservaPayload,
  reservaID: string,
  usuarioId: string,
): Promise<ConfirmResult> {
  try {
    await clientApi(`/petrocarga/reservas/${reservaID}/${usuarioId}`, {
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
      message: getApiErrorMessage(err, 'Erro ao atualizar reserva.'),
    };
  }
}

// ----------------------
// CHECKIN RESERVA
// ----------------------

/**
 * @function checkinReserva
 * @description Realiza check-in da reserva (início da utilização).
 *
 * @param reservaID - ID da reserva
 * @returns Promise<any>
 * @throws {Error} Dispara erro se o check-in falhar
 *
 * @example
 * ```ts
 * await checkinReserva('reserva123');
 * ```
 */
export async function checkinReserva(
  reservaID: string,
): Promise<ConfirmResult> {
  try {
    await clientApi(`/petrocarga/reservas/${reservaID}/checkin`, {
      method: 'POST',
    });

    toast.success('Check-in realizado com sucesso!');

    return {
      success: true,
    };
  } catch (err: unknown) {
    const message = getApiErrorMessage(err, 'Erro ao fazer check-in.');

    toast.error(message);

    return {
      success: false,
      message,
    };
  }
}

// ----------------------
// CHECKOUT RESERVA
// ----------------------

/**
 * @function checkoutReserva
 * @description Realiza check-out da reserva (término da utilização).
 *
 * @param reservaID - ID da reserva
 * @returns Promise<{ success: boolean; message?: string }>
 */
export async function checkoutReserva(
  reservaID: string,
): Promise<ConfirmResult> {
  try {
    const res = await clientApi(`/petrocarga/reservas/checkout/${reservaID}`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw (
        errorBody ?? {
          message: `Erro HTTP ${res.status}`,
        }
      );
    }

    toast.success('Reserva finalizada com sucesso!');

    return {
      success: true,
    };
  } catch (err: unknown) {
    const message = getApiErrorMessage(err, 'Erro ao finalizar reserva.');

    toast.error(message);

    return {
      success: false,
      message,
    };
  }
}

// =================================================================
// RESERVA RÁPIDA - AGENTE
// =================================================================

// ----------------------
// POST RESERVA AGENTE
// ----------------------

/**
 * @function reservarVagaAgente
 * @description Cria uma reserva rápida para um agente.
 *
 * @param formData - Formulário com dados da reserva rápida
 * @param formData.vagaId - ID da vaga
 * @param formData.tipoVeiculo - Tipo do veículo
 * @param formData.placa - Placa do veículo
 * @param formData.inicio - Data/hora de início
 * @param formData.fim - Data/hora de fim
 *
 * @returns Promise<ConfirmResult>
 */
export async function reservarVagaAgente(
  formData: FormData,
): Promise<ConfirmResult> {
  const body = {
    vagaId: formData.get('vagaId'),
    tipoVeiculo: formData.get('tipoVeiculo'),
    placa: formData.get('placa'),
    inicio: formData.get('inicio'),
    fim: formData.get('fim'),
    cidadeOrigem: formData.get('cidadeOrigem'),
    entradaCidade: formData.get('entradaCidade'),
  };

  try {
    await clientApi('/petrocarga/reserva-rapida', {
      method: 'POST',
      json: body,
    });
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao confirmar reserva do agente.';
    return { success: false, message };
  }
}

// ----------------------
// GET RESERVAS RÁPIDAS
// ----------------------

/**
 * @function getReservasRapidas
 * @description Lista reservas rápidas criadas por um agente com paginação e filtros.
 *
 * @param usuarioId - ID do agente
 * @param numeroPagina - Número da página (0-indexed, padrão: 0)
 * @param tamanhoPagina - Quantidade de itens por página (padrão: 10)
 * @param vagaId - ID da vaga (opcional)
 * @param placaVeiculo - Placa do veículo (opcional)
 * @param data - Data da reserva no formato YYYY-MM-DD (opcional)
 * @param listaStatus - Lista de status para filtrar (opcional)
 * @returns Promise<PaginatedReservaRapidaResponse> - Objeto paginado com reservas e metadados
 */
export async function getReservasRapidas(
  usuarioId: string,
  numeroPagina: number = 0,
  tamanhoPagina: number = 10,
  vagaId?: string,
  placaVeiculo?: string,
  data?: string,
  listaStatus?: Array<
    'RESERVADA' | 'ATIVA' | 'CONCLUIDA' | 'REMOVIDA' | 'CANCELADA'
  >,
): Promise<PaginatedReservaRapidaResponse> {
  try {
    const urlParams = new URLSearchParams();

    urlParams.append('numeroPagina', String(numeroPagina));
    urlParams.append('tamanhoPagina', String(tamanhoPagina));

    if (vagaId) urlParams.append('vagal', vagaId);
    if (placaVeiculo) urlParams.append('placaVeiculo', placaVeiculo);
    if (data) urlParams.append('data', data);
    if (listaStatus && listaStatus.length > 0) {
      listaStatus.forEach((status) => urlParams.append('listaStatus', status));
    }

    const queryString = urlParams.toString();
    const url = `/petrocarga/reserva-rapida/${usuarioId}${queryString ? `?${queryString}` : ''}`;

    const res = await clientApi(url);

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const dataResponse = await res.json();

    return {
      content: dataResponse.content || [],
      totalElements: dataResponse.totalElementos || 0,
      totalPaginas: dataResponse.totalPaginas || 0,
      tamanhoPagina: dataResponse.tamanhoPagina || tamanhoPagina,
      pagina: dataResponse.pagina || numeroPagina,
      vagaId: dataResponse.vagaId || vagaId,
      placaVeiculo: dataResponse.placaVeiculo || placaVeiculo,
      data: dataResponse.data || data,
      listaStatus: dataResponse.listaStatus || listaStatus,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao buscar reservas do agente.';
    throw new Error(message);
  }
}

// ----------------------
// GET RESERVAS POR PLACA
// ----------------------

/**
 * @function getReservasPorPlaca
 * @description Busca reservas associadas a uma placa de veículo.
 *
 * @param placa - Placa do veículo (será convertida para maiúsculas)
 * @returns Promise<ReservaPlaca[]> - Array de reservas encontradas
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * const reservas = await getReservasPorPlaca('ABC1234');
 * console.log(`Placa ${placa} tem ${reservas.length} reservas`);
 * ```
 */
export async function getReservasPorPlaca(
  placa: string,
): Promise<ReservaPlaca[]> {
  try {
    const res = await clientApi(
      `/petrocarga/reservas/placa?placa=${placa.trim().toUpperCase()}`,
      { method: 'GET' },
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao buscar reservas por placa.';
    throw new Error(message);
  }
}
