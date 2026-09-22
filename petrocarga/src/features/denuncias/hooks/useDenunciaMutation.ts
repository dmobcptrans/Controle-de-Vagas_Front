'use client';

import { useApi } from "@/services/hooks/useApi";

import { CriarDenuncia, finalizarAnaliseDenuncia, iniciarAnaliseDenuncia } from "../services/denunciaApi";

import { DenunciaPayload, RespostaDenunciaPayload, DenunciaResponse  } from "../types/denuncia2";

interface UseDenunciaMutationReturn {
    loading: boolean;
    error: string | null;

    criar: (
        payload: DenunciaPayload
    ) => Promise<DenunciaResponse | null>;

    iniciarAnalise: (
        denunciaId: string
    ) => Promise<void>

    finalizarAnalise: (
        denunciaId: string,
        payload: RespostaDenunciaPayload
    ) => Promise<DenunciaResponse | null>;

    limparError: () => void;
}

export function useDenunciaMutation(): UseDenunciaMutationReturn {
    const {loading, error, execute, limparError} = useApi();

    const criar = async (payload: DenunciaPayload) => {
        return execute(() => CriarDenuncia(payload));
    };

    const iniciarAnalise = async (denunciaId: string) => {
         execute(() => iniciarAnaliseDenuncia(denunciaId))
    }

    const finalizarAnalise = async (denunciaId: string, payload: RespostaDenunciaPayload) => {
        return execute(() => finalizarAnaliseDenuncia(denunciaId, payload));
    }

    return {
        loading,
        error,
        criar,
        iniciarAnalise,
        finalizarAnalise,
        limparError
    }
}