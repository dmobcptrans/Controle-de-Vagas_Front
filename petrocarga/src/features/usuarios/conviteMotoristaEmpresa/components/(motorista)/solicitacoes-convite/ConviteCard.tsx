'use client';

import { Loader2, ShieldCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ConviteCardProps {
  razaoSocial?: string;
  cnpj?: string;
  onDesvincular?: () => void;
  disabled?: boolean;
}

export default function ConviteCard({
  razaoSocial,
  cnpj,
  onDesvincular,
  disabled = false,
}: ConviteCardProps) {
  return (
    <div
      className="
        bg-white
        border border-gray-100
        rounded-2xl
        p-4
        sm:p-5
        shadow-sm
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            w-10 h-10 sm:w-12 sm:h-12
            rounded-xl
            bg-green-600
            flex items-center justify-center
            shrink-0
          "
        >
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
            {razaoSocial ?? 'Empresa vinculada'}
          </h2>

          {cnpj && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              CNPJ: {cnpj}
            </p>
          )}
        </div>
      </div>

      {onDesvincular && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={onDesvincular}
            className="
              w-full
              h-10
              border-red-200
              text-red-600
              hover:bg-red-50
              hover:text-red-700
            "
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}

            Desvincular da empresa
          </Button>
        </div>
      )}
    </div>
  );
}

