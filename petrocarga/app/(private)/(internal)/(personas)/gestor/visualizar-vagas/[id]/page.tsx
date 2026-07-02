'use client';

import { useCallback, useEffect, useState } from 'react';
import VagaDetalhes from '@/components/gestor/cards/vaga-card';
import { getVagaById } from '@/lib/api/vagaApi';
import { Vaga } from '@/lib/types/vaga';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * @component VagaPosting
 * @version 1.0.0
 *
 * @description Página de detalhes de uma vaga específica para gestores.
 * Exibe informações completas da vaga e permite navegação para edição.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. PARÂMETROS DA URL:
 *    - useParams() captura o ID da vaga da rota dinâmica
 *    - Trata caso de ID vir como array (next.js pode retornar array)
 *
 * 2. BUSCA DE DADOS:
 *    - useEffect dispara fetchVaga na montagem
 *    - useCallback memoiza função com base no ID
 *    - Chama API getVagaById com o ID da vaga
 *
 * 3. ESTADOS DE UI (4 ESTADOS):
 *
 *    a) LOADING:
 *       - Spinner centralizado
 *       - Mensagem "Carregando vaga..."
 *
 *    b) ERRO DE BUSCA:
 *       - Falha na API ou vaga não encontrada
 *       - Ícone de alerta vermelho
 *       - Mensagem específica do erro
 *       - Botões: "Tentar novamente" e "Voltar para todas as vagas"
 *
 *    c) VAGA NÃO ENCONTRADA (tratada como erro):
 *       - Mensagem "Vaga não encontrada" via setError
 *       - Mesma UI do estado de erro
 *
 *    d) SUCESSO:
 *       - Link "Todas as Vagas" para retornar à listagem
 *       - Componente VagaDetalhes com dados completos
 *
 * 4. PÓS-VISUALIZAÇÃO:
 *    - Usuário pode editar a vaga através do botão no VagaDetalhes
 *    - Redireciona para /gestor/visualizar-vagas/[id]/editar
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - useParams do Next.js: Captura parâmetros de rota dinâmica
 * - Tratamento de array: Garante que o ID seja string, mesmo em rotas catch-all
 * - useCallback + useEffect: Padrão para busca de dados com dependência
 * - Erro unificado: "Vaga não encontrada" tratado como erro (não como estado separado)
 * - Dois botões no erro: "Tentar novamente" (refetch) e "Voltar" (navegação)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - VagaDetalhes: Componente de card com detalhes da vaga
 * - getVagaById: API de busca de vaga
 * - /gestor/visualizar-vagas: Página de listagem (retorno)
 * - /gestor/visualizar-vagas/[id]/editar: Página de edição (via botão)
 *
 * @example
 * ```tsx
 * // Uso em rota dinâmica: /gestor/visualizar-vagas/123
 * <VagaPosting />
 * ```
 *
 * @see /src/components/gestor/cards/vaga-card.tsx - Card de detalhes da vaga
 * @see /src/lib/api/vagaApi.ts - Função getVagaById
 */

export default function VagaPosting() {
  // --------------------------------------------------------------------------
  // HOOKS E PARÂMETROS
  // --------------------------------------------------------------------------

  const params = useParams();
  // Trata o caso do ID vir como array (ex: ['123', 'detalhes'])
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------------------------------------

  const fetchVaga = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const vagaData = await getVagaById(id);

      if (!vagaData) {
        setError('Vaga não encontrada.');
      } else {
        setVaga(vagaData);
      }
    } catch {
      setError('Erro ao buscar vaga.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // --------------------------------------------------------------------------
  // EFEITO INICIAL
  // --------------------------------------------------------------------------

  useEffect(() => {
    fetchVaga();
  }, [fetchVaga]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  /**
   * ESTADO 1: LOADING
   * Exibido durante a busca inicial
   */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="text-gray-600">Carregando vaga...</span>
      </div>
    );
  }

  /**
   * ESTADO 2: ERRO (inclui vaga não encontrada)
   * Exibido quando a requisição falha ou vaga não existe
   * Oferece duas opções: tentar novamente ou voltar à lista
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Erro ao carregar vaga
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={fetchVaga} variant="outline">
            Tentar novamente
          </Button>
          <Link href="/gestor/visualizar-vagas">
            <Button variant="ghost">Voltar para todas as vagas</Button>
          </Link>
        </div>
      </div>
    );
  }

  /**
   * ESTADO 3: SUCESSO (com vaga encontrada)
   * Renderiza os detalhes da vaga
   */
  if (!vaga) return null;

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Link de retorno para listagem */}
      <div className="mb-6">
        <Link
          href="/gestor/visualizar-vagas"
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Todas as Vagas
        </Link>
      </div>

      {/* Card de detalhes da vaga */}
      <VagaDetalhes vaga={vaga} />
    </div>
  );
}
