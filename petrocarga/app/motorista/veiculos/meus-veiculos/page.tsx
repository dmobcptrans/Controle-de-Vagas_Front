'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getVeiculosUsuario } from '@/lib/api/veiculoApi';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';
import VeiculoCard from '@/components/motorista/cards/veiculo-item';
import { Button } from '@/components/ui/button';

/**
 * @component VeiculosPage
 * @version 1.0.0
 *
 * @description Página de listagem de veículos do motorista.
 * Exibe todos os veículos cadastrados pelo usuário logado.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Saudação personalizada com nome do motorista
 *    - Se não houver user.id, não carrega veículos
 *
 * 2. CARREGAMENTO DE VEÍCULOS:
 *    - useEffect dispara fetchVeiculos na montagem
 *    - useCallback memoiza função com base no user.id
 *    - Chama API getVeiculosUsuario com ID do usuário
 *
 * 3. ESTADOS DE UI (4 ESTADOS):
 *
 *    a) LOADING:
 *       - Spinner centralizado
 *       - Mensagem "Carregando seus veículos..."
 *
 *    b) ERRO:
 *       - Falha na API
 *       - Ícone de alerta vermelho
 *       - Botão "Tentar novamente"
 *
 *    c) LISTA VAZIA:
 *       - Mensagem "Nenhum veículo encontrado"
 *       - (Sem botão de ação - usuário pode cadastrar via outro link)
 *
 *    d) LISTA COM VEÍCULOS:
 *       - Saudação personalizada: "Olá, [nome]!"
 *       - Subtítulo descritivo
 *       - Grid de cards de veículos
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - SAUDAÇÃO PERSONALIZADA: user?.nome para experiência personalizada
 * - LAYOUT SIMPLES: max-w-2xl para cards não ficarem muito largos
 * - GRID VERTICAL: empilhamento de cards (não grid múltiplas colunas)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - VeiculoCard: Card individual de veículo
 * - useAuth: Hook de autenticação
 * - getVeiculosUsuario: API de listagem
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <VeiculosPage />
 * ```
 *
 * @see /src/components/motorista/cards/veiculo-item.tsx - Card de veículo
 * @see /src/lib/api/veiculoApi.ts - Função getVeiculosUsuario
 */

export default function VeiculosPage() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------------------------------------

  const fetchVeiculos = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getVeiculosUsuario(user.id);
      setVeiculos(result.veiculos);
    } catch {
      setError('Erro ao buscar seus veículos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --------------------------------------------------------------------------
  // EFEITO INICIAL
  // --------------------------------------------------------------------------

  useEffect(() => {
    fetchVeiculos();
  }, [fetchVeiculos]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando seus veículos...</span>
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
          Erro ao carregar veículos
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">{error}</p>
        <Button onClick={fetchVeiculos} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center w-full min-h-screen bg-gray-50">
      {/* Saudação personalizada */}
      <h1 className="text-2xl font-bold mb-2 text-center">
        Olá, {user?.nome || 'Motorista'}!
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Aqui estão seus veículos cadastrados.
      </p>

      {/* Lista de veículos ou mensagem vazia */}
      {veiculos.length === 0 ? (
        <p className="text-gray-500 text-center">Nenhum veículo encontrado.</p>
      ) : (
        <div className="grid gap-4 w-full max-w-2xl">
          {veiculos.map((veiculo) => (
            <VeiculoCard key={veiculo.id} veiculo={veiculo} />
          ))}
        </div>
      )}
    </div>
  );
}
