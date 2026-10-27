import { CopyPlus } from 'lucide-react';
import { CTA } from '@/components/ui/CTA/CTA';

interface EmptyStateProps {
  tipo: 'agente' | 'motorista';
}

export default function EmptyState({ tipo }: EmptyStateProps) {
  const href =
    tipo === 'agente'
      ? '/agente/reserva-rapida'
      : '/reservar-vaga';

  const descricao =
    tipo === 'agente'
      ? 'Criar Reserva Rápida'
      : 'Fazer Reserva';

  return (
    <CTA
      href={href}
      title="Nenhuma Reserva Ativa"
      description={descricao}
      icon={<CopyPlus className="h-5 w-5 text-white" />}
    />
  );
}

