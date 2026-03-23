'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VeiculoAPI } from '@/lib/types/veiculo';
import { useMapboxSuggestions } from '../hooks/map/useMapboxSuggestions';

interface OriginVehicleStepProps {
  vehicles: VeiculoAPI[];
  origin: string;
  entryCity: string | null;
  selectedVehicleId?: string;

  onOriginChange: (value: string) => void;
  onEntryCityChange: (value: string | null) => void;
  onVehicleChange: (id: string) => void;

  onNext: (origin: string, entryCity: string | null, vehicleId: string) => void;

  onBack?: () => void;
}

/**
 * @component OriginVehicleStep
 * @version 1.0.0
 * 
 * @description Componente de etapa para seleção de origem e veículo no fluxo de reserva.
 * Permite escolher entre origem local (Petrópolis) ou outro município,
 * com sugestões de localidades via Mapbox e seleção de entrada da cidade.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. ORIGEM:
 *    - "Sim, já está em Petrópolis": origem = "Petrópolis - RJ", entrada = null
 *    - "Não, vem de outro local": exibe campos adicionais
 * 
 * 2. CAMPO DE ORIGEM (se "outro município"):
 *    - Input com autocomplete via Mapbox Suggestions
 *    - Sugestões aparecem ao focar/digitar
 * 
 * 3. ENTRADA NA CIDADE (se "outro município"):
 *    - Select com 14 opções de entradas de Petrópolis:
 *      - BR-040 (6 opções), BR-495, RJ-107, RJ-117, RJ-123, RJ-134, Est. União
 * 
 * 4. VEÍCULO:
 *    - Select com lista de veículos do usuário
 *    - Opção "Adicionar novo veículo" redireciona para página de cadastro
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - ESTADO LOCAL: Mantém valores durante edição antes de confirmar
 * - MAPBOX SUGGESTIONS: Hook customizado para busca de localidades
 * - REDIRECIONAMENTO: Opção "Adicionar novo veículo" redireciona via router.push
 * - VALIDAÇÃO: Botão "Próximo" desabilitado até seleção completa
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useMapboxSuggestions: Hook para busca de localidades
 * - VeiculoAPI: Tipo de veículo simplificado
 * 
 * @example
 * ```tsx
 * <OriginVehicleStep
 *   vehicles={vehicles}
 *   origin={origin}
 *   entryCity={entryCity}
 *   selectedVehicleId={selectedVehicleId}
 *   onOriginChange={setOrigin}
 *   onEntryCityChange={setEntryCity}
 *   onVehicleChange={setSelectedVehicleId}
 *   onNext={handleNext}
 *   onBack={() => setStep(1)}
 * />
 * ```
 */

export default function OriginVehicleStep({
  vehicles,
  origin,
  entryCity,
  selectedVehicleId,
  onOriginChange,
  onEntryCityChange,
  onVehicleChange,
  onNext,
  onBack,
}: OriginVehicleStepProps) {
  const router = useRouter();
  const [localOrigin, setLocalOrigin] = useState(origin);
  const [localVehicleId, setLocalVehicleId] = useState(selectedVehicleId || '');
  const [isFocused, setIsFocused] = useState(false);
  const [origem, setOrigem] = useState('');

  const suggestions = useMapboxSuggestions(localOrigin);

  // ==================== HANDLERS ====================
  const handleSelectSuggestion = (place: string) => {
    setLocalOrigin(place);
    onOriginChange(place);
    setIsFocused(false);
  };

  const handleVehicleChange = (value: string) => {
    if (value === 'add-new') {
      router.push('/motorista/veiculos/cadastrar-veiculos');
      return;
    }
    setLocalVehicleId(value);
  };

  const handleNext = () => {
    if (!localVehicleId) return;

    if (origem === 'outro-municipio' && (!localOrigin || !entryCity)) return;

    const cidadeOrigemFinal =
      origem === 'proprio-municipio' ? 'Petrópolis - RJ' : localOrigin;

    const entradaFinal = origem === 'proprio-municipio' ? null : entryCity;

    onOriginChange(cidadeOrigemFinal);
    onEntryCityChange(entradaFinal);

    onVehicleChange(localVehicleId);
    onNext(cidadeOrigemFinal, entradaFinal, localVehicleId);
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* ==================== SELEÇÃO DE ORIGEM ==================== */}
      <div>
        <label className="block font-semibold mb-1">
          A carga vem de Petrópolis?
        </label>
        <select
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Selecione uma opção
          </option>
          <option value="proprio-municipio">Sim, já está em Petrópolis</option>
          <option value="outro-municipio">Não, vem de outro local</option>
        </select>
      </div>

      {/* ==================== CAMPOS PARA "OUTRO MUNICÍPIO" ==================== */}
      {origem === 'outro-municipio' && (
        <>
          {/* Campo de origem com sugestões Mapbox */}
          <div className="relative">
            <label className="block font-semibold mb-1">Local de origem:</label>
            <input
              type="text"
              value={localOrigin}
              onChange={(e) => setLocalOrigin(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Digite de onde você está vindo (Ex: Rio de Janeiro - RJ)"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Sugestões do Mapbox */}
            {isFocused && suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-40 overflow-y-auto shadow">
                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => handleSelectSuggestion(place)}
                  >
                    {place}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Select de entrada da cidade */}
          <div>
            <label className="block font-semibold mb-1">
              Qual entrada irá utilizar para chegar à Petrópolis?
            </label>
            <select
              value={entryCity ?? ''}
              onChange={(e) => onEntryCityChange(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Selecione a Entrada
              </option>
              <option value="br040-quitandinha">
                BR-040 - Pórtico do Quitandinha
              </option>
              <option value="br040-bingen">BR-040 - Pórtico do Bingen</option>
              <option value="br040-duarte">BR-040 - Duarte da Silveira</option>
              <option value="br040-mosela">BR-040 - Mosela</option>
              <option value="br040-bonsucesso">
                BR-040 - Trevo de Bonsucesso
              </option>
              <option value="br040-itaipava">
                BR-040 - Itaipava (Arranha-Céu)
              </option>
              <option value="br040-pedro">BR-040 - Pedro do Rio</option>
              <option value="br040-barra">BR-040 - Barra Mansa</option>
              <option value="br495-teresopolis">
                BR-495 - Est. Teresópolis
              </option>
              <option value="rj107-serra">
                RJ-107 - Serra da Estrela (Serra Velha)
              </option>
              <option value="rj117-videiras">RJ-117 - Vale das Videiras</option>
              <option value="rj123-secretario">RJ-123 - Secretário</option>
              <option value="rj134-silveira">
                RJ-134 - Silveira da Motta (Posse)
              </option>
              <option value="est-uniao">
                Est. União e Indústria (Posse-Gaby)
              </option>
            </select>
          </div>
        </>
      )}

      {/* ==================== SELEÇÃO DE VEÍCULO ==================== */}
      <div>
        <label className="block font-semibold mb-1">Selecione o veículo:</label>
        <select
          value={localVehicleId}
          onChange={(e) => handleVehicleChange(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Selecione um veículo
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {`${v.name} (${v.plate})`}
            </option>
          ))}
          <option value="add-new" className="text-blue-600 font-semibold">
            Adicionar novo veículo
          </option>
        </select>
      </div>

      {/* ==================== BOTÕES ==================== */}
      <div className="flex justify-between mt-4">
        {onBack && (
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onBack}
          >
            Voltar
          </button>
        )}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleNext}
          disabled={
            !localVehicleId ||
            (origem === 'outro-municipio' && (!localOrigin || !entryCity))
          }
        >
          Próximo
        </button>
      </div>
    </div>
  );
}