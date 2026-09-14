import { TipoVeiculo } from "@/features/veiculos/types/tipoVeiculo";
import { ReservaStatus } from "./reservas";
import { Paginacao } from "@/lib/types/paginacao";


// Criar Reserva Rapida

export type CriarReservaRapidaPayload = {
  vagaId: string;
  tipoVeiculo: TipoVeiculo
  placa: string;
  inicio: string;
  fim: string;
  posicaoPerpendicular?: number;
  cidadeOrigem: string;
  entradaCidade: string;
};

// Resposta Lista Reserva Rapida (Paginado)

export type ReservaRapidaResponse = {
    id: string;
    vagaId: string; 
    agenteId: string;
    logradouro: string;
    bairro: string;
    tipoVeiculo: TipoVeiculo;
    placa: string;
    inicio: string;
    fim: string;
    criadoEm: string;
    status: ReservaStatus;
    posicaoPerpendicular: number;
    cidadeOrigem: string;
}

export type ReservaRapidaPaginadaResponse = Paginacao<ReservaRapidaResponse>;
