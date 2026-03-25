'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import {
  deleteReservaByID,
  getReservasPorUsuario,
  checkoutReserva,
  getGerarComprovanteReserva,
} from '@/lib/api/reservaApi';
import { AlertCircle, Info, Loader2, WifiOff } from 'lucide-react';
import ReservaLista from '@/components/reserva/minhasReservas/ReservaLista';
import { ReservaGet } from '@/lib/types/reserva';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from "next/link";

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

 return (
  <div className="min-h-screen bg-[#f5f5f0]">
    
    {/* HEADER SEMPRE FIXO */}
    <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
          Suas Reservas, {user?.nome?.split(' ')[0] || 'motorista'}
        </h1>
        <p className="text-xs text-white/50">
          Gerencie e Acompanhe
        </p>
      </div>
    </header>

    <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">

      {/* OFFLINE */}
      {isOffline && (
        <div className="w-full max-w-md mb-4 p-3 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg flex items-center gap-2 text-sm">
          <WifiOff size={18} />
          <span>
            Você está visualizando dados salvos. Conecte-se para atualizar ou excluir.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2 text-center">
          <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          <span className="text-gray-600">Carregando reservas...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchReservas}>Tentar novamente</Button>
        </div>
      ) : reservas.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <ReservaLista
          reservas={reservas}
          onGerarDocumento={handleGerarDocumento}
          onExcluir={handleExcluirReserva}
          onCheckout={handleCheckoutReserva}
        />
      )}

       {/* Tutorial */}
                <Link
                    href="/motorista/guia"
                    className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors"
                >
                    <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
                        <Info className="h-5 w-5 text-[#1351B4]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#071D41]">Novo por aqui?</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Veja como usar o sistema em 3 passos simples
                        </p>
                    </div>
                </Link>

    </main>
  </div>
);
}
