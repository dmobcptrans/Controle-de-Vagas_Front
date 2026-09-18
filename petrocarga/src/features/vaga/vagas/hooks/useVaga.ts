'use client'

import { useCallback, useEffect, useState } from "react";
import { VagaResponse } from "../types/vaga2";
import { useApi } from "@/services/hooks/useApi";
import { getVagaById } from "../service/vagaApi";

interface useVagaOptions {
  vagaId: string;
  buscarAutomaticamente?: boolean;
}

interface useVagaReturn {
  vaga: VagaResponse | null;
  loading: boolean;
  error: string | null;
  buscar: () => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useVaga({
  vagaId,
  buscarAutomaticamente = true,
}: useVagaOptions): useVagaReturn {
  const [vaga, setVaga] = useState<VagaResponse | null>(null);
  const {loading, error, execute} = useApi();

  const buscar = useCallback(async () => {
    const response = await execute(() => getVagaById(vagaId));

    if (response) {
      setVaga(response)
    }
  }, [vagaId, execute])

  const recarregar = useCallback(async () => {
    await buscar();
  }, [buscar]);

  useEffect(() => {
    if (buscarAutomaticamente) {
      buscar();
    }
  }, [buscarAutomaticamente, buscar]);

  return {
    vaga,
    loading,
    error,
    buscar,
    recarregar
  }
}