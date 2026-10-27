import { clientApi } from '@/services/clientApi';
import { buildSearchParams } from '@/services/utils/buildSearchParams';
import {
  MotoristaAoVeiculoPayload,
  MotoristasAssociadosAoVeiculoPaginadoResponse,
  MotoristasVinculadosAoVeiculo,
  VeiculosAssociadosAoMotoristaPaginadoResponse,
  VeiculosAssociadosAoMotoristaParams,
  VincularMotoristaAoVeiculoResponse,
} from '../types/veiculoMotoristaEmpresa';

const URL_BASE = `/petrocarga/veiculoEmpresaMotorista`;

export async function VincularMotoristaAoVeiculo(
  params: MotoristaAoVeiculoPayload,
): Promise<VincularMotoristaAoVeiculoResponse> {
  const searchParams = buildSearchParams({
    veiculoId: params.veiculoId,
    motoristaId: params.motoristaId,
  });
  const response = await clientApi(
    `${URL_BASE}/vincular/${params.empresaId}?${searchParams.toString()}`,
    { method: 'POST' },
  );
  return response.json();
}

export async function DesvincularMotoristaAoVeiculo(
  params: MotoristaAoVeiculoPayload,
): Promise<VincularMotoristaAoVeiculoResponse> {
  const searchParams = buildSearchParams({
    veiculoId: params.veiculoId,
    motoristaId: params.motoristaId,
  });
  const response = await clientApi(
    `${URL_BASE}/desvincular/${params.empresaId}?${searchParams.toString()}`,
    { method: 'POST' },
  );
  return response.json();
}

export async function ListarVeiculosAssociadosAoMotorista(
  params: VeiculosAssociadosAoMotoristaParams,
): Promise<VeiculosAssociadosAoMotoristaPaginadoResponse> {
  const { empresaId, motoristaId, ...filtros } = params;
  const searchParams = buildSearchParams(filtros);
  const response = await clientApi(
    `${URL_BASE}/veiculos/${empresaId}/${motoristaId}?${searchParams.toString()}`,
  );
  return response.json();
}

export async function ListarMotoristasVinculadosAoVeiculo(
  params: MotoristasVinculadosAoVeiculo,
): Promise<MotoristasAssociadosAoVeiculoPaginadoResponse> {
  const { empresaId, veiculoId, ...filtros } = params;
  const searchParams = buildSearchParams(filtros);
  const response = await clientApi(
    `${URL_BASE}/motoristas/${empresaId}/${veiculoId}?${searchParams.toString()}`,
  );
  return response.json();
}