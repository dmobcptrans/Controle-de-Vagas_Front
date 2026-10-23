import { useEffect, useMemo, useState } from 'react';
import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';
import { useVeiculosAssociadosAoMotorista } from '@/features/usuarios/veiculoMotoristaEmpresa/hooks/useVeiculosAssociadosAoMotorista';
import type { Persona } from '../reservaPayload';

export const VEHICLE_PAGE_SIZE = 5;

/**
 * Unifica a origem dos veículos:
 *  - MOTORISTA -> veículos do próprio usuário
 *  - EMPRESA   -> veículos vinculados ao motorista selecionado
 *  - AGENTE    -> não usa (informa tipo/placa manualmente)
 */
export function useVeiculosReserva(persona: Persona, userId?: string, motoristaId?: string) {
  const [page, setPage] = useState(0);

  const params = useMemo(
    () => ({ ativo: true, pagina: page, tamanhoPagina: VEHICLE_PAGE_SIZE }),
    [page],
  );

  const proprio = useVeiculos({
    usuarioId: persona === 'MOTORISTA' ? userId : undefined,
    params,
    buscarAutomaticamente: persona === 'MOTORISTA',
  });

  const vinculados = useVeiculosAssociadosAoMotorista();
  const { buscar } = vinculados;

  useEffect(() => {
    if (persona !== 'EMPRESA' || !userId || !motoristaId) return;
    buscar({ empresaId: userId, motoristaId, ...params });
  }, [persona, userId, motoristaId, params, buscar]);

  const fonte = persona === 'EMPRESA' ? vinculados : proprio;

  return {
    vehicles: persona === 'AGENTE' ? [] : fonte.veiculos ?? [],
    vehiclesLoading: persona === 'AGENTE' ? false : fonte.loading,
    vehicleTotalPages: fonte.totalPaginas ?? 0,
    vehiclePage: page,
    vehiclePageSize: VEHICLE_PAGE_SIZE,
    setVehiclePage: setPage,
  };
}