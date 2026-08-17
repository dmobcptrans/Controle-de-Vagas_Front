'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { VeiculoAPI } from '@/lib/types/veiculo';
import { useMapboxSuggestions } from '../hooks/map/useMapboxSuggestions';
import { getMotoristaEmpresaByUsuarioId } from '@/services/api/empresaApi';
import { Search, Check, TruckIcon, UserIcon, Loader2, Plus } from 'lucide-react';

interface MotoristaAPI {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
}

interface OriginVehicleStepProps {
  vehicles: VeiculoAPI[];
  origin: string;
  entryCity: string | null;
  selectedVehicleId?: string;

  /** Indica se o usuário logado é uma empresa (pode escolher o motorista da reserva) */
  isEmpresa?: boolean;
  /** Necessário para buscar motoristas vinculados à empresa */
  empresaId?: string;
  selectedDriverId?: string;

  onOriginChange: (value: string) => void;
  onEntryCityChange: (value: string | null) => void;
  onVehicleChange: (id: string) => void;
  onDriverChange?: (id: string) => void;

  onNext: (
    origin: string,
    entryCity: string | null,
    vehicleId: string,
    driverId?: string,
  ) => void;

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
          selecionado ? 'bg-blue-100 border-blue-200' : 'bg-gray-50 border-gray-100'
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
  isEmpresa = false,
  empresaId,
  selectedDriverId,
  onOriginChange,
  onEntryCityChange,
  onVehicleChange,
  onDriverChange,
  onNext,
  onBack,
}: OriginVehicleStepProps) {
  const router = useRouter();
  const [localOrigin, setLocalOrigin] = useState(origin);
  const [localVehicleId, setLocalVehicleId] = useState(selectedVehicleId || '');
  const [localDriverId, setLocalDriverId] = useState(selectedDriverId || '');
  const [isFocused, setIsFocused] = useState(false);
  const [origem, setOrigem] = useState('');

  // ==================== BUSCA DE VEÍCULO (client-side) ====================
  const [vehicleSearch, setVehicleSearch] = useState('');
  const veiculosFiltrados = useMemo(() => {
    const termo = vehicleSearch.trim().toLowerCase();
    if (!termo) return vehicles;
    return vehicles.filter((v) =>
      `${v.name} ${v.plate}`.toLowerCase().includes(termo),
    );
  }, [vehicles, vehicleSearch]);

  const veiculoSelecionado = useMemo(
    () => vehicles.find((v) => v.id === localVehicleId) ?? null,
    [vehicles, localVehicleId],
  );

  // ==================== BUSCA DE MOTORISTA (via API, debounced) ====================
  const [driverSearch, setDriverSearch] = useState('');
  const [driverResults, setDriverResults] = useState<MotoristaAPI[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<MotoristaAPI | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 useEffect(() => {
  if (!isEmpresa || !empresaId) {
    setDriverResults([]);
    return;
  }

  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }

  const termo = driverSearch.trim().toLowerCase();

  if (termo.length < 2) {
    setDriverResults([]);
    setLoadingDrivers(false);
    return;
  }

  setLoadingDrivers(true);

  debounceRef.current = setTimeout(async () => {
    try {
      // Busca os motoristas vinculados à empresa
      const result = await getMotoristaEmpresaByUsuarioId(
        empresaId,
        0,
        100,
      );

      // O retorno correto é "content"
      const motoristas = result.content ?? [];

      // Filtro local pelo nome, CPF ou telefone
      const filtrados = motoristas.filter((motorista: MotoristaAPI) => {
        const nome = motorista.nome?.toLowerCase() ?? '';
        const cpf = motorista.cpf?.toLowerCase() ?? '';
        const telefone = motorista.telefone?.toLowerCase() ?? '';

        return (
          nome.includes(termo) ||
          cpf.includes(termo) ||
          telefone.includes(termo)
        );
      });

      setDriverResults(filtrados);
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
      setDriverResults([]);
    } finally {
      setLoadingDrivers(false);
    }
  }, 400);

  return () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };
}, [driverSearch, isEmpresa, empresaId]);

  const suggestions = useMapboxSuggestions(localOrigin, true) as { label: string }[];

  // ==================== HANDLERS ====================
  const handleSelectSuggestion = (place: string) => {
    setLocalOrigin(place);
    onOriginChange(place);
    setIsFocused(false);
  };

  const handleSelectVehicle = (id: string) => {
    setLocalVehicleId(id);
  };

  const handleSelectDriver = (motorista: MotoristaAPI) => {
    setLocalDriverId(motorista.id);
    setMotoristaSelecionado(motorista);
    setDriverSearch(motorista.nome);
    setDriverResults([]);
  };

  const handleNext = () => {
    if (!localVehicleId) return;
    if (isEmpresa && !localDriverId) return;
    if (origem === 'outro-municipio' && (!localOrigin || !entryCity)) return;

    const cidadeOrigemFinal =
      origem === 'proprio-municipio' ? 'Petrópolis - RJ' : localOrigin;

    const entradaFinal = origem === 'proprio-municipio' ? null : entryCity;

    onOriginChange(cidadeOrigemFinal);
    onEntryCityChange(entradaFinal);
    onVehicleChange(localVehicleId);
    onDriverChange?.(localDriverId);

    onNext(cidadeOrigemFinal, entradaFinal, localVehicleId, localDriverId || undefined);
  };

  const podeAvancar =
    Boolean(localVehicleId) &&
    (!isEmpresa || Boolean(localDriverId)) &&
    !(origem === 'outro-municipio' && (!localOrigin || !entryCity));

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
          onChange={(e) => setOrigem(e.target.value)}
          className="w-full p-3 text-sm sm:text-base border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-800"
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
          <div className="relative">
            <label className="block font-semibold mb-1 text-sm sm:text-base">
              Local de origem:
            </label>
            <input
              type="text"
              value={localOrigin}
              onChange={(e) => setLocalOrigin(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Digite de onde você está vindo (Ex: Rio de Janeiro - RJ)"
              className="w-full p-3 text-sm sm:text-base border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => onEntryCityChange(e.target.value)}
              className="w-full p-3 text-sm sm:text-base border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Selecione a Entrada
              </option>
              <option value="br040-quitandinha">BR-040 - Pórtico do Quitandinha</option>
              <option value="br040-bingen">BR-040 - Pórtico do Bingen</option>
              <option value="br040-duarte">BR-040 - Duarte da Silveira</option>
              <option value="br040-mosela">BR-040 - Mosela</option>
              <option value="br040-bonsucesso">BR-040 - Trevo de Bonsucesso</option>
              <option value="br040-itaipava">BR-040 - Itaipava (Arranha-Céu)</option>
              <option value="br040-pedro">BR-040 - Pedro do Rio</option>
              <option value="br040-barra">BR-040 - Barra Mansa</option>
              <option value="br495-teresopolis">BR-495 - Est. Teresópolis</option>
              <option value="rj107-serra">RJ-107 - Serra da Estrela (Serra Velha)</option>
              <option value="rj117-videiras">RJ-117 - Vale das Videiras</option>
              <option value="rj123-secretario">RJ-123 - Secretário</option>
              <option value="rj134-silveira">RJ-134 - Silveira da Motta (Posse)</option>
              <option value="est-uniao">Est. União e Indústria (Posse-Gaby)</option>
            </select>
          </div>
        </>
      )}

      {/* ==================== SELEÇÃO DE MOTORISTA (apenas empresa) ==================== */}
      {isEmpresa && (
        <div>
          <label className="block font-semibold mb-1 text-sm sm:text-base">
            Selecione o motorista:
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={driverSearch}
              onChange={(e) => {
                setDriverSearch(e.target.value);
                if (localDriverId) {
                  setLocalDriverId('');
                  setMotoristaSelecionado(null);
                }
              }}
              placeholder="Digite o nome do motorista..."
              className="w-full pl-9 pr-3 py-3 text-sm sm:text-base rounded-2xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
            />
            {loadingDrivers && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Motorista já selecionado */}
          {motoristaSelecionado && localDriverId && (
            <div className="mt-2">
              <OptionCard
                selecionado
                icon={<UserIcon className="w-5 h-5 text-blue-600" />}
                title={motoristaSelecionado.nome}
                subtitle={motoristaSelecionado.cpf || motoristaSelecionado.telefone}
                onClick={() => {}}
              />
            </div>
          )}

          {/* Resultados da busca */}
          {!localDriverId && driverSearch.trim().length >= 2 && (
            <div className="mt-2 max-h-[220px] overflow-y-auto space-y-2 pr-0.5">
              {loadingDrivers ? (
                <p className="text-xs text-gray-400 text-center py-4">Buscando...</p>
              ) : driverResults.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  Nenhum motorista encontrado.
                </p>
              ) : (
                driverResults.map((m) => (
                  <OptionCard
                    key={m.id}
                    selecionado={false}
                    icon={<UserIcon className="w-5 h-5 text-gray-400" />}
                    title={m.nome}
                    subtitle={m.cpf || m.telefone}
                    onClick={() => handleSelectDriver(m)}
                  />
                ))
              )}
            </div>
          )}

          {!localDriverId && driverSearch.trim().length > 0 && driverSearch.trim().length < 2 && (
            <p className="text-xs text-gray-400 mt-1.5 px-0.5">
              Digite ao menos 2 letras para buscar.
            </p>
          )}
        </div>
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
          {veiculosFiltrados.length === 0 ? (
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
                      v.id === localVehicleId ? 'text-blue-600' : 'text-gray-400'
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
            onClick={() => router.push('/veiculos/cadastrar-veiculos')}
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