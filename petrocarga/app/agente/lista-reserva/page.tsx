'use client';

import ReservaRapidaCard from '@/components/agente/cards/reservaRapida-card';
import { useAuth } from '@/components/hooks/useAuth';
import { getReservasRapidas } from '@/lib/api/reservaApi';
import { ReservaRapida } from '@/lib/types/reservaRapida';
import { AlertCircle, ClipboardList, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * @component ReservaRapidaPage
 * @version 1.0.0
 *
 * @description Página de listagem de reservas rápidas criadas pelo agente.
 * Gerencia busca, loading, erro e exibição em grid responsivo.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Somente busca reservas se user.id existir
 *
 * 2. BUSCA DE DADOS:
 *    - useEffect dispara fetchReservas na montagem
 *    - useCallback memoiza função para evitar loops
 *    - useState gerencia reservas, loading e error
 *
 * 3. ESTADOS DE UI (5 ESTADOS):
 *
 *    a) SEM USUÁRIO: (tratado internamente)
 *       - Se user?.id não existe, loading é desativado
 *       - Resulta em lista vazia (estado c)
 *
 *    b) LOADING:
 *       - Spinner centralizado
 *       - Mensagem "Carregando reservas rápidas..."
 *
 *    c) ERRO:
 *       - Ícone de alerta vermelho
 *       - Mensagem de erro específica
 *       - Botão "Tentar novamente" (chama fetchReservas)
 *
 *    d) LISTA VAZIA (sem reservas):
 *       - Ícone ClipboardList cinza
 *       - Mensagem "Nenhuma reserva rápida encontrada"
 *       - Incentivo para criar primeira reserva
 *
 *    e) LISTA COM DADOS:
 *       - Título e subtítulo
 *       - Grid responsivo (1,2,3,4 colunas)
 *       - Cards de reserva (ReservaRapidaCard)
 *       - Rodapé com contagem total
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para hooks e interatividade
 *
 * - useCallback + useEffect: Padrão recomendado para buscar dados
 *   em componentes React. useCallback memoiza fetchReservas,
 *   evitando loops infinitos no useEffect.
 *
 * - VERIFICAÇÃO DE USER.ID: Previne chamadas à API sem usuário logado
 *   e evita erros 401/403 desnecessários
 *
 * - GRID RESPONSIVO:
 *   - sm:grid-cols-2 (tablet)
 *   - lg:grid-cols-3 (desktop pequeno)
 *   - xl:grid-cols-4 (desktop grande)
 *   - Máximo de 7 colunas (max-w-7xl)
 *
 * - RESUMO ESTATÍSTICO: Rodapé com contagem total melhora UX
 *   e dá visibilidade sobre volume de dados
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ReservaRapidaCard: Card individual para cada reserva
 * - useAuth: Hook de autenticação (obtém usuário)
 * - getReservasRapidas: API de busca de reservas
 * - ReservaRapida: TypeScript type das reservas
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - Loading: Spinner suave com mensagem clara
 * - Erro: Feedback vermelho com opção de retry
 * - Lista vazia: Ícone amigável e call-to-action implícito
 * - Lista com dados:
 *   - Grid que aproveita espaço disponível
 *   - Cards consistentes com o sistema
 *   - Rodapé informativo com total
 * - Todas as telas ocupam altura total (min-h-screen)
 * - Fundo cinza (bg-gray-50) para diferenciar da área de conteúdo
 *
 * @example
 * // Uso em rota de agente (protegida)
 * <ReservaRapidaPage />
 *
 * @see /src/components/agente/cards/reservaRapida-card.tsx - Card de reserva
 * @see /src/lib/api/reservaApi.ts - Função getReservasRapidas
 * @see /src/lib/types/reservaRapida.ts - Tipagem das reservas
 */

export default function ReservaRapidaPage() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  /**
   * useAuth: Obtém usuário autenticado
   * Necessário para filtrar reservas por agente
   */
  const { user } = useAuth();

  /**
   * Estados da página:
   * - reservas: Array de reservas rápidas do agente
   * - loading: Controle de carregamento
   * - error: Mensagem de erro ou null
   */
  const [reservas, setReservas] = useState<ReservaRapida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA (MEMOIZADA)
  // --------------------------------------------------------------------------

  /**
   * @function fetchReservas
   * @description Busca as reservas rápidas do agente logado
   *
   * Por que useCallback?
   * - Evita que a função seja recriada em cada render
   * - Previne loops infinitos no useEffect
   * - Dependência: user?.id (só recria se mudar)
   *
   * Fluxo:
   * 1. Verifica se usuário está logado (user?.id)
   * 2. Se não: desativa loading e retorna
   * 3. Se sim: ativa loading, limpa erros
   * 4. Chama API getReservasRapidas
   * 5. Sucesso: atualiza estado reservas
   * 6. Erro: define mensagem de erro
   * 7. Finally: desativa loading
   */
  const fetchReservas = useCallback(async () => {
    // Verificação de segurança: só busca se usuário existir
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getReservasRapidas(user.id);
      setReservas(result);
    } catch {
      // Erro genérico amigável
      setError('Erro ao buscar as reservas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Só recria se user.id mudar

  /**
   * @effect Busca inicial
   * Dispara fetchReservas na montagem do componente
   * Dependência fetchReservas garante que a busca seja refeita
   * se a função mudar (ou seja, se user.id mudar)
   */
  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  /**
   * ESTADO 1: LOADING
   * Exibido durante a busca inicial
   */
  if (loading) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2
          className="animate-spin w-6 h-6 md:w-8 md:h-8 text-gray-500"
          aria-hidden="true"
        />
        <span className="text-gray-600 text-sm md:text-base">
          Carregando reservas rápidas...
        </span>
      </div>
    );
  }

  /**
   * ESTADO 2: ERRO
   * Exibido quando a requisição falha
   * Oferece botão para tentar novamente
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-6 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
          Erro ao carregar reservas
        </h3>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-6">
          {error}
        </p>
        <Button
          onClick={fetchReservas}
          variant="outline"
          aria-label="Tentar carregar reservas novamente"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // --------------------------------------------------------------------------

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl">
        {/* Header da página */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Reservas Rápidas Criadas
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Gerencie suas reservas rápidas criadas
          </p>
        </div>

        {/* ESTADO 3: LISTA VAZIA */}
        {reservas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
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
          /* ESTADO 4: LISTA COM DADOS */
          <>
            {/* Grid de cards responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {reservas.map((reserva) => (
                <ReservaRapidaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>

            {/* Rodapé com resumo estatístico */}
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

                {/* Badge com contagem */}
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm md:text-base font-medium">
                  {reservas.length}{' '}
                  {reservas.length === 1 ? 'reserva' : 'reservas'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
