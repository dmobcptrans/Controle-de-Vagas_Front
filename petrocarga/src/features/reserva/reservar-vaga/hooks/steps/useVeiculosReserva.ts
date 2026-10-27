import { useMemo, useState } from 'react';

import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';

import { useVeiculosAssociadosAoMotorista } from '@/features/usuarios/veiculoMotoristaEmpresa/hooks/useVeiculosAssociadosAoMotorista';

import type { Persona } from '../reservaPayload';

export const VEHICLE_PAGE_SIZE = 5;

/**
 * Unifica a origem dos veículos:
 * - MOTORISTA -> veículos do próprio usuário
 * - EMPRESA   -> veículos vinculados ao motorista selecionado
 * - AGENTE    -> não utiliza veículos cadastrados
 */
export function useVeiculosReserva(
  persona: Persona,
  userId?: string,
  motoristaId?: string,
) {
  const [page, setPage] = useState(0);

  const params = useMemo(
    () => ({
      ativo: true,
      pagina: page,
      tamanhoPagina: VEHICLE_PAGE_SIZE,
    }),
    [page],
  );

  // Veículos do próprio motorista.
  const proprio = useVeiculos({
    usuarioId: persona === 'MOTORISTA' ? userId : undefined,
    params,
    buscarAutomaticamente: persona === 'MOTORISTA',
  });

  // Veículos associados ao motorista selecionado pela empresa.
  const vinculados = useVeiculosAssociadosAoMotorista({
    empresaId: persona === 'EMPRESA' ? userId : undefined,
    motoristaId: persona === 'EMPRESA' ? motoristaId : undefined,
    params,
    buscarAutomaticamente: persona === 'EMPRESA',
  });

  const fonte = persona === 'EMPRESA' ? vinculados : proprio;

  return {
    vehicles: persona === 'AGENTE' ? [] : (fonte.veiculos ?? []),

    vehiclesLoading: persona === 'AGENTE' ? false : fonte.loading,

    vehicleTotalPages: fonte.totalPaginas ?? 0,

    vehiclePage: page,

    vehiclePageSize: VEHICLE_PAGE_SIZE,

    setVehiclePage: setPage,
  };
}
