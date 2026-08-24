'use client';

import Confirmation from '@/components/reserva/Confirmation';
import { Vaga } from '@/lib/types/vaga';
import { Veiculo } from '@/lib/types/veiculo';

interface StepConfirmacaoProps {
  selectedDay: Date;
  startHour: string;
  endHour: string;
  selectedVaga: Vaga;
  tipoVeiculo: Veiculo['tipo'] | null;
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