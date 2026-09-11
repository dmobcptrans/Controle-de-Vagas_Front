import Link from 'next/link';
import { Archive, Clock, MapPin } from 'lucide-react';

import { ReservaGet } from '@/features/reserva/reservar-vaga/types/reserva';

const statusConfig = {
  ATIVA: {
    label: 'Ativa',
    className: 'bg-green-100 text-green-900',
  },
  RESERVADA: {
    label: 'Reservada',
    className: 'bg-green-100 text-green-900',
  },
  CONCLUIDA: {
    label: 'Concluída',
    className: 'bg-gray-100 text-gray-600',
  },
  CANCELADA: {
    label: 'Cancelada',
    className: 'bg-gray-100 text-gray-500',
  },
  REMOVIDA: {
    label: 'Removida',
    className: 'bg-gray-100 text-red-600',
  },
} as const;

type StatusKey = keyof typeof statusConfig;

interface UltimasReservasProps {
  reservas: ReservaGet[];
  loading: boolean;
}

function StatusBadge({ status }: { status: StatusKey }) {
  const { label, className } = statusConfig[status];

  return (
    <span
      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0" />

        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        </div>

        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

const formatarData = (data: string) =>
  new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

export function UltimasReservas({
  reservas,
  loading,
}: UltimasReservasProps) {
  const ultimasReservas = [...reservas]
    .sort(
      (a, b) =>
        new Date(b.inicio).getTime() -
        new Date(a.inicio).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Últimas reservas
        </p>

        <Link
          href="/minhas-reservas"
          className="text-xs text-[#1351B4] font-medium hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <div className="flex flex-col gap-1.5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : ultimasReservas.length === 0 ? (
          <div className="bg-white border-dashed border-gray-250 border-2 rounded-xl py-8 text-center">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Archive className="h-5 w-5 text-gray-300" />
            </div>

            <p className="text-sm text-gray-400">
              Nenhuma reserva encontrada
            </p>
          </div>
        ) : (
          ultimasReservas.map((reserva) => (
            <Link
              key={reserva.id}
              href="/minhas-reservas"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-[#1351B4]"
            >
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {reserva.vaga.logradouro}
                  </p>

                  <StatusBadge
                    status={reserva.status as StatusKey}
                  />
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  {reserva.cidadeOrigem}
                </p>

                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    Início: {formatarData(reserva.inicio)}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    Fim: {formatarData(reserva.fim)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}