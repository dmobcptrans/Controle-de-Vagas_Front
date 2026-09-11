'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  listarConvitesMotoristaEmpresaPorMotorista,
  responderConviteMotoristaExistenteEmpresa,
} from '../services/conviteMotoristaApi';

import { desvincularMotoristaEmpresa } from '../../(personas)/empresas/services/empresaApi';

import type {
  ConviteMotoristaEmpresaListaItem,
  ConvitesMotoristaEmpresaResponse,
} from '../types/conviteMotoristaEmpresa';

interface UseConvitesMotoristaProps {
  motoristaId?: string;
}

export function useConvitesMotorista({
  motoristaId,
}: UseConvitesMotoristaProps) {
  const [data, setData] = useState<ConvitesMotoristaEmpresaResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isOffline, setIsOffline] = useState(false);

  const [respondingId, setRespondingId] = useState<string | null>(null);

  const convites = data?.content ?? [];

  const pagina = data?.pagina ?? 0;

  const totalPaginas = data?.totalPaginas ?? 0;

  const totalElementos = data?.totalElementos ?? 0;

  const tamanhoPagina = data?.tamanhoPagina ?? 10;

  /**
   * Busca os convites recebidos pelo motorista.
   */
  const buscar = useCallback(
    async (paginaAtual = 0) => {
      if (!motoristaId) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await listarConvitesMotoristaEmpresaPorMotorista(
          motoristaId,
          {
            pagina: paginaAtual,
            tamanhoPagina: 10,
            ordem: 'DESC',
          },
        );

        setData(response);
        setIsOffline(false);
      } catch (error) {
        console.error('Erro ao carregar convites do motorista:', error);

        const message =
          'Erro ao carregar suas solicitações. Por favor, tente novamente mais tarde.';

        setError(message);
        setData(null);

        if (!navigator.onLine) {
          setIsOffline(true);
        }

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [motoristaId],
  );
 
    /**
   * Desvincular.
   */

  const desvincular = useCallback(
    async (empresaId: string, motoristaId: string) => {
      if (!empresaId || !motoristaId) {
        toast.error('Não foi possível identificar a empresa ou o motorista.');
        return false;
      }

      if (!navigator.onLine) {
        toast.error(
          'Você está offline. Não é possível realizar o desvinculamento.',
        );
        return false;
      }

      try {
        await desvincularMotoristaEmpresa(empresaId, motoristaId);

        toast.success('Motorista desvinculado com sucesso.');

        return true;
      } catch (error) {
        console.error('Erro ao desvincular motorista:', error);

        toast.error(
          error instanceof Error
            ? error.message
            : 'Erro ao desvincular o motorista.',
        );

        return false;
      }
    },
    [],
  );

  /**
   * Responde um convite.
   */
  const responder = useCallback(
    async (
      convite: ConviteMotoristaEmpresaListaItem,
      status: 'ACEITO' | 'RECUSADO',
      onSuccess?: () => Promise<void> | void,
    ) => {
      if (!motoristaId) {
        toast.error('Não foi possível identificar o motorista.');
        return false;
      }

      if (!navigator.onLine) {
        toast.error('Você está offline. Não é possível responder ao convite.');
        return false;
      }

      setRespondingId(convite.id);

      try {
        const response = await responderConviteMotoristaExistenteEmpresa(
          motoristaId,
          {
            conviteId: convite.id,
            status,
          },
        );

        if (response.error) {
          toast.error(response.message);
          return false;
        }

        toast.success(
          status === 'ACEITO'
            ? 'Convite aceito com sucesso!'
            : 'Convite recusado com sucesso!',
        );

        if (onSuccess) {
          await onSuccess();
        }

        await buscar(pagina);

        return true;
      } catch (error) {
        console.error('Erro ao responder convite:', error);

        toast.error('Erro ao responder o convite.');

        return false;
      } finally {
        setRespondingId(null);
      }
    },
    [motoristaId, buscar, pagina],
  );

  /**
   * Detecta conexão.
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      buscar(pagina);
      toast.success('Conexão restabelecida!');
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [buscar, pagina]);

  /**
   * Busca inicial.
   */
  useEffect(() => {
    buscar(0);
  }, [buscar]);

  return {
    convites,
    pagina,
    totalPaginas,
    totalElementos,
    tamanhoPagina,

    loading,
    error,
    isOffline,

    respondingId,

    buscar,
    responder,
    desvincular
  };
}
