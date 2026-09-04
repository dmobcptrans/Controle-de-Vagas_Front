'use client';

import { useState } from 'react';
import { MapReserva } from '@/components/map/MapReserva';
import ReservaComponent from '@/components/reserva/ReservaComponent';

import { Vaga, VagaMapa } from '@/lib/types/vaga';
import PageHeader from '@/components/ui/pageHeader';
import { CTASearch } from '@/components/ui/CTA/search/CTASearch';
import { CTAInfoReserva } from '@/components/ui/CTA/reserva/CTAInfoReserva';
import { useMapboxSuggestions } from '@/components/hooks/map/useMapboxSuggestions';
import TutorialCard from '@/components/ui/TutorialCard/TutorialCard';
import { getVagaById } from '@/services/api/vagaApi';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingVeiculoModal from '@/components/modal/autorizacao/completar-cadastro/Onboardingveiculomodal';

/**
 * @component ReservaPage
 * @version 1.0.0
 *
 * @description Página de reserva de vagas para motoristas em duas etapas.
 * Permite buscar localização, selecionar uma vaga no mapa e preencher os dados da reserva.
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
 * ETAPA 2 - FORMULÁRIO DE RESERVA:
 *    - Componente ReservaComponent recebe a vaga selecionada
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
 * - ReservaComponent: Formulário de criação de reserva
 * - useMapboxSuggestions: Hook para busca de endereços
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <ReservaPage />
 * ```
 */

export default function ReservaPage() {
  // ==================== ESTADOS ====================
  const [step, setStep] = useState<'mapa' | 'reserva'>('mapa');

  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);

  const [loadingVaga, setLoadingVaga] = useState(false);

  const [searchValue, setSearchValue] = useState('');

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const suggestions = useMapboxSuggestions(searchValue, true);

  const { user } = useAuth();
  const empresaId = user?.id;

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
  };

  // ==================== DADOS DERIVADOS ====================

  const vagaLabel = selectedVaga?.endereco.logradouro;
  const vagaEndereco = selectedVaga?.endereco.bairro;
  const vagaSetor = selectedVaga?.area;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}
      <PageHeader
        title="Reservar Vaga"
        description={
          step === 'mapa'
            ? 'Selecione uma vaga no mapa'
            : 'Preencha os dados da reserva'
        }
      />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* ==================== CTA DINÂMICO ==================== */}

        {step === 'mapa' && (
          <CTASearch
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Pesquisar localização..."
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
            <div className="w-full h-[calc(75vh-120px)] md:h-[70vh] lg:h-[75vh] rounded-2xl overflow-hidden shadow-md mb-4">
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
            <ReservaComponent
              selectedVaga={selectedVaga}
              onBack={handleBackToMap}
              empresaId={empresaId}
            />
          </div>
        )}

        {/* ==================== TUTORIAL ==================== */}
        <TutorialCard
          href="/tutorial#reservarvaga"
          description="Veja como usar o sistema em 3 passos simples"
        />
      </main>
      <OnboardingVeiculoModal />
    </div>
  );
}
