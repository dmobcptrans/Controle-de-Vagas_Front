'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';

import { MapReserva } from '@/features/map/components/MapReserva';
import ReservaAgente from '@/features/usuarios/(personas)/agentes/components/reserva/ReservaAgente';

import { Vaga, VagaMapa } from '@/features/vaga/vagas/types/vaga';
import { getVagaById } from '@/features/vaga/vagas/service/vagaApi';

import {
  CTASearch,
  SuggestionWithCoords,
} from '@/components/ui/CTA/search/CTASearch';

import { CTAInfoReserva } from '@/components/ui/CTA/reserva/CTAInfoReserva';

import { useMapboxSuggestions } from '@/features/map/hooks/useMapboxSuggestions';

import { useReservaAgenteState } from '@/features/usuarios/(personas)/agentes/components/reserva/hooks/useReservaAgenteState';

import { Header } from '@/components/ui/Header/Header';

export default function ReservaRapidaPage() {
  // ==================== ESTADOS ====================

  const [step, setStep] = useState<'mapa' | 'reserva'>('mapa');

  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);

  const [loadingVaga, setLoadingVaga] = useState(false);

  const [searchValue, setSearchValue] = useState('');

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ==================== ESTADO DA RESERVA RÁPIDA ====================

  const { clearDefaults } = useReservaAgenteState();

  // ==================== BUSCA ====================

  const suggestions = useMapboxSuggestions(searchValue, true);

  const handleSuggestionSelect = (suggestion: SuggestionWithCoords) => {
    setSearchValue(suggestion.label);

    setSelectedLocation({
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
  };

  // ==================== HANDLERS ====================

  const handleSelectVaga = async (vagaResumo: VagaMapa) => {
    try {
      setLoadingVaga(true);

      const vagaDetalhes = await getVagaById(vagaResumo.id);

      setSelectedVaga(vagaDetalhes);
      setStep('reserva');
    } catch (error) {
      console.error('Erro ao buscar detalhes da vaga:', error);
    } finally {
      setLoadingVaga(false);
    }
  };

  const handleBackToMap = () => {
    setStep('mapa');
    setSelectedVaga(null);

    clearDefaults();
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setSelectedLocation(null);
  };

  // ==================== DADOS DERIVADOS ====================

  const vagaLabel = selectedVaga?.endereco.logradouro;

  const vagaEndereco = selectedVaga?.endereco.bairro;

  const vagaSetor = selectedVaga?.area;

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}

      <Header
        title="Reservar Vaga"
        subtitle={
          step === 'mapa'
            ? 'Selecione uma vaga no mapa'
            : 'Preencha os dados da reserva'
        }
      />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* ==================== CTA ==================== */}

        {step === 'mapa' && (
          <CTASearch
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Pesquisar localização..."
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
          />
        )}

        {step === 'reserva' && (
          <CTAInfoReserva
            vagaLabel={vagaLabel}
            vagaEndereco={vagaEndereco}
            vagaSetor={vagaSetor}
            onBackToMap={handleBackToMap}
          />
        )}

        {/* ==================== ETAPA 1: MAPA ==================== */}

        {step === 'mapa' && (
          <div className="flex flex-col items-center justify-center">
            <div
              className="
                w-full
                h-[calc(75vh-120px)]
                md:h-[70vh]
                lg:h-[75vh]
                rounded-2xl
                overflow-hidden
                shadow-md
                mb-4
              "
            >
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
            <ReservaAgente selectedVaga={selectedVaga} />
          </div>
        )}

        {/* ==================== TUTORIAL ==================== */}

        <Link
          href="/agente/tutorial#reservarapida"
          className="
            flex
            items-center
            gap-4
            bg-white
            border
            border-gray-100
            border-l-4
            border-l-[#1351B4]
            rounded-xl
            p-4
            hover:bg-blue-50/30
            transition-colors
          "
        >
          <div
            className="
              bg-blue-50
              rounded-xl
              w-11
              h-11
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >
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
