'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditarVaga from '@/components/gestor/editar/edicao-vaga';
import { Vaga } from '@/lib/types/vaga';
import { useAuth } from '@/components/hooks/useAuth';
import { getVagaById } from '@/lib/api/vagaApi';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * @component EditarVagaPage
 * @version 1.0.0
 *
 * @description Página de edição de vaga para gestores.
 * Gerencia carregamento dos dados da vaga via ID da URL, estados de erro,
 * e renderiza o formulário de edição.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. PARÂMETROS DA URL:
 *    - useParams() captura o ID da vaga da rota dinâmica
 *    - Trata caso de ID vir como array (next.js pode retornar array)
 *
 * 2. AUTENTICAÇÃO:
 *    - Hook useAuth obtém estado de loading da autenticação
 *    - Aguarda authLoading antes de exibir conteúdo
 *
 * 3. BUSCA DE DADOS:
 *    - useEffect dispara fetchVaga na montagem
 *    - useCallback memoiza função com base no ID
 *    - Chama API getVagaById com o ID da vaga
 *    - Se não encontrar, redireciona para lista de vagas
 *
 * 4. ESTADOS DE UI (5 ESTADOS):
 *
 *    a) LOADING INICIAL (authLoading ou loading):
 *       - Spinner centralizado
 *       - Mensagem "Carregando vaga..."
 *
 *    b) ERRO DE BUSCA:
 *       - Falha na API
 *       - Ícone de alerta vermelho
 *       - Mensagem específica do erro
 *       - Botão "Tentar novamente"
 *
 *    c) VAGA NÃO ENCONTRADA:
 *       - Mensagem "Vaga não encontrada"
 *       - Link para voltar à lista
 *
 *    d) SUCESSO:
 *       - Link "Voltar para detalhes"
 *       - Formulário EditarVaga com dados da vaga
 *
 * 5. PÓS-EDIÇÃO:
 *    - O componente EditarVaga gerencia o submit
 *    - Após sucesso, redireciona para página de detalhes
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - useParams do Next.js: Captura parâmetros de rota dinâmica
 * - Tratamento de array: Next.js pode retornar array para rotas catch-all
 * - useCallback + useEffect: Padrão para busca de dados com dependência
 * - Redirecionamento automático: Se vaga não existe, volta à lista
 * - Separação de loading: authLoading (auth) + loading (dados)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - EditarVaga: Formulário de edição (filho)
 * - getVagaById: API de busca de vaga
 * - /gestor/visualizar-vagas: Página de listagem
 * - /gestor/visualizar-vagas/[id]: Página de detalhes (retorno)
 *
 * @example
 * ```tsx
 * // Uso em rota dinâmica: /gestor/visualizar-vagas/123/editar
 * <EditarVagaPage />
 * ```
 *
 * @see /src/components/gestor/editar/edicao-vaga.tsx - Formulário de edição
 * @see /src/lib/api/vagaApi.ts - Função getVagaById
 */

export default function EditarVagaPage() {
  // --------------------------------------------------------------------------
  // HOOKS E PARÂMETROS
  // --------------------------------------------------------------------------

  const params = useParams();
  // Trata o caso do ID vir como array (ex: ['123', 'editar'])
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { loading: authLoading } = useAuth();
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------------------------------------

  const fetchVaga = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vagaData = await getVagaById(id);

      // Se não encontrar a vaga, redireciona para lista
      if (!vagaData) {
        router.replace('/gestor/visualizar-vagas');
      } else {
        setVaga(vagaData);
      }
    } catch {
      setError('Erro ao carregar a vaga. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

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
   * ESTADO 1: LOADING (autenticação ou dados)
   * Exibido durante carregamento inicial
   */
  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="text-gray-600">Carregando vaga...</span>
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
          Erro ao carregar vaga
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">{error}</p>
        <Button onClick={fetchVaga} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  /**
   * ESTADO 3: VAGA NÃO ENCONTRADA
   * Exibido quando API retorna null (vaga não existe)
   */
  if (!vaga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <p className="text-gray-600 mb-4">Vaga não encontrada.</p>
        <Link
          href="/gestor/visualizar-vagas"
          className="text-blue-600 hover:underline"
        >
          Voltar para lista de vagas
        </Link>
      </div>
    );
  }

  /**
   * ESTADO 4: SUCESSO
   * Renderiza o formulário de edição com os dados da vaga
   */
  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Link de retorno para página de detalhes */}
      <div className="mb-6">
        <Link
          href={`/gestor/visualizar-vagas/${id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para detalhes
        </Link>
      </div>

      {/* Formulário de edição */}
      <EditarVaga vaga={vaga} />
    </div>
  );
}
