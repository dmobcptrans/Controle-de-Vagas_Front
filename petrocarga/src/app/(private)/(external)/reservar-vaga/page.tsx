'use client';

import { useState } from 'react';

import { MapReserva } from '@/features/map/components/MapReserva';
import ReservaComponent from '@/features/reserva/reservar-vaga/components/ReservaComponent';

import {
  VagasMapa,
} from '@/features/vaga/vagas/types/vaga';

import {
  CTASearch,
  SuggestionWithCoords,
} from '@/components/ui/CTA/search/CTASearch';

import { CTAInfoReserva } from '@/components/ui/CTA/reserva/CTAInfoReserva';

import { useMapboxSuggestions } from '@/features/map/hooks/useMapboxSuggestions';
import { useVaga } from '@/features/vaga/vagas/hooks/useVaga';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';

import OnboardingVeiculoModal from '@/features/usuarios/auth/components/modal/autorizacao/completar-cadastro/Onboardingveiculomodal';

import { Header } from '@/components/ui/Header/Header';
import TutorialCard from '@/components/ui/TutorialCard/TutorialCard';

export default function ReservaPage() {
  const [step, setStep] = useState<'mapa' | 'reserva'>('mapa');

  const [selectedVagaId, setSelectedVagaId] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState('');

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { user } = useAuth();

  const empresaId = user?.id;

  const suggestions = useMapboxSuggestions(searchValue, true);

  const {
    vaga: selectedVaga,
    loading: loadingVaga,
    error: errorVaga,
  } = useVaga({
    vagaId: selectedVagaId!,
    buscarAutomaticamente: Boolean(selectedVagaId),
  });

  const handleSuggestionSelect = (
    suggestion: SuggestionWithCoords,
  ) => {
    setSearchValue(suggestion.label);

    setSelectedLocation({
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
  };

  const handleSelectVaga = (vagaResumo: VagasMapa) => {
    setSelectedVagaId(vagaResumo.id);
    setStep('reserva');
  };

  const handleBackToMap = () => {
    setStep('mapa');
    setSelectedVagaId(null);
  };

  const vagaLabel = selectedVaga?.endereco.logradouro;
  const vagaEndereco = selectedVaga?.endereco.bairro;
  const vagaSetor = selectedVaga?.area;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header
        title="Reservar Vaga"
        subtitle={
          step === 'mapa'
            ? 'Selecione uma vaga no mapa'
            : 'Preencha os dados da reserva'
        }
      />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
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

        {step === 'mapa' && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-[calc(75vh-120px)] md:h-[70vh] lg:h-[75vh] rounded-2xl overflow-hidden shadow-md mb-4">
              <MapReserva
                onClickVaga={handleSelectVaga}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        )}

        {step === 'reserva' && (
          <div className="mb-4">
            {loadingVaga && (
              <div className="flex justify-center py-8">
                Carregando vaga...
              </div>
            )}

            {errorVaga && !loadingVaga && (
              <div className="text-center py-8 text-red-500">
                Não foi possível carregar os dados da vaga.
              </div>
            )}

            {!loadingVaga && !errorVaga && selectedVaga && (
              <ReservaComponent
                selectedVaga={selectedVaga}
                onBack={handleBackToMap}
                empresaId={empresaId}
              />
            )}
          </div>
        )}

        <TutorialCard
          href="/tutorial#reservarvaga"
          description="Veja como usar o sistema em 3 passos simples"
        />
      </main>

      <OnboardingVeiculoModal />
    </div>
  );
}