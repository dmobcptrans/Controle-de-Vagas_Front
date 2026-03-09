'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import {
  deleteReservaByID,
  getReservasPorUsuario,
  checkoutReserva,
} from '@/lib/api/reservaApi';
import { getGerarComprovanteReserva } from '@/lib/api/reservaApi';
import { Loader2, WifiOff } from 'lucide-react';
import ReservaLista from '@/components/reserva/minhasReservas/ReservaLista';
import { ReservaGet } from '@/lib/types/reserva';
import toast from 'react-hot-toast';

export default function MinhasReservas() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<ReservaGet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchReservas = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Usando reservaApi
      const data = await getReservasPorUsuario(user.id);
      setReservas(data || []);
      setIsOffline(false);
    } catch (err) {
      setError('Não foi possível carregar suas reservas atuais.');

      if (!navigator.onLine) setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();

    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', fetchReservas);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', fetchReservas);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [user?.id]);

  const handleGerarDocumento = async (reservaId: string) => {
    try {
      await getGerarComprovanteReserva(reservaId);
      toast.success('Comprovante Gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao Gerar Comprovante!');
    }
  };

  const handleExcluirReserva = async (reservaId: string) => {
    if (!navigator.onLine) {
      toast.error(
        'Você está offline. A exclusão de reservas só é permitida com conexão à internet.',
      );
      return;
    }

    try {
      await deleteReservaByID(reservaId, user!.id);
      toast.success('Reserva deletada com sucesso!');
      fetchReservas();
    } catch (err) {
      toast.error('Erro ao excluir. Verifique sua conexão.');
    }
  };

  const handleCheckoutReserva = async (reserva: ReservaGet) => {
    if (!navigator.onLine) {
      toast.error(
        'Você está offline. O checkout só é permitido com conexão à internet.',
      );
      return;
    }

    try {
      const response = await checkoutReserva(reserva.id);

      if (response.success) {
        fetchReservas();
      }
    } catch (err) {
      toast.error('Erro ao realizar checkout da reserva.');
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando reservas...</span>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center w-full min-h-screen bg-gray-50">
      {isOffline && (
        <div className="w-full max-w-md mb-4 p-3 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg flex items-center gap-2 text-sm">
          <WifiOff size={18} />
          <span>
            Você está visualizando dados salvos. Conecte-se para atualizar ou
            excluir.
          </span>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 text-center">
        Suas Reservas, {user?.nome || 'motorista'}!
      </h1>

      {reservas.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhuma reserva encontrada.</p>
          {isOffline && (
            <p className="text-xs text-gray-400">
              Pode haver dados não carregados por estar offline.
            </p>
          )}
        </div>
      ) : (
        <ReservaLista
          reservas={reservas}
          onGerarDocumento={handleGerarDocumento}
          onExcluir={handleExcluirReserva}
          onCheckout={handleCheckoutReserva}
        />
      )}
    </div>
  );
}
