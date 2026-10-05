'use client';

import { useApi } from '@/services/hooks/useApi';

import {
  CriarMotorista,
  AtualizarMotorista,
  DeleteMotorista,
} from '../services/motoristaApi2';

import {
  MotoristaPayload1,
  MotoristaResponse1,
  AtualizarMotoristaPayload,
} from './../types/motorista2';


interface UseMotoristaReturn {
    loading: boolean;
    error: string | null;

    criar: (
        payload: MotoristaPayload1
    ) => Promise<MotoristaResponse1 | null>

    atualizar: (
        motoristaId: string,
        payload: AtualizarMotoristaPayload
    ) => Promise<MotoristaResponse1 | null>

    deletar: (
        motoristaId: string
    ) => Promise<boolean>;

    limparError: () => void;
}

export function useMotoristaMutation(): UseMotoristaReturn {
    const { loading, error, execute, limparError } = useApi();

    const criar = async (payload: MotoristaPayload1) => {
        const response = execute(() => CriarMotorista(payload))

        return response;
    };

    const atualizar = async (motoristaId: string, payload: AtualizarMotoristaPayload) => {
        const response = execute(() => AtualizarMotorista(motoristaId, payload))

        return response;
    }

    const deletar = async (motoristaId: string) => {
        const response = execute(() => DeleteMotorista(motoristaId))
        return response !== null;
    }

 return {
    loading,
    error,
    criar,
    atualizar,
    deletar,
    limparError,
  };
}