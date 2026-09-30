'use client';

import { useApi } from "@/services/hooks/useApi";

import { CriarAgente, AtualizarAgente, DeletarAgente } from "../services/agenteApi2";

import { agentePayload, atualizarAgente, agenteResponse } from "../types/agente2";

interface UseAgenteMutationReturn {
    loading: boolean;
    error: string | null;

    criar: (payload: agentePayload) => Promise<agenteResponse | null>;

    atualizar: (agenteId: string, payload: atualizarAgente) => Promise<agenteResponse | null>;

    deletar: (agenteId: string) => Promise<boolean>;

    limparError: () => void;
}

export function useAgenteMutation(): UseAgenteMutationReturn {
    const {loading, error, execute, limparError} = useApi();

    const criar = async (payload: agentePayload): Promise<agenteResponse | null> => {
        return await execute(() => CriarAgente(payload))
    }

    const atualizar = async (agenteId: string, payload: atualizarAgente): Promise<agenteResponse | null> => {
        return await execute(() => AtualizarAgente(agenteId, payload))
    }

    const deletar = async (agenteId: string): Promise<boolean> => {
        const response = await execute(() => DeletarAgente(agenteId));

        return response !== null;
    }

    return {
        loading,
        error,
        criar,
        atualizar,
        deletar,
        limparError
    }
}