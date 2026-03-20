'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import {
  deleteReservaByID,
  getReservasPorUsuario,
  checkoutReserva,
  getGerarComprovanteReserva,
} from '@/lib/api/reservaApi';
import { AlertCircle, Loader2, WifiOff } from 'lucide-react';
import ReservaLista from '@/components/reserva/minhasReservas/ReservaLista';
import { ReservaGet } from '@/lib/types/reserva';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

/**
 * @function updateOnlineStatus
 * @description Atualiza o estado de conexão do usuário
 * @param setIsOffline - Função setter do estado isOffline
 */
const updateOnlineStatus = (setIsOffline: (v: boolean) => void) => {
  setIsOffline(!navigator.onLine);
};

/**
 * @component MinhasReservas
 * @version 1.0.0
 *
 * @description Página de visualização e gerenciamento de reservas do motorista.
 * Exibe lista de reservas com ações de checkout, exclusão e geração de comprovante.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Se não houver user.id, não carrega reservas
 *
 * 2. CARREGAMENTO DE RESERVAS:
 *    - useEffect dispara fetchReservas na montagem
 *    - useCallback memoiza função com base no user.id
 *    - Chama API getReservasPorUsuario com ID do usuário
 *
 * 3. DETECÇÃO DE CONEXÃO:
 *    - Monitora eventos online/offline do navegador
 *    - Exibe banner amarelo quando offline
 *    - Bloqueia ações que exigem conexão
 *
 * 4. AÇÕES DISPONÍVEIS:
 *    a) CHECKOUT: Finalizar reserva ativa
 *    b) EXCLUIR: Cancelar/excluir reserva
 *    c) COMPROVANTE: Gerar PDF da reserva
 *
 * 5. ESTADOS DE UI (4 ESTADOS):
 *
 *    a) LOADING:
 *       - Spinner centralizado
 *       - Mensagem "Carregando reservas..."
 *
 *    b) ERRO:
 *       - Falha na API
 *       - Ícone de alerta vermelho
 *       - Botão "Tentar novamente"
 *
 *    c) SEM RESERVAS:
 *       - Mensagem "Nenhuma reserva encontrada"
 *       - Aviso de offline se aplicável
 *
 *    d) LISTA COM RESERVAS:
 *       - Título personalizado com nome
 *       - Banner de offline (se aplicável)
 *       - Componente ReservaLista com ações
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - DETECÇÃO DE CONEXÃO:
 *   - Event listeners 'online' e 'offline'
 *   - Cleanup no useEffect para evitar memory leaks
 *   - Bloqueio de ações quando offline
 *
 * - FEEDBACK COM TOAST:
 *   - Sucesso/erro para cada ação
 *   - Mensagens específicas por operação
 *
 * - ATUALIZAÇÃO AUTOMÁTICA:
 *   - fetchReservas chamada após ações de exclusão/checkout
 *   - Reconexão online dispara refresh automático
 *
 * - SEGURANÇA:
 *   - Verificação de user.id antes das ações
 *   - Validação de conexão antes de ações críticas
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ReservaLista: Lista de reservas com ações
 * - useAuth: Hook de autenticação
 * - getReservasPorUsuario: API de listagem
 * - deleteReservaByID: API de exclusão
 * - checkoutReserva: API de finalização
 * - getGerarComprovanteReserva: API de PDF
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <MinhasReservas />
 * ```
 *
 * @see /src/components/reserva/minhasReservas/ReservaLista.tsx - Lista de reservas
 * @see /src/lib/api/reservaApi.ts - Funções de API
 */

export default function MinhasReservas() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const [reservas, setReservas] = useState<ReservaGet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------------------------------------

  const fetchReservas = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getReservasPorUsuario(user.id);
      setReservas(data || []);
      setIsOffline(false);
    } catch {
      setError('Não foi possível carregar suas reservas atuais.');
      if (!navigator.onLine) setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --------------------------------------------------------------------------
  // EFEITOS (CARREGAMENTO INICIAL + MONITORAMENTO ONLINE)
  // --------------------------------------------------------------------------

  useEffect(() => {
    fetchReservas();

    // Configura listeners de conexão
    const handleOnline = () => fetchReservas();
    const handleOffline = () => updateOnlineStatus(setIsOffline);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup na desmontagem
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchReservas]);

  // --------------------------------------------------------------------------
  // HANDLERS DE AÇÕES
  // --------------------------------------------------------------------------

  const handleGerarDocumento = async (reservaId: string) => {
    try {
      await getGerarComprovanteReserva(reservaId);
      toast.success('Comprovante Gerado com sucesso!');
    } catch {
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
    } catch {
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
    } catch {
      toast.error('Erro ao realizar checkout da reserva.');
    }
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando reservas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Erro ao carregar reservas
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">{error}</p>
        <Button onClick={fetchReservas} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center w-full min-h-screen bg-gray-50">
      {/* Banner de modo offline */}
      {isOffline && (
        <div className="w-full max-w-md mb-4 p-3 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg flex items-center gap-2 text-sm">
          <WifiOff size={18} />
          <span>
            Você está visualizando dados salvos. Conecte-se para atualizar ou
            excluir.
          </span>
        </div>
      )}

      {/* Título personalizado com nome do motorista */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        Suas Reservas, {user?.nome || 'motorista'}!
      </h1>

      {/* Lista de reservas ou mensagem vazia */}
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
