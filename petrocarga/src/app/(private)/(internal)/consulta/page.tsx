'use client';

import { useState } from 'react';

import {
  Search,
  Loader2,
  Car,
  AlertCircle,
  Info,
} from 'lucide-react';

import Link from 'next/link';

import { getReservasPorPlaca } from '@/services/api/reservaApi';

import { ReservaPlaca } from '@/lib/types/reservas/reservaPlaca';

import ReservaPlacaCard from '@/components/agente/cards/reservaPlaca-card';

import { Header } from '@/components/ui/Header/Header';

import { CTASearch } from '@/components/ui/CTA/search/CTASearch';

// ============================================================
// CONSTANTES
// ============================================================

const PLACA_MAX_LENGTH = 7;

const ERROR_MESSAGES = {
  PLACA_VAZIA: 'Por favor, digite uma placa válida.',
  BUSCA_FALHOU: 'Erro ao buscar reservas por placa.',
};

const INFO_MESSAGES = {
  TITULO: 'Consultar Placa',

  DESCRICAO:
    'Busque reservas ativas ou reservadas de um veículo.',

  SEM_RESULTADOS: (placa: string) =>
    `Não foram encontradas reservas para a placa ${placa}. Verifique se a placa está correta e tente novamente.`,

  RESULTADOS_ENCONTRADOS: (count: number, placa: string) =>
    `Encontradas ${count} reserva${count !== 1 ? 's' : ''} para a placa ${placa}`,

  MOSTRANDO_RESULTADOS: (count: number) =>
    `Mostrando ${count} reserva${count !== 1 ? 's' : ''}`,
};

// ============================================================
// UTILITÁRIOS
// ============================================================

function formatarPlaca(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, PLACA_MAX_LENGTH);
}

// ============================================================
// COMPONENTE
// ============================================================

export default function ConsultarPlacaPage() {
  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [placa, setPlaca] = useState('');

  const [reservas, setReservas] = useState<ReservaPlaca[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [searched, setSearched] = useState(false);

  // ==========================================================
  // ALTERAÇÃO DA PLACA
  // ==========================================================

  const handlePlacaChange = (value: string) => {
    const placaFormatada = formatarPlaca(value);

    setPlaca(placaFormatada);

    // Se o usuário começar a alterar a placa depois de
    // uma busca, limpamos o estado anterior.
    if (searched) {
      setSearched(false);
      setReservas([]);
      setError(null);
    }
  };

  // ==========================================================
  // BUSCA
  // ==========================================================

  const handleSearch = async () => {
    const placaBusca = formatarPlaca(placa);

    if (!placaBusca) {
      setError(ERROR_MESSAGES.PLACA_VAZIA);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const resultado = await getReservasPorPlaca(placaBusca);

      setReservas(resultado ?? []);
    } catch (err) {
      console.error('Erro ao consultar placa:', err);

      setReservas([]);

      setError(
        err instanceof Error
          ? err.message
          : ERROR_MESSAGES.BUSCA_FALHOU,
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RESULTADO
  // ==========================================================

  const renderResultado = () => {
    // --------------------------------------------------------
    // LOADING
    // --------------------------------------------------------

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />

          <span className="text-sm text-gray-500">
            Buscando reservas para a placa{' '}
            <span className="font-semibold text-gray-700">
              {placa}
            </span>
            ...
          </span>
        </div>
      );
    }

    // --------------------------------------------------------
    // ERRO
    // --------------------------------------------------------

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-gray-800">
              Erro na busca
            </h3>

            <p className="mx-auto max-w-xs text-xs text-gray-400">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="
              rounded-lg border border-[#1351B4]
              px-4 py-2 text-xs font-medium
              text-[#1351B4]
              transition-colors
              hover:bg-blue-50
            "
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    // --------------------------------------------------------
    // ESTADO INICIAL
    // --------------------------------------------------------

    if (!searched) {
      return (
        <div className="flex w-full flex-col items-center gap-5 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
            <Search className="h-7 w-7 text-[#1351B4]" />
          </div>

          <div>
            <h3 className="mb-1 text-base font-semibold text-gray-800">
              {INFO_MESSAGES.TITULO}
            </h3>

            <p className="mx-auto max-w-xs text-sm text-gray-400">
              {INFO_MESSAGES.DESCRICAO}
            </p>
          </div>

          <div className="mt-1 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5 text-left">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                ✓ Informações incluídas
              </p>

              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Detalhes do motorista</li>
                <li>• Informações do veículo</li>
                <li>• Localização da vaga</li>
                <li>• Datas de início e fim</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 text-left">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                ⚡ Busca rápida
              </p>

              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Caixa alta automática</li>
                <li>• Limite de 7 caracteres</li>
                <li>• Busca por placa</li>
                <li>• Resultados em tempo real</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // --------------------------------------------------------
    // SEM RESULTADOS
    // --------------------------------------------------------

    if (reservas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50">
            <Car className="h-7 w-7 text-gray-300" />
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-gray-700">
              Nenhuma reserva encontrada
            </h3>

            <p className="mx-auto max-w-xs text-xs text-gray-400">
              {INFO_MESSAGES.SEM_RESULTADOS(placa)}
            </p>
          </div>
        </div>
      );
    }

    // --------------------------------------------------------
    // COM RESULTADOS
    // --------------------------------------------------------

    return (
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Resultados
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {INFO_MESSAGES.RESULTADOS_ENCONTRADOS(
              reservas.length,
              placa,
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {reservas.map((reserva) => (
            <ReservaPlacaCard
              key={reserva.id}
              reserva={reserva}
            />
          ))}
        </div>

        <p className="pt-2 text-center text-[11px] text-gray-400">
          {INFO_MESSAGES.MOSTRANDO_RESULTADOS(reservas.length)}
        </p>
      </div>
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header
        title="Consultar Placa"
        subtitle="Digite a placa para consultar reservas"
      />

      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-8">
        {/* ================================================== */}
        {/* BUSCA */}
        {/* ================================================== */}

        <div>
          <CTASearch
            value={placa}
            onChange={handlePlacaChange}
            placeholder="Digite a placa (ABC1234)"
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        {/* ================================================== */}
        {/* RESULTADOS */}
        {/* ================================================== */}

        {renderResultado()}

        {/* ================================================== */}
        {/* TUTORIAL */}
        {/* ================================================== */}

        <div className="mt-6">
          <Link
            href="/agente/tutorial#consultaplaca"
            className="
              group flex w-full items-center gap-4
              rounded-xl border border-gray-100
              border-l-4 border-l-[#1351B4]
              bg-white p-4
              transition-colors
              hover:bg-blue-50/30
            "
          >
            <div
              className="
                flex h-11 w-11 flex-shrink-0
                items-center justify-center
                rounded-xl bg-blue-50
                transition-colors
                group-hover:bg-blue-100
              "
            >
              <Info className="h-5 w-5 text-[#1351B4]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#071D41]">
                Novo por aqui?
              </p>

              <p className="mt-0.5 text-xs text-gray-500">
                Aprenda a buscar reservas por placa de forma eficiente
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

