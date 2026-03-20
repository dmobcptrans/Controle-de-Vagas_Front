'use client';

import { useState } from 'react';
import { MapReserva } from '@/components/map/MapReserva';
import ReservaComponent from '@/components/reserva/ReservaComponent';
import { Vaga } from '@/lib/types/vaga';

/**
 * @component ReservaPage
 * @version 1.0.0
 *
 * @description Página de reserva de vagas para motoristas em duas etapas.
 * Permite selecionar uma vaga no mapa e preencher os dados da reserva.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * ETAPA 1 - SELEÇÃO DE VAGA (MAPA):
 * - Título "Selecione uma Vaga"
 * - Mapa interativo (MapReserva) com vagas disponíveis
 * - Ao clicar em uma vaga, avança para etapa 2
 * - Altura responsiva adaptada para diferentes dispositivos
 *
 * ETAPA 2 - FORMULÁRIO DE RESERVA:
 * - Componente ReservaComponent recebe a vaga selecionada
 * - Botão "Voltar" retorna ao mapa
 * - Permite preencher dados da reserva (veículo, datas, etc.)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - useState (controle de estado)
 *   - Interatividade (clique no mapa, navegação entre etapas)
 *
 * - DOIS ESTADOS PRINCIPAIS:
 *   - step: 'mapa' | 'reserva' (controla qual tela exibir)
 *   - selectedVaga: Vaga | null (vaga escolhida)
 *
 * - HANDLERS ESPECÍFICOS:
 *   - handleSelectVaga: Avança para reserva com vaga selecionada
 *   - handleBackToMap: Volta para mapa e limpa seleção
 *
 * - RENDERIZAÇÃO CONDICIONAL:
 *   - step === 'mapa' → exibe mapa
 *   - step === 'reserva' && selectedVaga → exibe formulário
 *
 * - LAYOUT RESPONSIVO:
 *   - Container centralizado (max-w-6xl)
 *   - Altura do mapa: h-[calc(88vh-120px)] (mobile) / md:h-[70vh] (desktop)
 *   - Padding adaptativo (px-2 md:p-6)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - MapReserva: Mapa interativo com vagas clicáveis
 * - ReservaComponent: Formulário de criação de reserva
 * - Vaga: TypeScript type da vaga
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <ReservaPage />
 * ```
 *
 * @see /src/components/map/MapReserva.tsx - Mapa interativo
 * @see /src/components/reserva/ReservaComponent.tsx - Formulário de reserva
 * @see /src/lib/types/vaga.ts - Tipagem da vaga
 */

export default function ReservaPage() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  /**
   * step: Controla qual etapa do fluxo está sendo exibida
   * - 'mapa': Usuário escolhe uma vaga no mapa
   * - 'reserva': Usuário preenche dados da reserva
   */
  const [step, setStep] = useState<'mapa' | 'reserva'>('mapa');

  /**
   * selectedVaga: Vaga selecionada no mapa
   * - null: nenhuma vaga selecionada (etapa mapa)
   * - Vaga: vaga escolhida (etapa reserva)
   */
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  /**
   * @function handleSelectVaga
   * @description Processa a seleção de uma vaga no mapa
   *
   * Fluxo:
   * 1. Recebe a vaga clicada do componente MapReserva
   * 2. Salva a vaga no estado selectedVaga
   * 3. Avança para a etapa de reserva (step = 'reserva')
   *
   * @param vaga - Vaga selecionada no mapa
   */
  const handleSelectVaga = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    setStep('reserva');
  };

  /**
   * @function handleBackToMap
   * @description Retorna para a etapa de seleção de vaga
   *
   * Fluxo:
   * 1. Volta para etapa do mapa (step = 'mapa')
   * 2. Limpa a vaga selecionada (selectedVaga = null)
   *
   * Usado quando usuário clica em "Voltar" no formulário
   */
  const handleBackToMap = () => {
    setStep('mapa');
    setSelectedVaga(null);
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  return (
    <div className="px-2 md:p-6 max-w-6xl mx-auto mt-6 md:mt-10">
      {/* ETAPA 1: MAPA DE VAGAS */}
      {step === 'mapa' && (
        <div className="flex flex-col items-center justify-center">
          {/* Título da etapa */}
          <h1 className="text-lg md:text-2xl font-semibold text-center mb-4">
            Selecione uma Vaga
          </h1>

          {/* Container do mapa */}
          <div className="w-full h-[calc(88vh-120px)] md:h-[70vh] lg:h-[75vh] rounded-lg overflow-hidden shadow-md mb-4">
            <MapReserva onClickVaga={handleSelectVaga} />
          </div>
        </div>
      )}

      {/* ETAPA 2: FORMULÁRIO DE RESERVA */}
      {/* Só renderiza se estiver na etapa reserva E houver vaga selecionada */}
      {step === 'reserva' && selectedVaga && (
        <ReservaComponent
          selectedVaga={selectedVaga}
          onBack={handleBackToMap}
        />
      )}
    </div>
  );
}
