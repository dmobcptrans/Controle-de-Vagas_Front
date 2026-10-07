import { VeiculoResponse } from './../../../veiculos/types/veiculo';
import { MotoristaEmpresResponse, MotoristaResponse1 } from "../../(personas)/motoristas/types/motorista"
import { EmpresaMotoristaVeiculoResponse } from "../../(personas)/empresas/types/empresa2"
import { Paginacao } from '@/lib/types/paginacao';
import { TipoVeiculo } from '@/features/veiculos/types/tipoVeiculo';
import { Ordem } from '@/features/denuncias/types/denuncia';

export type VeiculosAssociadosAoMotoristaParams = {
    empresaId?: string;
    motoristaId?: string;
    veiculoId?: string;
    placa?: string;
    marca?: string;
    modelo?: string;
    tipoVeiculo?: TipoVeiculo;
    ativo?: boolean;
    pagina?: number;
    tamanhoPagina?: number;
    ordem?: Ordem
}

export type MotoristasVinculadosAoVeiculo = {
    empresaId?: string;
    veiculoId?: string;
    motoristaId?: string;
    motoristaNome?: string;
    motoristaCpf?: string;
    motoristaTelefone?: string;
    motoristaEmail?: string;
    motoristaAtivo?: boolean;
    pagina?: number;
    tamanhoPagina?: number;
    ordem?: Ordem
}

export type MotoristaAoVeiculoPayload = {
    empresaId: string,
    veiculoId: string,
    motoristaId: string
}

export type VincularMotoristaAoVeiculoResponse = {
    veiculo: VeiculoResponse
    motorista: MotoristaResponse1
    empresa: EmpresaMotoristaVeiculoResponse
}

export type VeiculosAssociadosAoMotoristaPaginadoResponse = Paginacao<VeiculoResponse>

export type MotoristasAssociadosAoVeiculoPaginadoResponse = Paginacao<MotoristaEmpresResponse>