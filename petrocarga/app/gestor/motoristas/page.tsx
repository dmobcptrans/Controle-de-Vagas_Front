'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/hooksGerais/useAuth';
import { getMotoristas } from '@/lib/api/motoristaApi';
import { FiltrosMotorista } from '@/lib/types/motorista';
import {
  Loader2,
  Search,
  X,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Motorista } from '@/lib/types/motorista';
import MotoristaCard from '@/components/gestor/cards/motoristas-card';

const ITENS_POR_PAGINA = 9;

export default function MotoristasPage() {
  const { user } = useAuth();
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [mostrarAtivos, setMostrarAtivos] = useState<boolean | null>(null);
  const [isLoadingMotoristas, setIsLoadingMotoristas] = useState(false);

  // Buscar motoristas com filtros
  const fetchMotoristas = useCallback(
    async (ativo?: boolean | null) => {
      if (!user?.id) return;

      setIsLoadingMotoristas(true);
      setError(null);

      try {
        const filtros: FiltrosMotorista = {};
        if (ativo !== null) {
          filtros.ativo = ativo;
        }

        const result = await getMotoristas(filtros);
        if (result.error) {
          setError(result.message || 'Erro ao carregar os motoristas');
        } else {
          setMotoristas(result.motoristas || []);
        }
      } catch (err) {
        setError(
          'Erro ao buscar os motoristas cadastrados. Tente novamente mais tarde.',
        );
      } finally {
        setIsLoadingMotoristas(false);
        setLoading(false);
      }
    },
    [user?.id],
  );

  // Buscar motoristas inicialmente
  useEffect(() => {
    fetchMotoristas();
  }, [fetchMotoristas]);

  // Alternar filtro de ativos
  const toggleAtivos = () => {
    if (mostrarAtivos === null) {
      setMostrarAtivos(true); // Mostrar apenas ativos
    } else if (mostrarAtivos === true) {
      setMostrarAtivos(false); // Mostrar apenas inativos
    } else {
      setMostrarAtivos(null); // Mostrar todos
    }
  };

  // Aplicar filtro quando mostrarAtivos mudar
  useEffect(() => {
    if (!loading) {
      setPaginaAtual(1);
      fetchMotoristas(mostrarAtivos);
    }
  }, [fetchMotoristas, loading, mostrarAtivos]);

  // Limpar filtros (mostrar todos)
  const mostrarTodos = () => {
    setMostrarAtivos(null);
    setBusca('');
    setPaginaAtual(1);
    fetchMotoristas(null);
  };

  // Filtrar motoristas localmente para busca rápida
  const motoristasFiltrados = useMemo(() => {
    if (!busca.trim()) return motoristas;

    const termoBusca = busca.toLowerCase().trim();
    return motoristas.filter(
      (motorista) =>
        motorista.usuario.nome.toLowerCase().includes(termoBusca) ||
        motorista.usuario.email.toLowerCase().includes(termoBusca) ||
        (motorista.usuario.telefone &&
          motorista.usuario.telefone.includes(termoBusca)) ||
        (motorista.numeroCnh &&
          motorista.numeroCnh.toLowerCase().includes(termoBusca)) ||
        false,
    );
  }, [motoristas, busca]);

  // Cálculos de paginação
  const totalPaginas = Math.ceil(motoristasFiltrados.length / ITENS_POR_PAGINA);

  const motoristasPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return motoristasFiltrados.slice(inicio, fim);
  }, [motoristasFiltrados, paginaAtual]);

  // Resetar para página 1 quando buscar
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  const irParaPagina = (pagina: number) => {
    setPaginaAtual(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  const irParaPrimeiraPagina = () => irParaPagina(1);
  const irParaUltimaPagina = () => irParaPagina(totalPaginas);
  const irParaPaginaAnterior = () => irParaPagina(paginaAtual - 1);
  const irParaProximaPagina = () => irParaPagina(paginaAtual + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="relative mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin" />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full border-4 border-gray-50 flex items-center justify-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Carregando motoristas
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Buscando informações dos motoristas...
          </p>
        </div>
      </div>
    );
  }

  if (error && !motoristas.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
              Erro ao carregar motoristas
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => fetchMotoristas(mostrarAtivos)}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Cabeçalho */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Motoristas Cadastrados
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Gerencie e visualize todos os motoristas do sistema
              </p>
            </div>
          </div>

          {/* Barra de busca e filtros */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Barra de busca */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome, email, telefone ou CNH..."
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm sm:text-base"
                  />
                  {busca && (
                    <button
                      onClick={() => setBusca('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg p-1 transition-colors"
                      title="Limpar busca"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-3">
                {/* Filtro de Ativos/Inativos */}
                <button
                  onClick={toggleAtivos}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                    mostrarAtivos === true
                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      : mostrarAtivos === false
                        ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {mostrarAtivos === true
                      ? 'Ativos'
                      : mostrarAtivos === false
                        ? 'Inativos'
                        : 'Todos'}
                  </span>
                  {mostrarAtivos !== null && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        mostrarAtivos === true ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    ></span>
                  )}
                </button>

                {/* Botão para limpar todos os filtros */}
                {(busca || mostrarAtivos !== null) && (
                  <button
                    onClick={mostrarTodos}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    Limpar Filtros
                  </button>
                )}

                {/* Estatísticas */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {motoristas.length} motoristas
                  </span>
                </div>
              </div>
            </div>

            {/* Informação dos filtros aplicados */}
            {(busca || mostrarAtivos !== null) && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-sm text-gray-600">
                  {busca ? (
                    <>
                      Resultados para &quot;
                      <span className="font-medium text-blue-600">{busca}</span>
                      &quot;
                      {mostrarAtivos !== null && (
                        <>
                          {' '}
                          |{' '}
                          <span className="font-medium">
                            {mostrarAtivos === true ? 'Ativos' : 'Inativos'}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Filtrando por:{' '}
                      <span className="font-medium text-blue-600">
                        {mostrarAtivos === true
                          ? 'Apenas ativos'
                          : 'Apenas inativos'}
                      </span>
                    </>
                  )}
                </div>
                {motoristasFiltrados.length === 0 ? (
                  <button
                    onClick={mostrarTodos}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Ver todos os motoristas
                  </button>
                ) : (
                  <div className="text-sm text-gray-500">
                    Mostrando {motoristasFiltrados.length} de{' '}
                    {motoristas.length} motoristas
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Indicador de carregamento de filtros */}
        {isLoadingMotoristas && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">
                Aplicando filtros...
              </span>
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="space-y-4 sm:space-y-6">
          {/* Estado vazio */}
          {motoristasFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
              {busca || mostrarAtivos !== null ? (
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum motorista encontrado
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    {busca
                      ? `Não encontramos motoristas para "${busca}".`
                      : `Não encontramos motoristas ${
                          mostrarAtivos === true ? 'ativos' : 'inativos'
                        }.`}
                  </p>
                  <button
                    onClick={mostrarTodos}
                    className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    Ver todos os motoristas
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum motorista cadastrado
                  </h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Não há motoristas cadastrados no sistema no momento.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Informações de paginação no topo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="text-sm text-gray-600">
                  Mostrando{' '}
                  <span className="font-medium text-blue-600">
                    {Math.min(
                      (paginaAtual - 1) * ITENS_POR_PAGINA + 1,
                      motoristasFiltrados.length,
                    )}{' '}
                    -{' '}
                    {Math.min(
                      paginaAtual * ITENS_POR_PAGINA,
                      motoristasFiltrados.length,
                    )}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">
                    {motoristasFiltrados.length}
                  </span>{' '}
                  motorista(s)
                  {busca && ' encontrados'}
                  {mostrarAtivos !== null && !busca && (
                    <> ({mostrarAtivos === true ? 'ativos' : 'inativos'})</>
                  )}
                </div>

                {totalPaginas > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 hidden sm:inline">
                      Página {paginaAtual} de {totalPaginas}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={irParaPrimeiraPagina}
                        disabled={paginaAtual === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Primeira página"
                      >
                        <ChevronsLeft className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={irParaPaginaAnterior}
                        disabled={paginaAtual === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Página anterior"
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                      </button>

                      {/* Números das páginas */}
                      <div className="flex items-center gap-1">
                        {[...Array(totalPaginas)].map((_, i) => {
                          const paginaNumero = i + 1;
                          // Mostrar apenas algumas páginas ao redor da atual
                          if (
                            paginaNumero === 1 ||
                            paginaNumero === totalPaginas ||
                            (paginaNumero >= paginaAtual - 1 &&
                              paginaNumero <= paginaAtual + 1)
                          ) {
                            return (
                              <button
                                key={paginaNumero}
                                onClick={() => irParaPagina(paginaNumero)}
                                className={`min-w-8 h-8 flex items-center justify-center px-2 rounded-lg text-sm font-medium transition-colors ${
                                  paginaAtual === paginaNumero
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {paginaNumero}
                              </button>
                            );
                          } else if (
                            paginaNumero === paginaAtual - 2 ||
                            paginaNumero === paginaAtual + 2
                          ) {
                            return (
                              <span
                                key={paginaNumero}
                                className="px-1 text-gray-400"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={irParaProximaPagina}
                        disabled={paginaAtual === totalPaginas}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Próxima página"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={irParaUltimaPagina}
                        disabled={paginaAtual === totalPaginas}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Última página"
                      >
                        <ChevronsRight className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid de motoristas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {motoristasPaginados.map((motorista) => (
                  <div key={motorista.usuario.id} className="h-full">
                    <MotoristaCard motorista={motorista} />
                  </div>
                ))}
              </div>

              {/* Paginação na parte inferior */}
              {totalPaginas > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="text-sm text-gray-600">
                    Mostrando {motoristasPaginados.length} motorista(s) nesta
                    página
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={irParaPrimeiraPagina}
                      disabled={paginaAtual === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Primeira</span>
                    </button>
                    <button
                      onClick={irParaPaginaAnterior}
                      disabled={paginaAtual === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-700 px-2">
                        Página{' '}
                        <select
                          value={paginaAtual}
                          onChange={(e) => irParaPagina(Number(e.target.value))}
                          className="ml-1 px-2 py-1 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[...Array(totalPaginas)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>{' '}
                        de {totalPaginas}
                      </span>
                    </div>

                    <button
                      onClick={irParaProximaPagina}
                      disabled={paginaAtual === totalPaginas}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={irParaUltimaPagina}
                      disabled={paginaAtual === totalPaginas}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Última</span>
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
