'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Denuncia } from '../types/denuncia';
import { getDenunciasByUsuario } from '../services/denunciaApi';


export function useDenuncias(usuarioId?: string) {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarDenuncias = useCallback(async () => {
    if (!usuarioId) {
      setDenuncias([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getDenunciasByUsuario(usuarioId);

      const data = Array.isArray(response)
        ? response
        : response?.content ?? [];

      setDenuncias(data);
    } catch {
      toast.error('Não foi possível carregar suas denúncias.');
      setDenuncias([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    buscarDenuncias();
  }, [buscarDenuncias]);

  return {
    denuncias,
    loading,
    refetch: buscarDenuncias,
  };
}