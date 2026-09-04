'use client';

import { Building2, Check, Clock3, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ConviteMotoristaEmpresaListaItem } from '@/lib/types/conviteMotoristaEmpresa';
import { calcularDiasRestantes } from './utils/convite-motorista-empresa-datas';

interface ConvitePendenteCTAProps {
  convite: ConviteMotoristaEmpresaListaItem;
  responding: boolean;
  onResponder: (
    convite: ConviteMotoristaEmpresaListaItem,
    status: 'ACEITO' | 'RECUSADO',
  ) => void;
}

export default function ConvitePendenteCTA({
  convite,
  responding,
  onResponder,
}: ConvitePendenteCTAProps) {
  const tempoRestante = calcularDiasRestantes(convite.criadoEm);

  return (
    <div
      className="
        bg-white
        border border-blue-100
        rounded-2xl
        p-4
        sm:p-5
        shadow-sm
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            w-10 h-10 sm:w-12 sm:h-12
            rounded-xl
            bg-blue-800
            flex items-center justify-center
            shrink-0
          "
        >
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
              {convite.razaoSocial ?? 'Empresa'}
            </h2>

            <span
              className="
                shrink-0
                inline-flex items-center gap-1
                px-2 py-0.5
                rounded-full
                bg-amber-100 text-amber-700
                text-[10px] sm:text-xs font-medium
              "
            >
              <Clock3 className="w-3 h-3" />
              Pendente
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Convidou você para se vincular à empresa
          </p>

          {tempoRestante && !tempoRestante.expirado && (
            <p className="text-xs text-blue-700 mt-1">
              Expira em {tempoRestante.dias}{' '}
              {tempoRestante.dias === 1 ? 'dia' : 'dias'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          disabled={responding}
          onClick={() => onResponder(convite, 'RECUSADO')}
          className="
            h-10
            border-red-200
            text-red-600
            hover:bg-red-50
            hover:text-red-700
          "
        >
          {responding ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <X className="w-4 h-4 mr-2" />
          )}
          Recusar
        </Button>

        <Button
          type="button"
          disabled={responding}
          onClick={() => onResponder(convite, 'ACEITO')}
          className="h-10 bg-green-600 hover:bg-green-700 text-white"
        >
          {responding ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Aceitar
        </Button>
      </div>
    </div>
  );
}