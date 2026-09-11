'use client';

import { useEffect, useRef, useState } from 'react';
import { getMotoristaEmpresaByUsuarioId } from '@/features/usuarios/(personas)/empresas/services/empresaApi';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  UserIcon,
} from 'lucide-react';

interface MotoristaAPI {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  ativo?: boolean;
}

interface MotoristaStepProps {
  empresaId: string;
  selectedDriverId?: string;
  onDriverChange: (id: string) => void;
}

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
          <p className="text-xs text-gray-500 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {selecionado && (
        <Check className="w-5 h-5 text-blue-600 shrink-0" />
      )}
    </button>
  );
}

export default function MotoristaStep({
  empresaId,
  selectedDriverId,
  onDriverChange,
}: MotoristaStepProps) {
  const [driverSearch, setDriverSearch] = useState('');
  const [driverResults, setDriverResults] = useState<MotoristaAPI[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const [motoristaSelecionado, setMotoristaSelecionado] =
    useState<MotoristaAPI | null>(null);

  // ==================== PAGINAÇÃO ====================

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const TAMANHO_PAGINA = 10;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==================== BUSCA MOTORISTAS ====================

  useEffect(() => {
    if (!empresaId) {
      setDriverResults([]);
      setTotalPaginas(0);
      setTotalElementos(0);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const termo = driverSearch.trim();

    // Não busca enquanto estiver digitando apenas 1 caractere
    if (termo.length === 1) {
      setDriverResults([]);
      setLoadingDrivers(false);
      return;
    }

    setLoadingDrivers(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await getMotoristaEmpresaByUsuarioId(
          empresaId,
          pagina,
          TAMANHO_PAGINA,
          termo || undefined,
          true, // somente ativos
        );

        const motoristas = result.content ?? [];

        setDriverResults(motoristas);

        setTotalPaginas(result.totalPaginas ?? 0);
        setTotalElementos(result.totalElementos ?? 0);
      } catch (error) {
        console.error('Erro ao buscar motoristas:', error);

        setDriverResults([]);
        setTotalPaginas(0);
        setTotalElementos(0);
      } finally {
        setLoadingDrivers(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [driverSearch, empresaId, pagina]);

  // ==================== RESET AO TROCAR EMPRESA ====================

  useEffect(() => {
    if (!empresaId) return;

    setPagina(0);
    setMotoristaSelecionado(null);
    setDriverSearch('');
  }, [empresaId]);

  // ==================== SELECIONAR MOTORISTA ====================

  const handleSelectDriver = (motorista: MotoristaAPI) => {
    setMotoristaSelecionado(motorista);
    setDriverSearch(motorista.nome);
    setDriverResults([]);

    onDriverChange(motorista.id);
  };

  // ==================== PESQUISA ====================

  const handleSearchChange = (value: string) => {
    setDriverSearch(value);

    if (motoristaSelecionado) {
      setMotoristaSelecionado(null);
    }

    // Nova pesquisa sempre começa da primeira página
    if (pagina !== 0) {
      setPagina(0);
    }
  };

  // ==================== PAGINAÇÃO ====================

  const handlePaginaAnterior = () => {
    if (pagina > 0) {
      setPagina((prev) => prev - 1);
    }
  };

  const handleProximaPagina = () => {
    if (pagina < totalPaginas - 1) {
      setPagina((prev) => prev + 1);
    }
  };

  const mostrarPaginacao =
    !motoristaSelecionado &&
    !loadingDrivers &&
    totalPaginas > 1;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-xl mx-auto px-2 sm:px-0">
      <p className="font-semibold mb-2 sm:mb-3 text-center text-base sm:text-lg">
        Selecione o motorista
      </p>

      <div>
        <label className="block font-semibold mb-1 text-sm sm:text-base">
          Motorista:
        </label>

        {/* ==================== PESQUISA ==================== */}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

          <input
            type="text"
            value={driverSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Pesquisar motorista por nome"
            className="w-full pl-9 pr-10 py-3 text-sm sm:text-base rounded-2xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
          />

          {loadingDrivers && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>

        {/* ==================== STATUS ==================== */}

        <div className="mt-2 flex items-center gap-2">


          {totalElementos > 0 && (
            <span className="text-xs text-gray-400">
              {totalElementos} motorista
              {totalElementos !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ==================== MOTORISTA SELECIONADO ==================== */}

        {motoristaSelecionado && selectedDriverId && (
          <div className="mt-2">
            <OptionCard
              selecionado
              icon={
                <UserIcon className="w-5 h-5 text-blue-600" />
              }
              title={motoristaSelecionado.nome}
              subtitle={
                motoristaSelecionado.cpf ||
                motoristaSelecionado.telefone
              }
              onClick={() => {}}
            />
          </div>
        )}

        {/* ==================== RESULTADOS ==================== */}

        {!motoristaSelecionado && (
          <div className="mt-2 max-h-[300px] overflow-y-auto space-y-2 pr-0.5">
            {loadingDrivers ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />

                <p className="text-xs text-gray-400">
                  Buscando motoristas...
                </p>
              </div>
            ) : driverResults.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                {driverSearch.trim()
                  ? 'Nenhum motorista encontrado.'
                  : 'Nenhum motorista ativo encontrado.'}
              </p>
            ) : (
              driverResults.map((motorista) => (
                <OptionCard
                  key={motorista.id}
                  selecionado={false}
                  icon={
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  }
                  title={motorista.nome}
                  subtitle={
                    motorista.cpf ||
                    motorista.telefone
                  }
                  onClick={() =>
                    handleSelectDriver(motorista)
                  }
                />
              ))
            )}
          </div>
        )}

        {/* ==================== PAGINAÇÃO ==================== */}

        {mostrarPaginacao && (
          <div className="flex items-center justify-between mt-3 px-1">
            <button
              type="button"
              onClick={handlePaginaAnterior}
              disabled={pagina === 0 || loadingDrivers}
              className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Página{' '}
                <span className="font-semibold text-gray-800">
                  {pagina + 1}
                </span>{' '}
                de{' '}
                <span className="font-semibold text-gray-800">
                  {totalPaginas}
                </span>
              </p>

              <p className="text-[11px] text-gray-400 mt-0.5">
                {totalElementos} ativos
              </p>
            </div>

            <button
              type="button"
              onClick={handleProximaPagina}
              disabled={
                pagina >= totalPaginas - 1 ||
                loadingDrivers
              }
              className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}