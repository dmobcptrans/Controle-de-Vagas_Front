'use client';

import { useState } from 'react';
import {
  Search,
  Loader2,
  Car,
  AlertCircle,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getReservasPorPlaca } from '@/lib/api/reservaApi';
import { ReservaPlaca } from '@/lib/types/reservaPlaca';
import ReservaPlacaCard from '@/components/agente/cards/reservaPlaca-card';

export default function ConsultarPlacaPage() {
  const [placa, setPlaca] = useState('');
  const [reservas, setReservas] = useState<ReservaPlaca[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!placa.trim()) {
      setError('Por favor, digite uma placa válida');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const resultado = await getReservasPorPlaca(placa);
      setReservas(resultado || []);
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatarPlaca = (value: string) => {
    // Remove caracteres não alfanuméricos e limita a 7 caracteres
    let formatted = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Formata no padrão brasileiro: AAA-0000
    if (formatted.length > 3) {
      formatted = formatted.slice(0, 3) + formatted.slice(3, 7);
    }

    return formatted;
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarPlaca(e.target.value);
    setPlaca(formatted);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl">
        {/* Cabeçalho */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Consultar Reservas por Placa
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Busque todas as reservas ativas ou reservadas de um motorista
            através da placa do veículo
          </p>
        </div>

        {/* Campo de Busca */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label
                  htmlFor="placa"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Placa do Veículo
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="placa"
                    type="text"
                    placeholder="Digite a placa (ex: ABC-1234)"
                    value={placa}
                    onChange={handlePlacaChange}
                    onKeyPress={handleKeyPress}
                    className="pl-10 text-lg font-mono uppercase"
                    maxLength={8}
                    disabled={loading}
                  />
                </div>
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !placa.trim()}
                className="w-full sm:w-auto min-w-[140px] mt-2 sm:mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Reservas
                  </>
                )}
              </Button>
            </div>

            {/* Dicas */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>Placa no formato AAA0000</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Mostra reservas ativas e reservadas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>Inclui localização da vaga</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 gap-2 text-center">
            <Loader2 className="animate-spin w-8 h-8 md:w-12 md:h-12 text-blue-600" />
            <span className="text-gray-600 text-sm md:text-base">
              Buscando reservas para a placa {placa}...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              Erro na busca
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
              {error}
            </p>
            <Button onClick={handleSearch} variant="outline" className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        ) : searched && reservas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Car className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
              Não foram encontradas reservas para a placa{' '}
              <strong>{placa}</strong>. Verifique se a placa está correta e
              tente novamente.
            </p>
          </div>
        ) : reservas.length > 0 ? (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                    Resultados da busca
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Encontradas {reservas.length} reserva
                    {reservas.length !== 1 ? 's' : ''} para a placa{' '}
                    <strong>{placa}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['ATIVA', 'RESERVADA', 'FINALIZADA', 'CANCELADA'].map(
                    (status) => {
                      const count = reservas.filter(
                        (r) => r.status === status,
                      ).length;
                      if (count === 0) return null;

                      return (
                        <div
                          key={status}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {count} {status.toLowerCase()}
                          {count !== 1 ? 's' : ''}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Reservas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {reservas.map((reserva) => (
                <ReservaPlacaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>

            {/* Total */}
            <div className="text-center text-gray-500 text-sm">
              Mostrando {reservas.length} reserva
              {reservas.length !== 1 ? 's' : ''}
            </div>
          </div>
        ) : null}

        {/* Mensagem inicial */}
        {!searched && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Search className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-3">
              Consulta de Reservas por Placa
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base mb-6">
              Digite a placa do veículo no campo acima para buscar todas as
              reservas ativas ou reservadas do motorista.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">
                  ✓ Informações incluídas
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Detalhes do motorista</li>
                  <li>• Informações do veículo</li>
                  <li>• Localização da vaga</li>
                  <li>• Datas de início e fim</li>
                </ul>
              </div>
              <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">
                  ⚡ Busca rápida
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Formato automático da placa</li>
                  <li>• Busca com Enter</li>
                  <li>• Filtro por status</li>
                  <li>• Resultados em tempo real</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
