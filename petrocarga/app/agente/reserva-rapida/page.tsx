'use client';

import { useState } from 'react';
import { MapReserva } from '@/components/map/MapReserva';
import ReservaRapida from '@/components/agente/reservaRapida/reservaRapidaComponent';
import { Vaga } from '@/lib/types/vaga';
import { useMapboxSuggestions } from '@/components/hooks/map/useMapboxSuggestions';
import { Info, MapIcon, MapPin, Search, X } from 'lucide-react';
import Link from 'next/link';

type Suggestion = {
  label: string;
  lat: number;
  lng: number;
};

/**
 * @component ReservaRapidaPage
 * @version 1.0.0
 *
 * @description Página de reserva rápida para agentes em duas etapas.
 * Permite buscar localização, selecionar uma vaga no mapa e preencher os dados da reserva rápida.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * ETAPA 1 - SELEÇÃO DE VAGA (MAPA):
 *    - Campo de busca com sugestões do Mapbox
 *    - Mapa interativo (MapReserva) com vagas disponíveis
 *    - Ao clicar em uma vaga, avança para etapa 2
 *    - Pode usar busca para centralizar o mapa
 *
 * ETAPA 2 - FORMULÁRIO DE RESERVA RÁPIDA:
 *    - Componente ReservaRapida recebe a vaga selecionada
 *    - Exibe resumo da vaga selecionada
 *    - Botão "Voltar" retorna ao mapa (ícone MapIcon)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - BUSCA POR LOCALIZAÇÃO: useMapboxSuggestions com geocodificação reversa
 * - DROPDOWN: Sugestões aparecem em card flutuante sobre o CTA
 * - SELEÇÃO DE LOCAL: Centraliza o mapa na localização escolhida
 * - PREVENÇÃO DE BLOQUEIO: onMouseDown + preventDefault evita conflito com onBlur
 *
 * ----------------------------------------------------------------------------
 * 🎨 ESTILOS:
 * ----------------------------------------------------------------------------
 *
 * - Header: Azul escuro (#071D41)
 * - CTA de busca: Fundo azul escuro com borda amarela (#FFCD07)
 * - Dropdown: Fundo azul médio (#0C2D5E), texto branco
 * - Ícones de destaque: Amarelo (#FFCD07)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - MapReserva: Mapa interativo com vagas clicáveis
 * - ReservaRapida: Formulário de reserva rápida para agentes
 * - useMapboxSuggestions: Hook para busca de endereços
 *
 * @example
 * ```tsx
 * // Uso em rota de agente
 * <ReservaRapidaPage />
 * ```
 */

export default function ReservaRapidaPage() {
  // ==================== ESTADOS ====================
  const [step, setStep] = useState<'mapa' | 'reserva'>('mapa');
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [localOrigin, setLocalOrigin] = useState('');

  const suggestions = useMapboxSuggestions(localOrigin, true) as Suggestion[];
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ==================== HANDLERS ====================
  const handleSelectVaga = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    setStep('reserva');
  };

  const handleBackToMap = () => {
    setStep('mapa');
    setSelectedVaga(null);
  };

  const handleClearSearch = () => {
    setLocalOrigin('');
  };

  /**
   * Seleciona uma sugestão do dropdown
   * - Atualiza o campo de busca
   * - Fecha o dropdown
   * - Centraliza o mapa na localização selecionada
   */
  const handleSelectSuggestion = (place: Suggestion) => {
    setLocalOrigin(place.label);
    setSearchFocused(false);
    setSelectedLocation({
      lat: place.lat,
      lng: place.lng,
    });
  };

  // ==================== DADOS DERIVADOS ====================
  const vagaLabel = selectedVaga?.endereco.logradouro;
  const vagaEndereco = selectedVaga?.endereco.bairro;
  const vagaSetor = selectedVaga?.area;
  const showSuggestions = searchFocused && suggestions.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Reservar Vaga
          </h1>
          <p className="text-xs text-white/50 capitalize">
            {step === 'mapa'
              ? 'Selecione uma vaga no mapa'
              : 'Preencha os dados da reserva'}
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* ==================== CTA DINÂMICO ==================== */}
        <div className="-mt-4 mb-5">
          {/* ETAPA 1: Campo de busca */}
          {step === 'mapa' && (
            <div
              className="bg-[#071D41] rounded-2xl border-l-4 border-[#FFCD07] px-5 py-4"
              style={{ boxShadow: '0 4px 16px rgba(7,29,65,0.18)' }}
            >
              <div className="relative">
                {/* Input row */}
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{
                    background: searchFocused
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(255,255,255,0.10)',
                    border: searchFocused
                      ? '1.5px solid rgba(255,205,7,0.6)'
                      : '1.5px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <Search
                    className="h-4 w-4 flex-shrink-0 transition-colors"
                    style={{
                      color: searchFocused
                        ? '#FFCD07'
                        : 'rgba(255,255,255,0.45)',
                    }}
                  />

                  <input
                    type="text"
                    value={localOrigin}
                    onChange={(e) => setLocalOrigin(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Digite rua, bairro ou referência..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none min-w-0"
                    style={{ caretColor: '#FFCD07' }}
                  />

                  {localOrigin && (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleClearSearch();
                      }}
                      className="flex-shrink-0 rounded-full p-0.5 transition-colors hover:bg-white/20"
                      style={{ background: 'rgba(255,255,255,0.12)' }}
                      aria-label="Limpar pesquisa"
                    >
                      <X className="h-3 w-3 text-white/70" />
                    </button>
                  )}
                </div>

                {/* Dropdown de sugestões */}
                {showSuggestions && (
                  <ul
                    className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
                    style={{
                      background: '#0C2D5E',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    }}
                  >
                    {suggestions.map((place, index) => (
                      <li key={index}>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(place);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/10"
                          style={{
                            borderBottom:
                              index < suggestions.length - 1
                                ? '1px solid rgba(255,255,255,0.07)'
                                : 'none',
                          }}
                        >
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#FFCD07] opacity-70" />
                          <span className="text-sm text-white/85 truncate">
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

          {/* ETAPA 2: Info da vaga selecionada */}
          {step === 'reserva' && selectedVaga && (
            <div
              className="flex items-center justify-between bg-[#071D41] rounded-2xl px-5 py-4 border-l-4 border-[#FFCD07]"
              style={{ boxShadow: '0 4px 16px rgba(7,29,65,0.18)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-[15px] mb-0.5 truncate">
                  {vagaLabel}
                </p>
                {vagaEndereco && (
                  <p className="text-white/60 text-xs truncate">
                    {vagaEndereco}
                  </p>
                )}
                {!vagaEndereco && vagaSetor && (
                  <p className="text-white/60 text-xs truncate">{vagaSetor}</p>
                )}
              </div>

              {/* Botão voltar ao mapa */}
              <div className="bg-white/15 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors hover:bg-white/30">
                <MapIcon
                  className="h-5 w-5 text-white"
                  onClick={handleBackToMap}
                />
              </div>
            </div>
          )}
        </div>

        {/* ==================== ETAPA 1: MAPA ==================== */}
        {step === 'mapa' && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-[calc(75vh-120px)] md:h-[70vh] lg:h-[75vh] rounded-xl overflow-hidden shadow-md mb-4">
              <MapReserva
                onClickVaga={handleSelectVaga}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        )}

        {/* ==================== ETAPA 2: FORMULÁRIO ==================== */}
        {step === 'reserva' && selectedVaga && (
          <div className="mb-4">
            <ReservaRapida
              selectedVaga={selectedVaga}
              onBack={handleBackToMap}
            />
          </div>
        )}

        {/* ==================== TUTORIAL ==================== */}
        <Link
          href="/agente/tutorial#reservarapida"
          className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors"
        >
          <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-[#1351B4]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#071D41]">
              Novo por aqui?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Veja como reservar uma vaga em 3 passos simples
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
