'use client';

import { useState } from 'react';
import { MapIcon, MapPin, Search, X } from 'lucide-react';
import { useMapboxSuggestions } from '@/components/hooks/map/useMapboxSuggestions';

interface Suggestion {
  label: string;
  lat: number;
  lng: number;
}

interface ReservaCTAProps {
  step: 'mapa' | 'reserva';

  onLocationSelected(location: { lat: number; lng: number }): void;

  vagaLabel?: string;
  vagaEndereco?: string;
  vagaSetor?: string;

  onBackToMap?(): void;
}

export default function ReservaCTA({
  step,
  onLocationSelected,
  vagaLabel,
  vagaEndereco,
  vagaSetor,
  onBackToMap,
}: ReservaCTAProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');

  const suggestions = useMapboxSuggestions(value, true) as Suggestion[];

  const showSuggestions =
    focused &&
    value.trim().length > 0 &&
    suggestions.length > 0;

  function handleClear() {
    setValue('');
  }

  function handleSelectSuggestion(place: Suggestion) {
    setValue(place.label);
    setFocused(false);

    onLocationSelected({
      lat: place.lat,
      lng: place.lng,
    });
  }

  return (
    <div className="-mt-4 mb-5">
      {step === 'mapa' && (
        <div
          className="bg-[#071D41] rounded-2xl border-l-4 border-[#FFCD07] px-5 py-4"
          style={{
            boxShadow: '0 4px 16px rgba(7,29,65,.18)',
          }}
        >
          <div className="relative">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all"
              style={{
                background: focused
                  ? 'rgba(255,255,255,.15)'
                  : 'rgba(255,255,255,.10)',

                border: focused
                  ? '1.5px solid rgba(255,205,7,.6)'
                  : '1.5px solid rgba(255,255,255,.12)',
              }}
            >
              <Search
                className="h-4 w-4 flex-shrink-0"
                style={{
                  color: focused
                    ? '#FFCD07'
                    : 'rgba(255,255,255,.45)',
                }}
              />

              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Digite rua, bairro ou referência..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none min-w-0"
                style={{
                  caretColor: '#FFCD07',
                }}
              />

              {value && (
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleClear();
                  }}
                  className="rounded-full p-0.5 hover:bg-white/20"
                  style={{
                    background: 'rgba(255,255,255,.12)',
                  }}
                >
                  <X className="h-3 w-3 text-white/70" />
                </button>
              )}
            </div>

            {showSuggestions && (
              <ul
                className="absolute left-0 right-0 mt-2 overflow-hidden rounded-xl z-50"
                style={{
                  background: '#0C2D5E',
                  border: '1px solid rgba(255,255,255,.12)',
                  boxShadow: '0 8px 24px rgba(0,0,0,.35)',
                }}
              >
                {suggestions.map((place, index) => (
                  <li key={index}>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(place);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10"
                      style={{
                        borderBottom:
                          index < suggestions.length - 1
                            ? '1px solid rgba(255,255,255,.07)'
                            : undefined,
                      }}
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#FFCD07] opacity-70" />

                      <span className="truncate text-sm text-white/85">
                        {place.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {step === 'reserva' && (
        <div
          className="flex items-center justify-between bg-[#071D41] rounded-2xl border-l-4 border-[#FFCD07] px-5 py-4"
          style={{
            boxShadow: '0 4px 16px rgba(7,29,65,.18)',
          }}
        >
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

          <button
            onClick={onBackToMap}
            className="ml-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 transition-colors hover:bg-white/30"
          >
            <MapIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}