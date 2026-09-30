'use client';

import Confirmation from '@/features/reserva/reservar-vaga/components/Confirmation';
import { VagaResponse } from '@/features/vaga/vagas/types/vaga';
import { VeiculoResponse } from '@/features/veiculos/types/veiculo';

interface StepConfirmacaoProps {
  selectedDay: Date;
  startHour: string;
  endHour: string;
  selectedVaga: VagaResponse;
  tipoVeiculo: VeiculoResponse['tipo'] | null;
  placa: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function StepConfirmacao({
  selectedDay,
  startHour,
  endHour,
  selectedVaga,
  tipoVeiculo,
  placa,
  onConfirm,
  onBack,
}: StepConfirmacaoProps) {
  return (
    <Confirmation
      day={selectedDay}
      startHour={startHour}
      endHour={endHour}
      origin="Agente Local"
      destination={`${selectedVaga.endereco.logradouro}, ${selectedVaga.endereco.bairro}`}
      vehicleName={`${tipoVeiculo} - ${placa}`}
      onConfirm={onConfirm}
      onReset={onBack}
    />
  );
}