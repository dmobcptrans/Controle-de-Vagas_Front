'use client';

import { Veiculo } from '@/lib/types/veiculo';
import { useState } from 'react';
import { useMapboxSuggestions } from '@/components/hooks/map/useMapboxSuggestions';

interface PlaceSuggestion {
  label: string;
}

interface StepVeiculoProps {
  tipoVeiculo: Veiculo['tipo'] | null;
  placa: string;
  cidadeOrigem: string;
  entradaCidade: string;
  mostrarDadosRota: boolean;
  vagaIncompativel: boolean;
  validandoVeiculo: boolean;
  onTipoVeiculoChange: (tipo: Veiculo['tipo']) => void;
  onPlacaChange: (placa: string) => void;
  onCidadeOrigemChange: (value: string) => void;
  onEntradaCidadeChange: (value: string) => void;
  onToggleDadosRota: () => void;
  onNext: () => void;
}

export default function StepVeiculo({
  tipoVeiculo,
  placa,
  cidadeOrigem,
  entradaCidade,
  mostrarDadosRota,
  vagaIncompativel,
  validandoVeiculo,
  onTipoVeiculoChange,
  onPlacaChange,
  onCidadeOrigemChange,
  onEntradaCidadeChange,
  onToggleDadosRota,
  onNext,
}: StepVeiculoProps) {
  const isDisabled =
    !tipoVeiculo || placa.length < 7 || vagaIncompativel || validandoVeiculo;
  const [isFocused, setIsFocused] = useState(false);
  const suggestions = useMapboxSuggestions(cidadeOrigem, true);

  return (
    <div className="flex flex-col gap-5 p-2">
      <h3 className="font-semibold mb-3 text-center">Informações do Veículo</h3>

      {/* Tipo de veículo */}
      <div>
        <p className="font-medium mb-1">Tipo de veículo</p>
        <select
          value={tipoVeiculo || ''}
          onChange={(e) =>
            onTipoVeiculoChange(e.target.value as Veiculo['tipo'])
          }
          className="w-full border rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">Selecione...</option>
          <option value="AUTOMOVEL">Carro - Até 5 metros</option>
          <option value="CAMINHONETA">Caminhonete - Até 6 metros</option>
          <option value="VUC">VUC - Até 8 metros</option>
          <option value="CAMINHAO_MEDIO">Caminhão médio - 9 a 12 metros</option>
          <option value="CAMINHAO_LONGO">
            Caminhão longo - 13 a 19 metros
          </option>
        </select>
      </div>

      {/* Placa */}
      <div>
        <p className="font-medium mb-1">Placa</p>
        <input
          value={placa}
          onChange={(e) => onPlacaChange(e.target.value.toUpperCase())}
          className="w-full border rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Digite a placa"
          maxLength={7}
        />
      </div>

      {/* Toggle dados de rota */}
      <button
        type="button"
        onClick={onToggleDadosRota}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors self-start"
      >
        <span
          className={`w-4 h-4 rounded border-2 border-blue-500 flex items-center justify-center transition-colors ${
            mostrarDadosRota ? 'bg-blue-500' : 'bg-white'
          }`}
        >
          {mostrarDadosRota && (
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </span>
        Adicionar cidade de origem e entrada na cidade
      </button>

      {/* Campos opcionais com animação */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          mostrarDadosRota ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-4 pt-1 pb-1">
          <div className="relative">
            <label className="block font-medium mb-1 text-sm text-gray-600">
              Local de origem
            </label>

            <input
              type="text"
              value={cidadeOrigem}
              onChange={(e) => onCidadeOrigemChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Digite de onde você está vindo"
              className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />

            {isFocused && suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-40 overflow-y-auto shadow">
                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                    onMouseDown={() => onCidadeOrigemChange(place.label)}
                  >
                    {place.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1 text-sm text-gray-600">
              Entrada na cidade
            </label>

            <select
              value={entradaCidade || ''}
              onChange={(e) => onEntradaCidadeChange(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
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
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isDisabled}
        className={`py-3 rounded-lg mt-2 font-semibold transition-opacity ${
          isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {validandoVeiculo ? 'Validando...' : 'Próximo'}
      </button>
    </div>
  );
}
