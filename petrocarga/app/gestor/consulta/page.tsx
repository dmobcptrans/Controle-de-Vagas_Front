'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Loader2,
  Car,
  AlertCircle,
  Filter,
  BarChart3,
  Building,
  Users,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getReservasPorPlaca } from '@/lib/api/reservaApi';
import { ReservaPlaca } from '@/lib/types/reservaPlaca';
import ReservaPlacaGestorCard from '@/components/gestor/cards/reservaPlaca-card';

const ITENS_POR_PAGINA = 9;

function formatarPlaca(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7);
}

/**
 * @component GestorConsultarPlacaPage
 * @version 1.0.0
 *
 * @description Página de consulta de reservas por placa para gestores.
 * Painel completo com estatísticas, filtros e visualização detalhada.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. INICIALIZAÇÃO:
 *    - Verifica parâmetro 'placa' na URL (para links diretos)
 *    - Se existir, executa busca automática
 *
 * 2. BUSCA:
 *    - Digitação com formatação automática (maiúsculas, sem hífen)
 *    - Validação de placa não vazia
 *    - Filtro automático: remove CANCELADAS e FINALIZADAS
 *
 * 3. ESTATÍSTICAS:
 *    - Total de reservas
 *    - Contagem de ATIVAS e RESERVADAS
 *    - Cards coloridos para cada status
 *
 * 4. FILTROS:
 *    - Tabs para filtrar por status (TODAS, ATIVA, RESERVADA)
 *    - Filtro em tempo real via useMemo
 *    - Contadores nos botões de filtro
 *
 * 5. ESTADOS DE UI:
 *    - Loading: spinner com ícone de carro animado
 *    - Erro: card vermelho com opções "Tentar Novamente" e "Nova Busca"
 *    - Vazio (com busca): card amarelo informativo
 *    - Vazio (sem busca): tela inicial com cards de recursos
 *    - Sucesso: lista de cards + resumo
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - useSearchParams: Permite compartilhamento de links com placa pré-preenchida
 * - useCallback + useMemo: Otimização de performance para filtros e estatísticas
 * - Filtro automático: Remove status indesejados (CANCELADA/FINALIZADA)
 * - Layout responsivo: 3 colunas no desktop para estatísticas
 * - Tabs integradas: Filtro visual sem perder contadores
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ReservaPlacaGestorCard: Card detalhado para gestores
 * - getReservasPorPlaca: API de busca
 * - UI Components: Tabs, Badge, Card
 *
 * @example
 * // Uso direto
 * <GestorConsultarPlacaPage />
 *
 * // Uso com parâmetro na URL (compartilhamento)
 * /gestor/consultar-placa?placa=ABC1234
 */

export default function GestorConsultarPlacaPage() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const searchParams = useSearchParams();
  const [placa, setPlaca] = useState('');
  const [reservas, setReservas] = useState<ReservaPlaca[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState<string>('TODAS');

  // --------------------------------------------------------------------------
  // MEMOIZED VALUES (ESTATÍSTICAS E FILTROS)
  // --------------------------------------------------------------------------

  const stats = useMemo(
    () => ({
      total: reservas.length,
      ativas: reservas.filter((r) => r.status === 'ATIVA').length,
      reservadas: reservas.filter((r) => r.status === 'RESERVADA').length,
    }),
    [reservas],
  );

  const filteredReservas = useMemo(() => {
    if (filter === 'TODAS') return reservas;
    return reservas.filter((r) => r.status === filter);
  }, [reservas, filter]);

  // --------------------------------------------------------------------------
  // HANDLER DE BUSCA
  // --------------------------------------------------------------------------

  const handleSearch = useCallback(
    async (customPlaca?: string) => {
      const placaToSearch = customPlaca || placa;

      if (!placaToSearch.trim()) {
        setError('Por favor, digite uma placa válida');
        return;
      }

      setLoading(true);
      setError(null);
      setSearched(true);
      setFilter('TODAS');

      try {
        const resultado = await getReservasPorPlaca(placaToSearch);

        // Filtro automático: remove canceladas e finalizadas
        const reservasFiltradas = (resultado || []).filter(
          (reserva) =>
            reserva.status !== 'CANCELADA' && reserva.status !== 'FINALIZADA',
        );

        setReservas(reservasFiltradas);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao buscar reservas por placa',
        );
        setReservas([]);
      } finally {
        setLoading(false);
      }
    },
    [placa],
  );

  // --------------------------------------------------------------------------
  // EFEITO INICIAL (PARÂMETRO DA URL)
  // --------------------------------------------------------------------------

  useEffect(() => {
    const placaParam = searchParams.get('placa');
    if (placaParam) {
      setPlaca(placaParam);
      handleSearch(placaParam);
    }
  }, [searchParams, handleSearch]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Building className="w-8 h-8 text-blue-600" />
                Consulta de Reservas por Placa
              </h1>
              <p className="text-gray-600">
                Painel de gestão para consulta de reservas ativas e reservadas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Users className="w-3 h-3 mr-1" />
                Modo Gestor
              </Badge>
            </div>
          </div>
        </div>

        {/* CARDS SUPERIORES (BUSCA + ESTATÍSTICAS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card de busca (2 colunas) */}
          <Card className="lg:col-span-2 shadow-lg border-blue-100">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Buscar por Placa
                </h3>
                <p className="text-sm text-gray-600">
                  Digite a placa do veículo para consultar reservas ativas
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label
                    htmlFor="placa"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Placa do Veículo
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <Input
                      id="placa"
                      type="text"
                      placeholder="AAA0000"
                      value={placa}
                      onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading) handleSearch();
                      }}
                      className="pl-10 text-lg font-bold font-mono uppercase h-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      maxLength={7}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSearch()}
                    disabled={loading || !placa.trim()}
                    className="h-12 min-w-[140px] bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Informações para gestores */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Informações para Gestores
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Exibe apenas reservas ATIVAS e RESERVADAS</li>
                  <li>• Placa deve ser digitada sem hífen</li>
                  <li>• Busca automática ao carregar página com parâmetro</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Card de estatísticas (1 coluna) */}
          <Card className="shadow-lg border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Reservas</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-sm text-green-700">Ativas</span>
                    <p className="text-xl font-bold text-green-900">
                      {stats.ativas}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm text-blue-700">Reservadas</span>
                    <p className="text-xl font-bold text-blue-900">
                      {stats.reservadas}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TABS DE FILTRO (só aparece se houver reservas) */}
        {reservas.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </h3>
                <p className="text-sm text-gray-600">
                  Mostrando {filteredReservas.length} de {reservas.length}{' '}
                  reservas
                </p>
              </div>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger
                    value="TODAS"
                    className="data-[state=active]:bg-white"
                  >
                    Todas ({reservas.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="ATIVA"
                    className="data-[state=active]:bg-green-50"
                  >
                    Ativas ({stats.ativas})
                  </TabsTrigger>
                  <TabsTrigger
                    value="RESERVADA"
                    className="data-[state=active]:bg-blue-50"
                  >
                    Reservadas ({stats.reservadas})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        )}

        {/* RENDERIZAÇÃO CONDICIONAL */}

        {/* Estado: Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="relative">
              <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
              <Car className="absolute inset-0 m-auto w-6 h-6 text-blue-800" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                Consultando banco de dados...
              </p>
              <p className="text-gray-500 text-sm">
                Buscando reservas para {placa}
              </p>
            </div>
          </div>
        ) : error ? (
          /* Estado: Erro */
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Erro na Consulta
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => handleSearch()} variant="outline">
                  Tentar Novamente
                </Button>
                <Button
                  onClick={() => {
                    setError(null);
                    setSearched(false);
                    setPlaca('');
                  }}
                >
                  Nova Busca
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : searched && filteredReservas.length === 0 ? (
          /* Estado: Busca sem resultados */
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <Car className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma Reserva Ativa Encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Não foram encontradas reservas ativas para a placa{' '}
                <strong>{placa}</strong>
              </p>
              <div className="text-sm text-gray-500">
                Apenas reservas com status ATIVA ou RESERVADA são exibidas.
              </div>
            </CardContent>
          </Card>
        ) : filteredReservas.length > 0 ? (
          /* Estado: Sucesso (com reservas) */
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {filteredReservas.map((reserva) => (
                <ReservaPlacaGestorCard key={reserva.id} reserva={reserva} />
              ))}
            </div>

            {/* Rodapé informativo */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Placa:</span> {placa} |
                  <span className="font-semibold ml-3">Total:</span>{' '}
                  {filteredReservas.length} reserva(s) |
                  <span className="font-semibold ml-3">Filtro:</span>{' '}
                  {filter === 'TODAS' ? 'Todos os status' : filter}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Estado: Inicial (sem busca) */
          <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center bg-gradient-to-b from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center mb-8">
              <Building className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Consulta de Reservas por Placa
            </h3>
            <p className="text-gray-600 max-w-xl mx-auto mb-8">
              Digite a placa do veículo para consultar as reservas ativas e
              reservadas.
            </p>

            {/* Cards de recursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Card className="border-blue-100 hover:border-blue-300 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 mx-auto">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Busca Filtrada
                  </h4>
                  <p className="text-sm text-gray-600">
                    Exibe apenas reservas ATIVAS e RESERVADAS
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-100 hover:border-green-300 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4 mx-auto">
                    <Filter className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Filtro Automático
                  </h4>
                  <p className="text-sm text-gray-600">
                    Remove automaticamente canceladas e finalizadas
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
