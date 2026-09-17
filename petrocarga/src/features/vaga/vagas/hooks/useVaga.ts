'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  criarVaga as criarVagaService,
  atualizarVaga as atualizarVagaService,
  deleteVaga as deleteVagaService,
  getVagaById,
  getVagas,
  getVagasFiltradas,
  getVagasComFiltros,
  getVagasPorMapa,
} from '../service/vagaApi';

import {
  StatusVaga,
  VagaPayload,
  VagaResponse,
  VagasFiltradasParams,
  VagasMapaParams,
  VagasPaginadasResponse,
} from '../types/vaga2';

type UseVagaApiParams = VagasFiltradasParams & {
  autoFetch?: boolean;
};

// TODO: confirmar o nome do campo de itens em `Paginacao<T>`
// (aqui assumido como `vagas`, herdado do hook antigo).
type PaginacaoState = Omit<VagasPaginadasResponse, 'content'>;

const paginacaoInicial: PaginacaoState = {
  pagina: 1,
  totalPaginas: 0,
  totalElementos: 0,
  tamanhoPagina: 0,
};

export function useVagaApi(params?: UseVagaApiParams) {
  const [vagas, setVagas] = useState<VagaResponse[]>([]);
  const [vaga, setVaga] = useState<VagaResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingVaga, setLoadingVaga] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [paginacao, setPaginacao] = useState<PaginacaoState>(paginacaoInicial);

  // ---------------------------------------------------------------------------
  // GET VAGAS PAGINADAS
  // ---------------------------------------------------------------------------

  const buscarVagas = useCallback(async () => {
    setLoading(true);
    setError(null); // limpa erro anterior a cada nova busca

    try {
      const response = await getVagasFiltradas({
        status: params?.status,
        area: params?.area,
        tipoVaga: params?.tipoVaga,
        bairro: params?.bairro,
        logradouro: params?.logradouro,
        numeroPagina: params?.numeroPagina,
        tamanhoPagina: params?.tamanhoPagina,
        ordenarPor: params?.ordenarPor,
      });

      setVagas(response.content);

      setPaginacao({
        pagina: response.pagina,
        totalPaginas: response.totalPaginas,
        totalElementos: response.totalElementos,
        tamanhoPagina: response.tamanhoPagina,
      });

      return response;
    } catch (err) {
      console.error('Erro ao buscar vagas:', err);

      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast.error(message);

      setVagas([]);
      setPaginacao(paginacaoInicial);

      return null;
    } finally {
      setLoading(false);
    }
  }, [
    params?.status,
    params?.area,
    params?.tipoVaga,
    params?.bairro,
    params?.logradouro,
    params?.numeroPagina,
    params?.tamanhoPagina,
    params?.ordenarPor,
  ]);

  // ---------------------------------------------------------------------------
  // GET VAGA POR ID
  // ---------------------------------------------------------------------------

  const buscarVagaPorId = useCallback(async (id: string) => {
    setLoadingVaga(true);

    try {
      const response = await getVagaById(id);
      setVaga(response);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar vaga ${id}:`, error);
      toast.error('Não foi possível carregar a vaga.');

      setVaga(null);
      return null;
    } finally {
      setLoadingVaga(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // GET TODAS AS VAGAS
  // ---------------------------------------------------------------------------

  const buscarTodasVagas = useCallback(async (status?: StatusVaga) => {
    setLoading(true);

    try {
      const response = await getVagas(status);
      setVagas(response);
      return response;
    } catch (error) {
      console.error('Erro ao buscar todas as vagas:', error);
      toast.error('Não foi possível carregar as vagas.');

      setVagas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // GET VAGAS COM FILTROS (apenas status, conforme service atual)
  // ---------------------------------------------------------------------------

  const buscarVagasComFiltros = useCallback(async (status?: StatusVaga) => {
    setLoading(true);

    try {
      const response = await getVagasComFiltros(status);
      setVagas(response);
      return response;
    } catch (error) {
      console.error('Erro ao buscar vagas com filtros:', error);
      toast.error('Não foi possível carregar as vagas.');

      setVagas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // GET VAGAS POR MAPA
  // ---------------------------------------------------------------------------

  const buscarVagasPorMapa = useCallback(
    async (paramsMapa: VagasMapaParams) => {
      try {
        return await getVagasPorMapa(paramsMapa);
      } catch (error) {
        console.error('Erro ao buscar vagas por mapa:', error);
        toast.error('Não foi possível carregar as vagas do mapa.');
        return {
          modo: 'VAGAS' as const,
          vagas: [],
          clusters: [],
          limiteAtingido: false,
        };
      }
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // POST VAGA
  // ---------------------------------------------------------------------------

  const criarVaga = useCallback(async (formData: FormData) => {
    setSaving(true);

    try {
      const response = await criarVagaService(formData);
      toast.success('Vaga cadastrada com sucesso!');
      return response;
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      toast.error('Não foi possível cadastrar a vaga.');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // PATCH VAGA
  // ---------------------------------------------------------------------------

  const editarVaga = useCallback(async (vagaId: string, body: VagaPayload) => {
    setSaving(true);

    try {
      const response = await atualizarVagaService(body, vagaId);

      if (!response.success) {
        toast.error(response.message ?? 'Não foi possível atualizar a vaga.');
        return response;
      }

      toast.success(response.message ?? 'Vaga atualizada com sucesso!');
      return response;
    } catch (error) {
      console.error('Erro ao editar vaga:', error);
      toast.error('Não foi possível atualizar a vaga.');

      return { success: false, message: 'Erro ao atualizar vaga.' };
    } finally {
      setSaving(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // DELETE VAGA
  // ---------------------------------------------------------------------------

  const removerVaga = useCallback(async (id: string) => {
    setDeleting(true);

    try {
      const response = await deleteVagaService(id);

      if (!response.success) {
        toast.error(response.message ?? 'Não foi possível deletar a vaga.');
        return response;
      }

      toast.success(response.message ?? 'Vaga deletada com sucesso!');

      setVagas((prev) => prev.filter((item) => item.id !== id));
      setVaga((prev) => (prev?.id === id ? null : prev));

      return response;
    } catch (error) {
      console.error(`Erro ao remover vaga ${id}:`, error);
      toast.error('Não foi possível deletar a vaga.');

      return { success: false, message: 'Erro ao deletar vaga.' };
    } finally {
      setDeleting(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // REFRESH / AUTO FETCH
  // ---------------------------------------------------------------------------

  const refetch = useCallback(async () => buscarVagas(), [buscarVagas]);

  useEffect(() => {
    if (params?.autoFetch === false) return;
    buscarVagas();
  }, [buscarVagas, params?.autoFetch]);

  return {
    vagas,
    vaga,
    loading,
    loadingVaga,
    saving,
    error,
    deleting,
    paginacao,

    buscarVagas,
    buscarVagaPorId,
    buscarTodasVagas,
    buscarVagasComFiltros,
    buscarVagasPorMapa,

    criarVaga,
    editarVaga,
    removerVaga,

    refetch,
    setVaga,
  };
}
