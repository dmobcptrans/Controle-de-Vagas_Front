'use client';

import { useCallback, useEffect, useState } from 'react';

import { getMotoristaEmpresaByUsuarioId } from '../../empresas/services/empresaApi';
import {
  getMotoristaByUserId,
  getMotoristas,
} from '@/features/usuarios/(personas)/motoristas/services/motoristaApi';

import {
  Motorista,
  MotoristaEmpresa,
  MotoristaResponse,
} from '@/features/usuarios/(personas)/motoristas/types/motorista';

export function MotoristaDaEmpresa(usuarioId?: string) {
  const [motoristas, setMotoristas] = useState<MotoristaEmpresa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMotoristas = useCallback(async () => {
    if (!usuarioId) {
      setMotoristas([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response =
        await getMotoristaEmpresaByUsuarioId(usuarioId);

      const motoristasData = Array.isArray(response)
        ? response
        : response?.content ?? [];

      setMotoristas(motoristasData);
    } catch (error) {
      console.error(
        'Erro ao carregar motoristas da empresa:',
        error,
      );

      setMotoristas([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    fetchMotoristas();
  }, [fetchMotoristas]);

  return {
    motoristas,
    loading,
    refetch: fetchMotoristas,
  };
}

export function MotoristaPorId(userId?: string) {
  const [motorista, setMotorista] =
    useState<MotoristaResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchMotorista = useCallback(async () => {
    if (!userId) {
      setMotorista(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getMotoristaByUserId(userId);

      if (!response.error) {
        setMotorista(response.motorista);
      } else {
        setMotorista(null);
      }
    } catch (error) {
      console.error(
        'Erro ao carregar motorista:',
        error,
      );

      setMotorista(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMotorista();
  }, [fetchMotorista]);

  return {
    motorista,
    loading,
    refetch: fetchMotorista,
  };
}

export function Motoristas(
  params?: Parameters<typeof getMotoristas>[0],
) {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMotoristas = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getMotoristas(params);

      if (!response.error) {
        setMotoristas(response.motoristas.content);
      } else {
        setMotoristas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setMotoristas([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchMotoristas();
  }, [fetchMotoristas]);

  return {
    motoristas,
    loading,
    refetch: fetchMotoristas,
  };
}