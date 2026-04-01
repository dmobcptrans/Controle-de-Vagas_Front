'use client';

import toast from 'react-hot-toast';
import { clientApi } from '../clientApi';
import { ConfirmResult } from '../types/confirmResult';
import { ReservaRapida } from '@/lib/types/reservaRapida';
import { ReservaPlaca } from '@/lib/types/reservaPlaca';
import { ReservaGet } from '@/lib/types/reserva';

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
export async function reservarVaga(formData: FormData): Promise<ConfirmResult> {
  const body = {
    vagaId: formData.get('vagaId'),
    motoristaId: formData.get('motoristaId'),
    veiculoId: formData.get('veiculoId'),
    cidadeOrigem: formData.get('cidadeOrigem'),
    entradaCidade: formData.get('entradaCidade'),
    inicio: formData.get('inicio'),
    fim: formData.get('fim'),
    status: 'ATIVA',
  };

  try {
    await clientApi('/petrocarga/reservas', {
      method: 'POST',
      json: body,
    });
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao reservar vaga.';
    return { success: false, message };
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
    const res = await clientApi(
      `/petrocarga/reservas/${reservaID}/finalizar-forcado`,
      {
        method: 'POST',
      },
    );
    return res.json();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao finalizar reserva forçada.';
    throw new Error(message);
  }
}

// ----------------------
// GET RESERVAS POR USUARIO
// ----------------------

/**
 * @interface PaginatedReservaResponse
 * @description Resposta paginada da API de reservas
 */
export interface PaginatedReservaResponse {
  content: ReservaGet[];
  totalElementos: number;
  totalPaginas: number;
  tamanhoPagina: number;
  pagina: number;
}

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
): Promise<PaginatedReservaResponse> {
  try {
    const res = await clientApi(
      `/petrocarga/reservas/usuario/${usuarioId}?numeroPagina=${numeroPagina}&tamanhoPagina=${tamanhoPagina}`,
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();

    // Retorna o objeto paginado conforme a estrutura do back-end
    return {
      content: data.content || [],
      totalElementos: data.totalElementos || 0,
      totalPaginas: data.totalPaginas || 0,
      tamanhoPagina: data.tamanhoPagina || tamanhoPagina,
      pagina: data.pagina || numeroPagina,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao buscar reservas do usuário.';
    throw new Error(message);
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
export async function getReservas() {
  try {
    const res = await clientApi('/petrocarga/reservas/all');
    return res.json();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao buscar reservas.';
    throw new Error(message);
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
  tipoVeiculo:
    | 'AUTOMOVEL'
    | 'VUC'
    | 'CAMINHONETA'
    | 'CAMINHAO_MEDIO'
    | 'CAMINHAO_LONGO',
) {
  const queryParams = new URLSearchParams({ data, tipoVeiculo }).toString();

  try {
    const res = await clientApi(
      `/petrocarga/reservas/bloqueios/${vagaId}?${queryParams}`,
    );
    return res.json();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao buscar bloqueios.';
    throw new Error(message);
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
export async function deleteReservaByID(reservaId: string, usuarioId: string) {
  try {
    await clientApi(`/petrocarga/reservas/${reservaId}/${usuarioId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao deletar reserva.';
    return { error: true, message };
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
export async function getGerarComprovanteReserva(reservaID: string) {
  try {
    const res = await clientApi(
      `/petrocarga/documentos/reservas/${reservaID}/comprovante`,
    );

    if (!res.ok) {
      throw new Error('Erro ao gerar comprovante da reserva.');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante-${reservaID}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao gerar comprovante da reserva.';
    throw new Error(message);
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
  body: {
    veiculoId: string;
    cidadeOrigem: string;
    inicio: string;
    fim: string;
    status: string;
  },
  reservaID: string,
  usuarioId: string,
) {
  console.log('📤 Enviando JSON para API Java:', body);

  const res = await clientApi(
    `/petrocarga/reservas/${reservaID}/${usuarioId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const errorBody = await res.json();

    console.error('❌ Erro do Backend:', errorBody);

    return {
      success: false,
      message: errorBody.erro ?? 'Erro ao reservar vaga',
      status: res.status,
    };
  }

  const data = await res.json();

  return {
    success: true,
    data,
  };
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
export async function checkinReserva(reservaID: string) {
  try {
    const res = await clientApi(`/petrocarga/reservas/${reservaID}/checkin`, {
      method: 'POST',
    });
    toast.success('Checkin Realizado Com Sucesso!');
    return res.json();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao fazer checkin.';
    toast.error(message);
    throw new Error(message);
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
export async function checkoutReserva(reservaID: string) {
  try {
    await clientApi(`/petrocarga/reservas/checkout/${reservaID}`, {
      method: 'PATCH',
    });

    toast.success('Checkout Realizado Com Sucesso!');
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao finalizar reserva.';
    toast.error(message);
    return { success: false, message };
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
 * @interface PaginatedResponse
 * @description Resposta paginada da API de reservas rápidas
 */
export interface PaginatedReservaRapidaResponse {
  content: ReservaRapida[];
  totalElements: number;
  totalPaginas: number;
  tamanhoPagina: number;
  pagina: number;
}

/**
 * @function getReservasRapidas
 * @description Lista reservas rápidas criadas por um agente com paginação.
 *
 * @param usuarioId - ID do agente
 * @param numeroPagina - Número da página (0-indexed, padrão: 0)
 * @param tamanhoPagina - Quantidade de itens por página (padrão: 10)
 * @returns Promise<PaginatedReservaRapidaResponse> - Objeto paginado com reservas e metadados
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * // Busca primeira página com 10 reservas
 * const primeiraPagina = await getReservasRapidas('agente123', 0, 10);
 * console.log(primeiraPagina.content); // array de reservas
 * console.log(primeiraPagina.totalElements); // total de reservas
 * console.log(primeiraPagina.totalPaginas); // total de páginas
 * ```
 */
export async function getReservasRapidas(
  usuarioId: string,
  numeroPagina: number = 0,
  tamanhoPagina: number = 10,
): Promise<PaginatedReservaRapidaResponse> {
  try {
    const res = await clientApi(
      `/petrocarga/reserva-rapida/${usuarioId}?numeroPagina=${numeroPagina}&tamanhoPagina=${tamanhoPagina}`,
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();

    // Retorna o objeto paginado conforme a estrutura do back-end
    return {
      content: data.content || [],
      totalElements: data.totalElementos || 0,
      totalPaginas: data.totalPaginas || 0,
      tamanhoPagina: data.tamanhoPagina || tamanhoPagina,
      pagina: data.pagina || numeroPagina,
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
