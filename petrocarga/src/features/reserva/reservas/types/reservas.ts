import { MotoristaResponse } from '@/features/usuarios/(personas)/motoristas/types/motorista2';
import { AreaVaga, Endereco } from '@/features/vaga/vagas/types/vaga';
import { VagasResumo } from '@/features/vaga/vagas/types/vaga';
import { TipoVeiculo } from '@/features/veiculos/types/tipoVeiculo';
import { VeiculoResponse } from '@/features/veiculos/types/veiculo';
import { Paginacao } from '@/lib/types/paginacao';
import { UsuarioSimplificado } from '@/lib/types/personas/user2';

export interface ReservaParams {
  status?: ReservaStatus,
  vagaId?: string,
  placa?: string,
  data?: string,
  tipoVeiculo?: TipoVeiculo,
  usuarioId?: string,
  mes?: number,
  ano?: number,
  numeroPagina?: number,
  tamanhoPagina?: number
}

export type ReservaStatus =
  | 'RESERVADA'
  | 'ATIVA'
  | 'CONCLUIDA'
  | 'CANCELADA'
  | 'REMOVIDA';

// Criar Reserva

export type CriarReservaPayload = {
  vagaId: string;
  motoristaId: string;
  veiculoId: string;
  cidadeOrigem: string;
  entradaCidade: string;
  inicio: string;
  fim: string;
  posicaoPerpendicular?: number;
};

// Atualizar Reserva

export type AtualizarReservaPayload = {
  motoristaId?: string;
  veiculoId: string;
  cidadeOrigem: string;
  inicio: string;
  fim: string;
};

// Buscar Reserva Por Id (apenas a rota /reservas/{id} utiliza essa resposta)

export type ReservaPorIdResponse = {
  id: string;
  vagaId: string;
  numeroEndereco: string;
  referenciaEndereco: string;
  logradouro: string;
  bairro: string;
  motoristaId: string;
  motoristaNome: string;
  motoristaCpfLast5: string;
  veiculoId: string;
  veiculoPlaca: string;
  veiculoModelo: string;
  veiculoMarca: string;
  empresaId: string;
  empresaNome: string;
  empresaCnpj: string;
  cidadeOrigem: string;
  entradaCidade: string;
  criadoEm: string;
  inicio: string;
  fim: string;
  status: ReservaStatus;
};

// Reserva Por Usuario (apenas rota /reservas/usuario/{usuarioId} utiliza essa resposta e tem paginação)

export type ReservaPorUsuarioResponse = {
  id: string;
  vaga: VagasResumo;
  motorista: MotoristaResponse;
  veiculo: VeiculoResponse;
  criadoPor: UsuarioSimplificado;
  cidadeOrigem: string;
  entradaCidade: string;
  criadoEm: string;
  inicio: string;
  fim: string;
  status: ReservaStatus;
  checkedIn: boolean;
  posicaoPerpendicular: number;
};

export type ReservaResponse = {
  id: string;
  vagaId: string;
  areaVaga: AreaVaga;
  motoristaId: string;
  motoristaNome: string;
  motoristaCpf: string;
  numeroEndereco: string;
  referenciaEndereco: string;
  enderecoVaga: Endereco
  inicio: string;
  fim: string;
  veiculoId: string;
  tamanhoVeiculo: string;
  placaVeiculo: string;
  modeloVeiculo: string;
  marcaVeiculo: string;
  cpfProprietarioVeiculo: string;
  cnpjProprietarioVeiculo: string;
  cidadeOrigem: string;
  entradaCidade: string;
  status: ReservaStatus;
  checkedIn: boolean;
  checkInEm: string;
  checkOutEm: string;
  criadoPor: UsuarioSimplificado;
  criadoEm: string;
  posicaoPerpendicular: number
};

// Reservas/bloqueios

export type ReservaBloqueiosResponse = {
    inicio: string;
    fim: string;
}

// Reserva Paginada

export type ReservaPaginadaDeUmUsuario = Paginacao<ReservaPorUsuarioResponse>;
