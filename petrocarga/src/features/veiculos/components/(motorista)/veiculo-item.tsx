'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Building2, Trash, Truck } from 'lucide-react';
import { VeiculoResponse } from '../../types/veiculo';

interface VeiculoCardProps {
  veiculo: VeiculoResponse;
  type?: 'motorista' | 'empresa';
  isEmpresa?: boolean;
  onDesvincular?: (veiculo: VeiculoResponse) => void;
}

export default function VeiculoCard({
  veiculo,
  type = 'motorista',
  isEmpresa = false,
  onDesvincular,
}: VeiculoCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col justify-between gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center',
        isEmpresa ? 'border-l-amber-500' : 'border-l-[#1351B4]',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-base font-semibold text-gray-800 sm:text-lg">
            {veiculo.marca} {veiculo.modelo}
          </h3>

          <span className="hidden rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 sm:inline-block sm:text-sm">
            {veiculo.tipo}
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center">
          <span className="flex items-center gap-1">
            <Truck className="h-4 w-4 text-gray-400" />
            Placa: {veiculo.placa}
          </span>

          {isEmpresa && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
              <Building2 className="h-3.5 w-3.5" />
              Veículo de empresa
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col items-stretch gap-2 sm:mt-0 sm:w-auto sm:items-end">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-center text-xs font-semibold text-blue-800 sm:hidden">
          {veiculo.tipo}
        </span>

        {!isEmpresa && type === 'motorista' && (
          <Link
            href={`/meus-veiculos/${veiculo.id}`}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full text-center text-sm sm:w-auto sm:text-base',
            )}
          >
            Ver mais
          </Link>
        )}

        {type === 'empresa' && (
          <button
            type="button"
            onClick={() => onDesvincular?.(veiculo)}
            className={cn(
              buttonVariants({ variant: 'destructive' }),
              'w-full text-sm sm:w-auto sm:text-base',
            )}
            aria-label={`Desvincular veículo ${veiculo.placa}`}
          >
            <Trash className="h-5 w-5" />
            Desvincular
          </button>
        )}
      </div>
    </article>
  );
}
