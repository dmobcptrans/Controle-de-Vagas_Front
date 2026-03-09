'use client';

import ReservaRapidaCard from '@/components/agente/cards/reservaRapida-card';
import { useAuth } from '@/components/hooks/useAuth';
import { getReservasRapidas } from '@/lib/api/reservaApi';
import { ReservaRapida } from '@/lib/types/reservaRapida';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ReservaRapidaPage() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<ReservaRapida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchReservas = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getReservasRapidas(user.id);
        setReservas(result);
      } catch (err) {
        setError('Erro ao buscar as reservas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 md:w-8 md:h-8 text-gray-500" />
        <span className="text-gray-600 text-sm md:text-base">
          Carregando reservas rápidas...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center text-red-600 min-h-[60vh] text-center text-sm md:text-base">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl">
        {/* Cabeçalho */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Reservas Rápidas Criadas
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Gerencie suas reservas rápidas criadas
          </p>
        </div>

        {/* Conteúdo */}
        {reservas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              Nenhuma reserva rápida encontrada
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
              Você ainda não criou nenhuma reserva rápida. Comece criando sua
              primeira reserva.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {reservas.map((reserva) => (
              <ReservaRapidaCard key={reserva.id} reserva={reserva} />
            ))}
          </div>
        )}

        {/* Estatísticas (opcional) */}
        {reservas.length > 0 && (
          <div className="mt-8 md:mt-12 p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                  Total de Reservas Rápidas
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Você criou {reservas.length} reserva
                  {reservas.length !== 1 ? 's' : ''} rápida
                  {reservas.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm md:text-base font-medium">
                {reservas.length}{' '}
                {reservas.length === 1 ? 'reserva' : 'reservas'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
