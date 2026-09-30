'use client';

import { useApi } from '@/services/hooks/useApi';

import { CriarEmpresa, AtualizarEmpresa } from '../services/empresaApi2';

import { EmpresaPayload, AtualizarEmpresaPayload, EmpresaResponse } from '../types/empresa2';

interface UseEmpresaMutationReturn {
  loading: boolean;
  error: string | null;

  criar: (
    payload: EmpresaPayload,
  ) => Promise<EmpresaResponse | null>;

  atualizar: (
    empresaId: string,
    payload: AtualizarEmpresaPayload,
  ) => Promise<boolean>;

  limparError: () => void;
}

export function useEmpresaMutation(): UseEmpresaMutationReturn {
  const { loading, error, execute, limparError } = useApi();

  const criar = async (payload: EmpresaPayload) => {
    return execute(() => CriarEmpresa(payload));
  };

  const atualizar = async (
    empresaId: string,
    payload: AtualizarEmpresaPayload,
  ) => {
    const response = await execute(() =>
      AtualizarEmpresa(empresaId, payload),
    );

    return response !== null;
  };

  return {
    loading,
    error,
    criar,
    atualizar,
    limparError,
  };
}
