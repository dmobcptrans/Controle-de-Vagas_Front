'use client';

import { ViewMap } from '@/features/map/components/viewMap';
import { useEffect, useState } from 'react';
import { ListaVagas } from '@/features/vaga/vagas/components/(gestor)/listaVagas';
import { CheckCircle, Info, ParkingSquare, XCircle } from 'lucide-react';
import Link from 'next/link';
import FloatingButton from '@/components/ui/floatingButton';
import { useRouter } from 'next/navigation';
import { CTASearch } from '@/components/ui/CTA/search/CTASearch';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/Header/Header';

type FiltroVaga = 'todas' | 'disponiveis' | 'indisponiveis';

export default function Page() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const [selectedPlace, setSelectedPlace] = useState(null);

  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [filtroVaga, setFiltroVaga] = useState<FiltroVaga>('todas');

  const router = useRouter();

  const [firstCoord, setFirstCoord] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // --------------------------------------------------------------------------
  // BUSCA
  // --------------------------------------------------------------------------

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(inputValue.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputValue]);

  // --------------------------------------------------------------------------
  // FILTROS
  // --------------------------------------------------------------------------

  const handleFiltroVaga = (filtro: FiltroVaga) => {
    setFiltroVaga(filtro);
    setFirstCoord(null);
  };

  const limparFiltros = () => {
    setInputValue('');
    setSearchQuery('');
    setFiltroVaga('todas');
    setFirstCoord(null);
  };

  const hasActiveFilters = Boolean(inputValue.trim()) || filtroVaga !== 'todas';

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ── */}
      <Header
        title="Visualizar Vagas"
        subtitle="Gerencie e visualize todas as vagas do sistema"
      />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* ── Barra de Pesquisa + Filtros ── */}
        <CTASearch
          value={inputValue}
          onChange={(value) => {
            setInputValue(value);
            setFirstCoord(null);
          }}
          placeholder="Buscar por logradouro, bairro ou referência..."
          hasActiveFilters={hasActiveFilters}
          onClearFilters={limparFiltros}
          filters={
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50 mb-3">
                Disponibilidade
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* TODAS */}
                <Button
                  type="button"
                  variant={filtroVaga === 'todas' ? 'default' : 'outline'}
                  onClick={() => handleFiltroVaga('todas')}
                >
                  <ParkingSquare className="mr-2 h-4 w-4" />
                  Todas
                </Button>

                {/* DISPONÍVEIS */}
                <Button
                  type="button"
                  variant={filtroVaga === 'disponiveis' ? 'default' : 'outline'}
                  onClick={() => handleFiltroVaga('disponiveis')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Disponíveis
                </Button>

                {/* INDISPONÍVEIS */}
                <Button
                  type="button"
                  variant={
                    filtroVaga === 'indisponiveis' ? 'default' : 'outline'
                  }
                  onClick={() => handleFiltroVaga('indisponiveis')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Indisponíveis
                </Button>
              </div>
            </div>
          }
          filterSummary={
            <div className="flex items-center gap-2">
              <ParkingSquare className="h-4 w-4 text-[#FFCD07]" />

              <span className="text-sm text-white/80">
                {filtroVaga === 'todas' && 'Mostrando todas as vagas'}

                {filtroVaga === 'disponiveis' && 'Mostrando vagas disponíveis'}

                {filtroVaga === 'indisponiveis' &&
                  'Mostrando vagas indisponíveis'}
              </span>
            </div>
          }
        />

        {/* ── Layout principal: Mapa + Lista ── */}
        <div className="flex flex-col bg-white gap-3 p-2 mb-4 rounded-2xl shadow-md">
          {/* Mapa */}
          <div className="flex-1">
            <ViewMap
              selectedPlace={selectedPlace}
              searchQuery={searchQuery}
              firstCoord={firstCoord}
              filtro={filtroVaga}
            />
          </div>

          {/* Lista de Vagas */}
          <div className="flex-1 flex flex-col h-[70vh] p-4">
            <ListaVagas
              searchQuery={searchQuery}
              filtro={filtroVaga}
              onSelectFirstCoordinate={(coord) => setFirstCoord(coord)}
            />
          </div>
        </div>

        {/* ── Tutorial ── */}
        <Link
          href="/gestor/tutorial#disponibilidade"
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
          <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-[#1351B4]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#071D41]">
              Novo por aqui?
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
              Veja como usar o sistema em 3 passos simples
            </p>
          </div>
        </Link>
      </main>

      <FloatingButton
        label="Adicionar Vaga"
        onClick={() => router.push('/gestor/adicionar-vagas')}
      />
    </div>
  );
}
