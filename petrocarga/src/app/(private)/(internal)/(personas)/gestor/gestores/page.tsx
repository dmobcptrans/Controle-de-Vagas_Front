'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { Search, X, Users, CheckCircle, XCircle, Menu } from 'lucide-react';
import GestorCard from '@/features/usuarios/(personas)/gestores/components/cards/gestores-card';
import { Paginacao } from '@/components/paginacao/paginacao';
import { Button } from '@/components/ui/button';
import FloatingButton from '@/components/ui/floatingButton';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header/Header';
import { useGestores } from '@/features/usuarios/(personas)/gestores/hooks/useGestores';
import type { gestorParams } from '@/features/usuarios/(personas)/gestores/types/gestor';

const ITENS_POR_PAGINA = 9;

type FiltroStatus = 'ativos' | 'inativos' | 'todos';

/**
 * @function useDebounce
 * @description Atrasa a atualização de um valor para reduzir chamadas de API.
 */
function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * @component GestoresPage
 * @version 5.0.0
 *
 * @description Listagem de gestores. Os dados (gestores, loading, error,
 * totais) vêm do hook `useGestores`. A página só controla os filtros e a
 * página atual, e chama `buscar(params)` quando eles mudam.
 */
export default function GestoresPage() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const router = useRouter();

  // buscarAutomaticamente: false -> a página decide quando buscar,
  // porque o hook só busca sozinho uma vez, na montagem.
  const { gestores, loading, error, totalPaginas, totalElementos, buscar } =
    useGestores({ buscarAutomaticamente: false });

  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1); // 1-indexed na UI
  const [searchFocused, setSearchFocused] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos');

  const buscaDebounced = useDebounce(busca, 400);

  // --------------------------------------------------------------------------
  // PARÂMETROS DA BUSCA
  // --------------------------------------------------------------------------

  const montarParams = (): gestorParams => {
    const params: gestorParams = {
      // backend é 0-indexed; a UI é 1-indexed
      pagina: paginaAtual - 1,
      tamanhoPagina: ITENS_POR_PAGINA,
    };

    if (filtroStatus === 'ativos') params.ativo = true;
    if (filtroStatus === 'inativos') params.ativo = false;
    if (buscaDebounced.trim()) params.nome = buscaDebounced.trim();

    return params;
  };

  // Refaz a busca quando muda filtro, busca (debounced) ou página.
  // A página volta para 1 nos próprios handlers (e não em um effect),
  // evitando uma segunda requisição com a página antiga.
  useEffect(() => {
    if (!user?.id) return;
    buscar(montarParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, filtroStatus, buscaDebounced, paginaAtual]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleFiltroStatus = (status: FiltroStatus) => {
    setFiltroStatus(status);
    setPaginaAtual(1);
  };

  const mostrarTodos = () => {
    setFiltroStatus('todos');
    setBusca('');
    setPaginaAtual(1);
  };

  const limparBusca = () => {
    setBusca('');
    setPaginaAtual(1);
  };

  const filtrosAtivos = Boolean(busca) || filtroStatus !== 'todos';

  // --------------------------------------------------------------------------
  // ESTADO DE ERRO
  // --------------------------------------------------------------------------

  if (error && !gestores.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3">
              Erro ao carregar gestores
            </h2>
            <p className="text-gray-600 mb-6 text-xs sm:text-sm md:text-base">
              {error}
            </p>
            <button
              onClick={() => buscar(montarParams())}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header
        title="Gestores Cadastrados"
        subtitle="Gerencie e visualize todos os gestores do sistema"
      />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* CTA: busca + filtros */}
        <div className="-mt-4 mb-5 max-w-4xl mx-auto">
          <div
            className="bg-[#071D41] rounded-2xl border-l-4 border-[#FFCD07] overflow-hidden"
            style={{ boxShadow: '0 4px 16px rgba(7,29,65,0.18)' }}
          >
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                {/* Busca */}
                <div className="relative flex-1">
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all"
                    style={{
                      background: searchFocused
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(255,255,255,0.10)',
                      border: searchFocused
                        ? '1.5px solid rgba(255,205,7,.6)'
                        : '1.5px solid rgba(255,255,255,.12)',
                    }}
                  >
                    <Search
                      className="h-4 w-4"
                      style={{
                        color: searchFocused
                          ? '#FFCD07'
                          : 'rgba(255,255,255,.45)',
                      }}
                    />

                    <input
                      value={busca}
                      onChange={(e) => {
                        setBusca(e.target.value);
                        setPaginaAtual(1);
                      }}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="Buscar por nome..."
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                    />

                    {busca && (
                      <button onClick={limparBusca}>
                        <X className="h-3.5 w-3.5 text-white/70" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Menu */}
                <button
                  onClick={() => setFiltrosAbertos(!filtrosAbertos)}
                  className="relative cursor-pointer h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: filtrosAbertos
                      ? 'rgba(255,205,7,.18)'
                      : 'rgba(255,255,255,.10)',
                    border: filtrosAbertos
                      ? '1.5px solid rgba(255,205,7,.5)'
                      : '1.5px solid rgba(255,255,255,.12)',
                  }}
                >
                  <Menu
                    className={`h-5 w-5 text-white transition-transform duration-300 ${
                      filtrosAbertos ? 'rotate-90' : ''
                    }`}
                  />

                  {filtrosAtivos && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FFCD07]" />
                  )}
                </button>
              </div>
            </div>

            {/* Drawer interno */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                filtrosAbertos
                  ? 'max-h-[500px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="border-t border-white/10 px-5 py-5 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50 mb-3">
                    Status
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={filtroStatus === 'todos' ? 'default' : 'outline'}
                      onClick={() => handleFiltroStatus('todos')}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Todos
                    </Button>

                    <Button
                      variant={
                        filtroStatus === 'ativos' ? 'default' : 'outline'
                      }
                      onClick={() => handleFiltroStatus('ativos')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Ativos
                    </Button>

                    <Button
                      variant={
                        filtroStatus === 'inativos' ? 'default' : 'outline'
                      }
                      onClick={() => handleFiltroStatus('inativos')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Inativos
                    </Button>
                  </div>
                </div>

                {filtrosAtivos && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={mostrarTodos}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpar filtros
                  </Button>
                )}

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#FFCD07]" />

                    <span className="text-sm text-white/80">
                      {gestores.length} de {totalElementos} gestores
                    </span>
                  </div>

                  {filtrosAtivos && (
                    <span className="text-xs rounded-full bg-[#FFCD07] px-2 py-1 text-[#071D41] font-semibold">
                      Filtros ativos
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de carregamento durante filtros/paginação */}
        {loading && gestores.length > 0 && (
          <div className="mb-4 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              <span className="text-xs sm:text-sm text-blue-700">
                Aplicando filtros...
              </span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <Paginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalItens={totalElementos}
            itensPorPagina={ITENS_POR_PAGINA}
            itemLabel="gestor"
            itemLabelPlural="gestores"
            onPageChange={setPaginaAtual}
          />
        </div>

        {/* LISTA DE GESTORES */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {gestores.length === 0 ? (
            // Evita piscar "nenhum gestor" enquanto a primeira busca carrega
            !loading && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 md:p-12 text-center">
                {filtrosAtivos ? (
                  <div className="max-w-md mx-auto">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                      Nenhum gestor encontrado
                    </h3>
                    <p className="text-gray-600 mb-5 sm:mb-6 text-xs sm:text-sm md:text-base">
                      {busca
                        ? `Não encontramos gestores para "${busca}".`
                        : `Não encontramos gestores ${
                            filtroStatus === 'ativos' ? 'ativos' : 'inativos'
                          }.`}
                    </p>
                    <button
                      onClick={mostrarTodos}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      Ver todos os gestores
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                      Nenhum gestor cadastrado
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      Não há gestores cadastrados no sistema no momento.
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {gestores.map((gestor) => (
                <div key={gestor.usuario.id} className="h-full">
                  <GestorCard gestor={gestor} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <FloatingButton
        label="Adicionar Gestor"
        onClick={() => router.push('/gestor/adicionar-gestores')}
      />
    </div>
  );
}