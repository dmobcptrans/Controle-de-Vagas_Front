import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Reserva } from '@/lib/types/reserva';
import { Vaga } from '@/lib/types/vaga';
import { Veiculo } from '@/lib/types/veiculo';
import { formatTime } from '../../utils/gestor/calendario/utils';

const STATUS_CONFIG = {
  ATIVA: {
    label: 'Ativa',
    color: 'text-green-700 bg-green-100',
    border: 'border-green-500',
    dot: 'bg-green-500',
    isActive: true,
  },
  RESERVADA: {
    label: 'Reservada',
    color: 'text-amber-700 bg-amber-100',
    border: 'border-amber-500',
    dot: 'bg-amber-500',
    isActive: true,
  },
  CONCLUIDA: {
    label: 'Concluída',
    color: 'text-slate-600 bg-slate-100',
    border: 'border-slate-400',
    dot: 'bg-slate-400',
    isActive: false,
  },
  CANCELADA: {
    label: 'Cancelada',
    color: 'text-red-700 bg-red-100',
    border: 'border-red-400',
    dot: 'bg-red-400',
    isActive: false,
  },
  REMOVIDA: {
    label: 'Removida',
    color: 'text-gray-500 bg-gray-100 decoration-line-through',
    border: 'border-gray-300',
    dot: 'bg-gray-300',
    isActive: false,
  },
} as const;

type StatusType = keyof typeof STATUS_CONFIG;

// --- COMPONENTES ---

export const LogradouroItem = ({
  logradouro,
  reservas,
  onClick,
}: {
  logradouro: string;
  reservas: Reserva[];
  onClick: () => void;
}) => {
  const counts = useMemo(() => {
    return reservas.reduce(
      (acc, r) => {
        const status = (r.status as StatusType) || 'CONCLUIDA';
        if (STATUS_CONFIG[status]?.isActive) {
          acc.emAndamento++;
        } else {
          acc.finalizadas++;
        }
        return acc;
      },
      { emAndamento: 0, finalizadas: 0 },
    );
  }, [reservas]);

  return (
    <div className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:border-gray-300 transition-colors bg-white">
      <div>
        <div className="font-medium text-gray-900">{logradouro}</div>

        <div className="flex gap-2 mt-2 text-xs">
          {counts.emAndamento > 0 && (
            <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 font-semibold">
              {counts.emAndamento} em andamento
            </span>
          )}
          {counts.finalizadas > 0 && (
            <span className="px-2 py-1 rounded-md bg-red-100 text-red-800 font-medium">
              {counts.finalizadas} finalizada(s)
            </span>
          )}
          {counts.emAndamento === 0 && counts.finalizadas === 0 && (
            <span className="text-gray-400 italic">Sem histórico</span>
          )}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onClick}>
        Ver vagas
      </Button>
    </div>
  );
};

export const VagaItem = ({
  vagaId,
  vagasCache,
  reservas,
  onClick,
}: {
  vagaId: string;
  vagasCache: Record<string, Vaga | null>;
  reservas: Reserva[];
  onClick: () => void;
}) => {
  const vagaInfo = vagasCache[vagaId] ?? null;

  const temAtividade = reservas.some((r) => {
    const s = r.status as StatusType;
    return STATUS_CONFIG[s]?.isActive;
  });

  const dotClass = temAtividade ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full shadow-sm ${dotClass}`} />

        <div>
          <div className="font-medium text-sm text-gray-800">
            {vagaInfo?.endereco?.logradouro ?? vagaId}
            {vagaInfo?.numeroEndereco ? `, ${vagaInfo.numeroEndereco}` : ''}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {reservas.length} registro(s) no histórico
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onClick}>
        Ver reservas
      </Button>
    </div>
  );
};

export const ReservaItem = ({
  reserva,
  onClick,
}: {
  reserva: Reserva;
  veiculo?: Veiculo;
  onClick: () => void;
}) => {
  const status = (reserva.status as StatusType) || 'CONCLUIDA';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.CONCLUIDA;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md border-l-4 bg-white shadow-sm mb-2 ${config.border}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">
            {formatTime(reserva.inicio)} — {formatTime(reserva.fim)}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${config.color}`}
          >
            {config.label}
          </span>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>{reserva.enderecoVaga.bairro}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="font-medium text-gray-600">
            {reserva.placaVeiculo}
          </span>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onClick}>
        Detalhes
      </Button>
    </div>
  );
};
