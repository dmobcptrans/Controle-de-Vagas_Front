'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { VeiculoAPI } from '@/lib/types/veiculo';
import { useMapboxSuggestions } from '../hooks/map/useMapboxSuggestions';
import { Search, Check, TruckIcon, Plus } from 'lucide-react';

interface OriginVehicleStepProps {
  vehicles: VeiculoAPI[];
  origin: string;
  entryCity: string | null;
  selectedVehicleId?: string;

  motoristaId?: string;
  isEmpresa?: boolean;

  onOriginChange: (value: string) => void;
  onEntryCityChange: (value: string | null) => void;
  onVehicleChange: (id: string) => void;

  onNext: (origin: string, entryCity: string | null, vehicleId: string) => void;

  onBack?: () => void;
}

// ============================================================================
// COMPONENTE AUXILIAR: Card de opção selecionável
// ============================================================================
function OptionCard({
  selecionado,
  icon,
  title,
  subtitle,
  onClick,
}: {
  selecionado: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
        selecionado
          ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border ${
          selecionado
            ? 'bg-blue-100 border-blue-200'
            : 'bg-gray-50 border-gray-100'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 tracking-wide truncate">
          {title}
        </p>

        {subtitle && (
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        )}
      </div>

      {selecionado && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
    </button>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function OriginVehicleStep({
  vehicles,
  origin,
  entryCity,
  selectedVehicleId,
  motoristaId,
  isEmpresa = false,
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
  const [origem, setOrigem] = useState(
    origin === 'Petrópolis - RJ'
      ? 'proprio-municipio'
      : origin
        ? 'outro-municipio'
        : '',
  );
  // ==================== BUSCA DE VEÍCULO ====================
  const [vehicleSearch, setVehicleSearch] = useState('');

  const veiculosFiltrados = useMemo(() => {
    const termo = vehicleSearch.trim().toLowerCase();

    if (!termo) {
      return vehicles;
    }

    return vehicles.filter((v) =>
      `${v.name} ${v.plate}`.toLowerCase().includes(termo),
    );
  }, [vehicles, vehicleSearch]);

  const veiculoSelecionado = useMemo(
    () => vehicles.find((v) => v.id === localVehicleId) ?? null,
    [vehicles, localVehicleId],
  );

  const suggestions = useMapboxSuggestions(localOrigin, true) as {
    label: string;
  }[];

  // ==================== HANDLERS ====================

  const handleSelectSuggestion = (place: string) => {
    setLocalOrigin(place);
    onOriginChange(place);
    setIsFocused(false);
  };

  const handleSelectVehicle = (id: string) => {
    setLocalVehicleId(id);
  };

  const handleNext = () => {
    // Origem não selecionada
    if (!origem) {
      return;
    }

    // Veículo obrigatório
    if (!localVehicleId) {
      return;
    }

    // Se vier de outro município, os dois campos são obrigatórios
    if (origem === 'outro-municipio') {
      if (!localOrigin.trim()) {
        return;
      }

      if (!entryCity) {
        return;
      }
    }

    const cidadeOrigemFinal =
      origem === 'proprio-municipio' ? 'Petrópolis - RJ' : localOrigin.trim();

    const entradaFinal = origem === 'proprio-municipio' ? null : entryCity;

    onOriginChange(cidadeOrigemFinal);
    onEntryCityChange(entradaFinal);
    onVehicleChange(localVehicleId);

    onNext(cidadeOrigemFinal, entradaFinal, localVehicleId);
  };

  const origemValida =
    origem === 'proprio-municipio' ||
    (origem === 'outro-municipio' &&
      Boolean(localOrigin.trim()) &&
      Boolean(entryCity));

  const veiculoValido = Boolean(localVehicleId);

  const podeAvancar = Boolean(origem) && origemValida && veiculoValido;

  const adicionarVeiculoUrl =
    isEmpresa && motoristaId
      ? `/empresa/motoristas/${motoristaId}`
      : '/meus-veiculos';

  return (
    <div className="flex flex-col gap-3 sm:gap-4 justify-center w-full max-w-xl mx-auto px-2 sm:px-0">
      <p className="font-semibold mb-2 sm:mb-3 text-center text-base sm:text-lg">
        Preencha os dados de origem
      </p>

      {/* ==================== SELEÇÃO DE ORIGEM ==================== */}
      <div>
        <label className="block font-semibold mb-1 text-sm sm:text-base">
          A carga vem de Petrópolis?
        </label>

        <select
          value={origem}
          onChange={(e) => {
            const novoValor = e.target.value;

            setOrigem(novoValor);

            if (novoValor === 'proprio-municipio') {
              setLocalOrigin('');
              onOriginChange('Petrópolis - RJ');
              onEntryCityChange(null);
            }

            if (novoValor === 'outro-municipio') {
              onOriginChange('');
              onEntryCityChange(null);
            }
          }}
          className={`w-full p-3 text-sm sm:text-base border rounded-2xl focus:outline-none focus:ring-2 ${
            !origem
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-200 focus:ring-blue-800'
          }`}
        >
          <option value="" disabled>
            Selecione uma opção
          </option>

          <option value="proprio-municipio">Sim, já está em Petrópolis</option>

          <option value="outro-municipio">Não, vem de outro local</option>
        </select>
      </div>

      {/* ==================== CAMPOS PARA OUTRO MUNICÍPIO ==================== */}
      {origem === 'outro-municipio' && (
        <>
          <div className="relative">
            <label className="block font-semibold mb-1 text-sm sm:text-base">
              Local de origem:
            </label>

            <input
              type="text"
              value={localOrigin}
              onChange={(e) => {
                setLocalOrigin(e.target.value);
                onOriginChange(e.target.value);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Digite de onde você está vindo (Ex: Rio de Janeiro - RJ)"
              className={`w-full p-3 text-sm sm:text-base border rounded-2xl focus:outline-none focus:ring-2 ${
                !localOrigin.trim()
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
            />

            {isFocused && suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-40 overflow-y-auto shadow text-sm sm:text-base">
                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => handleSelectSuggestion(place.label)}
                  >
                    {place.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1 text-sm sm:text-base">
              Qual entrada irá utilizar para chegar à Petrópolis?
            </label>

            <select
              value={entryCity ?? ''}
              onChange={(e) => {
                onEntryCityChange(e.target.value || null);
              }}
              className="w-full p-3 text-sm sm:text-base border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <label className="block font-semibold mb-1 text-sm sm:text-base">
          Selecione o veículo:
        </label>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

          <input
            type="text"
            value={vehicleSearch}
            onChange={(e) => setVehicleSearch(e.target.value)}
            placeholder="Buscar por placa ou nome do veículo..."
            className="w-full pl-9 pr-3 py-3 text-sm sm:text-base rounded-2xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="max-h-[240px] overflow-y-auto space-y-2 pr-0.5">
          {vehicles.length === 0 && isEmpresa ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <TruckIcon className="w-8 h-8 mx-auto mb-2 text-amber-500" />

              <p className="text-sm font-semibold text-gray-800">
                Motorista sem veículo vinculado.
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Adicione um veículo para continuar com a reserva.
              </p>
            </div>
          ) : veiculosFiltrados.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Nenhum veículo encontrado.
            </p>
          ) : (
            veiculosFiltrados.map((v) => (
              <OptionCard
                key={v.id}
                selecionado={v.id === localVehicleId}
                icon={
                  <TruckIcon
                    className={`w-5 h-5 ${
                      v.id === localVehicleId
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                }
                title={v.plate}
                subtitle={v.name}
                onClick={() => handleSelectVehicle(v.id)}
              />
            ))
          )}

          {/* Adicionar novo veículo */}
          <button
            type="button"
            onClick={() => router.push(adicionarVeiculoUrl)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-blue-300 text-left text-blue-600 hover:bg-blue-50/60 transition-all"
          >
            <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-100">
              <Plus className="w-5 h-5" />
            </div>

            <p className="text-sm font-semibold">Adicionar novo veículo</p>
          </button>
        </div>

        {veiculoSelecionado && (
          <p className="text-xs text-gray-500 mt-2 px-0.5">
            Veículo selecionado:{' '}
            <span className="font-semibold text-gray-800">
              {veiculoSelecionado.plate}
            </span>
          </p>
        )}
      </div>

      {/* ==================== BOTÕES ==================== */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-0 mt-4">
        {onBack && (
          <button
            className="w-full sm:w-auto px-4 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
            onClick={onBack}
          >
            Voltar
          </button>
        )}

        <button
          className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={!podeAvancar}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
