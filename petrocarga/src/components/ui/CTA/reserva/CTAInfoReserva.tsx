'use client';

import { MapIcon } from 'lucide-react';

import { CTA } from '../CTA';

interface CTAInfoReservaProps {
  vagaLabel?: string;
  vagaEndereco?: string;
  vagaSetor?: string;
  onBackToMap?: () => void;
}

export function CTAInfoReserva({
  vagaLabel,
  vagaEndereco,
  vagaSetor,
  onBackToMap,
}: CTAInfoReservaProps) {
  return (
    <CTA className="px-5 py-4">
      <div className="flex w-full items-center justify-between">
        {/* Informações da vaga */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-white">
            {vagaLabel}
          </p>

          {vagaEndereco ? (
            <p className="truncate text-xs text-white/60">
              {vagaEndereco}
            </p>
          ) : (
            vagaSetor && (
              <p className="truncate text-xs text-white/60">
                {vagaSetor}
              </p>
            )
          )}
        </div>

        {/* Voltar para o mapa */}
        <button
          type="button"
          onClick={onBackToMap}
          aria-label="Voltar para o mapa"
          className="
            ml-4
            flex
            h-11
            w-11
            flex-shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white/15
            hover:bg-white/30
            transition-colors
            cursor-pointer
          "
        >
          <MapIcon className="h-5 w-5 text-white" />
        </button>
      </div>
    </CTA>
  );
}