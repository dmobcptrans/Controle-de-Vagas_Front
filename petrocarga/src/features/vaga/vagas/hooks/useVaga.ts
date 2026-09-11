'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import type {
  Vaga,
  VagaPayload,
  FiltrosVaga,
  VagasPaginadas,
} from '../types/vaga';

import {
  addVaga,
  atualizarVaga,
  deleteVaga,
  getVagaById,
  getVagas,
  getVagasFiltradas,
  getVagasComFiltros,
  getVagasPorMapa,
} from '../service/vagaApi';

type UseVagaApiParams = {
  filtros?: FiltrosVaga;
  numeroPagina?: number;
  tamanhoPagina?: number;
  ordenarPor?: string;
  logradouro?: string;
  autoFetch?: boolean;
};

const paginacaoInicial: Omit<VagasPaginadas, 'vagas'> = {
  paginaAtual: 0,
  totalPaginas: 0,
  totalElementos: 0,
};

export function useVagaApi(params?: UseVagaApiParams) {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [vaga, setVaga] = useState<Vaga | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingVaga, setLoadingVaga] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [paginacao, setPaginacao] =
    useState<Omit<VagasPaginadas, 'vagas'>>(paginacaoInicial);

  // ---------------------------------------------------------------------------
  // GET VAGAS PAGINADAS
  // ---------------------------------------------------------------------------

  const buscarVagas = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getVagasFiltradas({
        ...params?.filtros,
        numeroPagina: params?.numeroPagina,
        tamanhoPagina: params?.tamanhoPagina,
        ordenarPor: params?.ordenarPor,
        logradouro: params?.logradouro,
      });

      setVagas(response.vagas);

      setPaginacao({
        paginaAtual: response.paginaAtual,
        totalPaginas: response.totalPaginas,
        totalElementos: response.totalElementos,
      });

      return response;
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);

      toast.error('Não foi possível carregar as vagas.');

      setVagas([]);
      setPaginacao(paginacaoInicial);

      return {
        vagas: [],
        ...paginacaoInicial,
      };
    } finally {
      setLoading(false);
    }
  }, [
    params?.filtros,
    params?.numeroPagina,
    params?.tamanhoPagina,
    params?.ordenarPor,
    params?.logradouro,
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

  const buscarTodasVagas = useCallback(async (status?: string) => {
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
  // GET VAGAS COM FILTROS
  // ---------------------------------------------------------------------------

  const buscarVagasComFiltros = useCallback(
    async (filtros?: FiltrosVaga) => {
      setLoading(true);

      try {
        const response = await getVagasComFiltros(filtros);

        if (response.error) {
          toast.error(
            response.message ?? 'Não foi possível carregar as vagas.',
          );

          setVagas([]);

          return response;
        }

        setVagas(response.vagas ?? []);

        return response;
      } catch (error) {
        console.error('Erro ao buscar vagas com filtros:', error);

        toast.error('Não foi possível carregar as vagas.');

        setVagas([]);

        return {
          error: true,
          message: 'Erro ao buscar vagas.',
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // GET VAGAS POR MAPA
  // ---------------------------------------------------------------------------

  const buscarVagasPorMapa = useCallback(
    async (paramsMapa: {
      north: number;
      south: number;
      east: number;
      west: number;
      status?: string;
    }) => {
      try {
        return await getVagasPorMapa(paramsMapa);
      } catch (error) {
        console.error('Erro ao buscar vagas por mapa:', error);

        toast.error('Não foi possível carregar as vagas do mapa.');

        return [];
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
      const response = await addVaga(formData);

      if (response.error) {
        toast.error(response.message ?? 'Não foi possível cadastrar a vaga.');

        return response;
      }

      toast.success(response.message ?? 'Vaga cadastrada com sucesso!');

      return response;
    } catch (error) {
      console.error('Erro ao criar vaga:', error);

      toast.error('Não foi possível cadastrar a vaga.');

      return {
        error: true,
        message: 'Erro ao cadastrar vaga.',
      };
    } finally {
      setSaving(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // PATCH VAGA
  // ---------------------------------------------------------------------------

  const editarVaga = useCallback(async (formData: FormData) => {
    setSaving(true);

    try {
      const response = await atualizarVaga(formData);

      if (response.error) {
        toast.error(response.message ?? 'Não foi possível atualizar a vaga.');

        return response;
      }

      toast.success(response.message ?? 'Vaga atualizada com sucesso!');

      return response;
    } catch (error) {
      console.error('Erro ao editar vaga:', error);

      toast.error('Não foi possível atualizar a vaga.');

      return {
        error: true,
        message: 'Erro ao atualizar vaga.',
      };
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
      const response = await deleteVaga(id);

      if (response.error) {
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

      return {
        error: true,
        message: 'Erro ao deletar vaga.',
      };
    } finally {
      setDeleting(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // REFRESH
  // ---------------------------------------------------------------------------

  const refetch = useCallback(async () => {
    return buscarVagas();
  }, [buscarVagas]);

  // ---------------------------------------------------------------------------
  // FETCH AUTOMÁTICO
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (params?.autoFetch === false) {
      return;
    }

    buscarVagas();
  }, [buscarVagas, params?.autoFetch]);

  return {
    // Estado
    vagas,
    vaga,
    loading,
    loadingVaga,
    saving,
    deleting,
    paginacao,

    // GET
    buscarVagas,
    buscarVagaPorId,
    buscarTodasVagas,
    buscarVagasComFiltros,
    buscarVagasPorMapa,

    // CRUD
    criarVaga,
    editarVaga,
    removerVaga,

    // Utilitários
    refetch,
    setVaga,
  };
}