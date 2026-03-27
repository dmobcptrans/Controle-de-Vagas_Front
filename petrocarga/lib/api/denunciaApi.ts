'use client';

import toast from 'react-hot-toast';
import { clientApi } from '../clientApi';
import { ConfirmResult } from '../types/confirmResult';

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

type StatusDenuncia = 
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'PROCEDENTE'
  | 'IMPROCEDENTE';

export async function Denunciar(formData: FormData): Promise<ConfirmResult> {
  const body = {
    descricao: formData.get('descricao'),
    reservaId: formData.get('reservaId'),
    tipo: formData.get('tipo'),
  };

  try {
    await clientApi('/petrocarga/denuncias', {
      method: 'POST',
      json: body,
    });
    toast.success('Denuncia Enviada Com Sucesso!');
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao Denunciar Reserva.';
    toast.error(message);
    return { success: false, message };
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
export async function getDenuncias(status?: StatusDenuncia) {
  try {
    // monta a URL dinamicamente
    const url = status
      ? `/petrocarga/denuncias/all?listaStatus=${status}`
      : '/petrocarga/denuncias/all';

    const res = await clientApi(url);
    return res.json();
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao buscar denúncias.';
    throw new Error(message);
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
export async function getDenunciasByUsuario(usuarioId: string) {
  try {
    const res = await clientApi(`/petrocarga/denuncias/byUsuario/${usuarioId}`);
    return res.json();
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao buscar as denuncias por usuario.';
    throw new Error(message);
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
