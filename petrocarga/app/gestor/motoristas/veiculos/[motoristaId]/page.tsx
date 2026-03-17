'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { getVeiculosUsuario } from '@/lib/api/veiculoApi';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';
import VeiculoCard from '@/components/gestor/cards/veiculo-item';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ motoristaId: string }>;
}

/**
 * @component GestorVeiculosPage
 * @version 1.0.0
 *
 * @description Página de visualização de veículos de um motorista específico para gestores.
 * Exibe todos os veículos cadastrados por um determinado motorista.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. PARÂMETROS DA URL:
 *    - Recebe motoristaId via params (Promise)
 *    - Usa React.use() para resolver a Promise
 *
 * 2. BUSCA DE DADOS:
 *    - useEffect dispara fetchVeiculos na montagem
 *    - useCallback memoiza função com base no motoristaId
 *    - Chama API getVeiculosUsuario com o ID do motorista
 *
 * 3. ESTADOS DE UI (3 ESTADOS):
 *
 *    a) LOADING:
 *       - Spinner centralizado
 *       - Mensagem "Carregando os veículos..."
 *
 *    b) ERRO:
 *       - Ícone de alerta vermelho
 *       - Mensagem de erro específica
 *       - Botão "Tentar novamente" (chama fetchVeiculos)
 *
 *    c) SUCESSO:
 *       - Link "Voltar para todos os motoristas"
 *       - Título "Veículos deste motorista"
 *       - Lista de veículos em grid
 *       - Mensagem "Nenhum veículo encontrado" se vazio
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - use() do React: Resolve Promise de params (recurso do Next.js 15+)
 * - useCallback + useEffect: Padrão para busca de dados com dependência
 * - Layout simples: max-w-2xl para legibilidade em desktop
 * - Grid de cards: espaçamento vertical consistente
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - getVeiculosUsuario: API de busca de veículos por usuário
 * - VeiculoCard: Card individual de veículo
 * - /gestor/motoristas: Página de listagem (retorno)
 *
 * @example
 * // Uso em rota de gestor com parâmetro
 * <GestorVeiculosPage params={Promise.resolve({ motoristaId: "123" })} />
 *
 * @see /src/lib/api/veiculoApi.ts - Função getVeiculosUsuario
 * @see /src/components/gestor/cards/veiculo-item.tsx - Card de veículo
 */

export default function GestorVeiculosPage({ params }: PageProps) {
  // --------------------------------------------------------------------------
  // PARÂMETROS E ESTADOS
  // --------------------------------------------------------------------------

  /**
   * Resolve a Promise do params para obter o ID do motorista
   * Recurso do Next.js 15+ para páginas com parâmetros assíncronos
   */
  const { motoristaId } = use(params);

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------------------------------------

  const fetchVeiculos = useCallback(async () => {
    // Verifica se há ID do motorista
    if (!motoristaId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getVeiculosUsuario(motoristaId);

      if (result.error) {
        setError(result.message);
      } else {
        setVeiculos(result.veiculos);
      }
    } catch {
      setError('Erro ao buscar os veículos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [motoristaId]);

  // --------------------------------------------------------------------------
  // EFEITO INICIAL
  // --------------------------------------------------------------------------

  useEffect(() => {
    fetchVeiculos();
  }, [fetchVeiculos]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  /**
   * ESTADO 1: LOADING
   * Exibido durante a busca inicial
   */
  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="text-gray-600">Carregando os veículos...</span>
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

  /**
   * ESTADO 3: SUCESSO
   * Renderiza a lista de veículos
   */
  return (
    <div className="p-4 flex flex-col items-center w-full min-h-screen bg-gray-50">
      {/* Link de retorno */}
      <div className="w-full max-w-2xl mb-4">
        <Link
          href="/gestor/motoristas"
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para todos os motoristas
        </Link>
      </div>

      {/* Título da página */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        Veículos deste motorista
      </h1>

      {/* Lista de veículos */}
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
