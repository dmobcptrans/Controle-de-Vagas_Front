'use client';

import { DesvincularMotoristaEmpresa } from '../services/empresaApi2';
import { cancelarConviteMotoristaEmpresa } from '@/features/usuarios/conviteMotoristaEmpresa/services/conviteMotoristaApi';
import { useApi } from '@/services/hooks/useApi';

export function useMotoristaEmpresaInteraction() {
  const { loading, error, execute } = useApi();

  const desvincularMotorista = async (
    empresaId: string,
    motoristaId: string,
  ): Promise<boolean> => {
    const ok = await execute(async () => {
      await DesvincularMotoristaEmpresa(empresaId, motoristaId);
      return true;
    });
    return ok === true;
  };

  const cancelarConvite = async (
    empresaId: string,
    conviteId: string,
  ): Promise<boolean> => {
    const ok = await execute(async () => {
      await cancelarConviteMotoristaEmpresa(empresaId, conviteId);
      return true;
    });
    return ok === true;
  };

  return { loading, error, desvincularMotorista, cancelarConvite };
}