'use client';

import { useCallback, useState } from 'react';
import {
  criarVeiculo,
  deleteVeiculo,
  atualizarVeiculo,
  getVeiculosPorUsuario,
  getVeiculoPorId,
} from '../services/veiculoApi';
import {
  VeiculoResponse,
  VeiculoPaginadoResponse,
  VeiculoPayload,
  VeiculoParams,
} from '@/features/veiculos/types/veiculo2';

/**
 * @hook useAsyncState
 * @description Hook genérico que padroniza o gerenciamento de estado
 * para qualquer chamada assíncrona (loading, error, data).
 * Serve de base para os demais hooks de domínio (veículos, motoristas, etc).
 */
function useAsyncState<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Executa uma função assíncrona já tratando loading/erro de forma padronizada.
   * Retorna o resultado em caso de sucesso, ou `null` em caso de erro.
   */
  const run = useCallback(
    async <R,>(
      fn: () => Promise<R>,
      options?: {
        onSuccess?: (result: R) => void;
        onError?: (message: string) => void;
      },
    ): Promise<R | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn();
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro inesperado.';
        setError(message);
        options?.onError?.(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { data, setData, loading, error, setError, run };
}

/**
 * @hook useVeiculos
 * @description Hook padronizado para uso em componentes que precisam
 * listar, buscar, criar, atualizar ou remover veículos.
 *
 * Centraliza loading/erro e evita repetir try/catch em cada componente.
 *
 * @example
 * ```tsx
 * const {
 *   veiculos,
 *   loading,
 *   error,
 *   listar,
 *   criar,
 *   atualizar,
 *   remover,
 *   buscarPorId,
 * } = useVeiculos();
 *
 * useEffect(() => {
 *   listar(usuarioId);
 * }, [usuarioId]);
 * ```
 */
export function useVeiculos() {
  const listagem = useAsyncState<VeiculoPaginadoResponse | null>(null);
  const detalhe = useAsyncState<VeiculoResponse | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  /**
   * Lista veículos de um usuário, com filtros opcionais.
   */
  const listar = useCallback(
    (usuarioId: string, filtros?: VeiculoParams) => {
      return listagem.run(() => getVeiculosPorUsuario(usuarioId, filtros), {
        onSuccess: (result) => listagem.setData(result),
      });
    },
    [listagem],
  );

  /**
   * Busca um veículo específico por ID.
   */
  const buscarPorId = useCallback(
    (veiculoId: string) => {
      return detalhe.run(() => getVeiculoPorId(veiculoId), {
        onSuccess: (result) => detalhe.setData(result),
      });
    },
    [detalhe],
  );

  /**
   * Cria um novo veículo. Retorna o veículo criado ou `null` em caso de erro.
   */
  const criar = useCallback(
    async (formData: FormData, usuarioId: string): Promise<VeiculoResponse | null> => {
      setSalvando(true);
      try {
        const result = await criarVeiculo(formData, usuarioId);
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao cadastrar veículo.';
        throw new Error(message);
      } finally {
        setSalvando(false);
      }
    },
    [],
  );

  /**
   * Atualiza um veículo existente.
   */
  const atualizar = useCallback(
    async (body: VeiculoPayload, veiculoId: string, usuarioId: string) => {
      setSalvando(true);
      try {
        return await atualizarVeiculo(body, veiculoId, usuarioId);
      } finally {
        setSalvando(false);
      }
    },
    [],
  );

  /**
   * Remove um veículo pelo ID.
   */
  const remover = useCallback(async (veiculoId: string) => {
    setRemovendo(true);
    try {
      return await deleteVeiculo(veiculoId);
    } finally {
      setRemovendo(false);
    }
  }, []);

  return {
    // listagem
    veiculos: listagem.data,
    loadingLista: listagem.loading,
    erroLista: listagem.error,
    listar,

    // detalhe
    veiculo: detalhe.data,
    loadingDetalhe: detalhe.loading,
    erroDetalhe: detalhe.error,
    buscarPorId,

    // mutações
    salvando,
    removendo,
    criar,
    atualizar,
    remover,
  };
}