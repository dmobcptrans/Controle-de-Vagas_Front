'use client';

import EditarAgente from '@/components/agente/editar/edicao-perfil';
import { useAuth } from '@/components/hooks/useAuth';
import { getAgenteByUserId } from '@/lib/api/agenteApi';
import { Agente } from '@/lib/types/agente';
import {
  AlertCircle,
  ArrowLeft,
  Info,
  Loader2,
  UserCircle,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * @component EditarAgentePerfil
 * @version 1.0.0
 *
 * @description Página de edição de perfil do agente.
 * Gerencia carregamento dos dados do agente, estados de erro,
 * e renderiza o formulário de edição.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Se não houver user.id, redireciona implicitamente (via erro)
 *
 * 2. BUSCA DE DADOS:
 *    - useEffect dispara fetchAgente na montagem
 *    - Chama API getAgenteByUserId com ID do usuário
 *    - Trata diferentes respostas da API (erro/sucesso)
 *
 * 3. ESTADOS DE UI (5 ESTADOS):
 *
 *    a) LOADING INICIAL:
 *       - Spinner centralizado
 *       - Mensagem "Carregando perfil..."
 *
 *    b) ERRO DE AUTENTICAÇÃO:
 *       - Usuário não autenticado
 *       - Mensagem clara com opção de voltar
 *
 *    c) ERRO DE BUSCA:
 *       - Falha na API ou agente não encontrado
 *       - Card de erro com mensagem específica
 *       - Botão "Voltar para perfil"
 *
 *    d) AGENTE NÃO ENCONTRADO:
 *       - API retornou sucesso mas agente = null
 *       - Ícone UserX e mensagem amigável
 *       - Link para voltar ao perfil
 *
 *    e) AGENTE ENCONTRADO:
 *       - Header com título e ícone
 *       - Formulário EditarAgente
 *       - Card informativo (importante)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - Hooks (useAuth, useState, useEffect, useRouter)
 *   - Interatividade (formulário de edição)
 *
 * - SEPARAÇÃO DE RESPONSABILIDADES:
 *   - Este componente: gerencia carregamento e erros
 *   - EditarAgente: formulário de edição puro
 *   - Clara separação entre busca de dados e apresentação
 *
 * - TRATAMENTO DE ERROS DA API:
 *   - API pode retornar { error: true, agente: mensagem }
 *   - Ou { agente: Agente | null }
 *   - Mapeamento para estados de UI apropriados
 *
 * - LAYOUT RICO:
 *   - Gradientes sutis no fundo
 *   - Ícones contextuais
 *   - Card informativo azul
 *   - Design responsivo (múltiplos breakpoints)
 *
 * - SEGURANÇA:
 *   - Verificação de user?.id antes da busca
 *   - Previne chamadas à API sem autenticação
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - EditarAgente: Formulário de edição (filho)
 * - useAuth: Hook de autenticação
 * - getAgenteByUserId: API de busca
 * - Agente: TypeScript type
 * - /agente/perfil: Página de destino (após sucesso/voltar)
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - CARREGAMENTO: Spinner suave com mensagem clara
 * - ERRO: Card vermelho com ícone de alerta
 * - SUCESSO:
 *   - Header com gradiente e ícone
 *   - Título grande e descrição
 *   - Card de formulário em branco
 *   - Card informativo azul (dicas)
 *
 * - ACESSIBILIDADE:
 *   - Links com estados hover/focus
 *   - Contraste adequado
 *   - Estrutura semântica (h1, p)
 *
 * - RESPONSIVIDADE:
 *   - Breakpoints: xs, sm, lg, xl
 *   - Padding adaptativo
 *   - Textos responsivos
 *
 * @example
 * // Uso em rota protegida
 * <EditarAgentePerfil />
 *
 * @see /src/components/agente/editar/edicao-perfil.tsx - Formulário de edição
 * @see /src/lib/api/agenteApi.ts - Função getAgenteByUserId
 * @see /src/lib/types/agente.ts - Tipagem do agente
 */

export default function EditarAgentePerfil() {
  // --------------------------------------------------------------------------
  // HOOKS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const router = useRouter();

  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const [agente, setAgente] = useState<Agente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // --------------------------------------------------------------------------
  // EFEITO DE BUSCA
  // --------------------------------------------------------------------------

  /**
   * @effect Busca dados do agente
   *
   * Fluxo:
   * 1. Verifica autenticação (user?.id)
   * 2. Se não autenticado: define erro e encerra
   * 3. Se autenticado: chama API getAgenteByUserId
   * 4. Trata resposta da API:
   *    - Se result.error: erro da API
   *    - Se !agente: agente não encontrado
   *    - Se agente: sucesso
   * 5. Em caso de exceção: erro genérico
   * 6. Finally: desativa loading
   *
   * @dependency user?.id - Recarrega se usuário mudar
   */
  useEffect(() => {
    // Verificação de autenticação
    if (!user?.id) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    /**
     * Função interna assíncrona para buscar agente
     */
    async function fetchAgente() {
      setLoading(true);
      setError('');

      try {
        const result = await getAgenteByUserId(user!.id);

        // Verifica se API retornou erro
        if (result.error) {
          setError(result.agente); // result.agente contém mensagem de erro
          setAgente(null);
        } else {
          const agenteData = result.agente;

          // Verifica se agente existe
          if (!agenteData) {
            setError('Agente não encontrado.');
          } else {
            setAgente(agenteData);
          }
        }
      } catch {
        // Erro de rede ou exceção não tratada
        setError('Erro ao buscar perfil do agente.');
      } finally {
        setLoading(false);
      }
    }

    fetchAgente();
  }, [user?.id]); // Só executa se user.id mudar

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  /**
   * ESTADO 1: LOADING
   * Exibido durante a busca inicial
   */
  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <Loader2
          className="animate-spin w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-500"
          aria-hidden="true"
        />
        <span className="text-gray-600 text-sm sm:text-base">
          Carregando perfil...
        </span>
      </div>
    );
  }

  /**
   * ESTADO 2: ERRO (autenticação ou busca)
   * Exibido quando há erro na requisição ou usuário não autenticado
   */
  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
          {/* Ícone de erro */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-500" />
          </div>

          {/* Título e mensagem */}
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Ocorreu um erro
          </h3>
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base break-words">
            {error}
          </p>

          {/* Botão de retorno */}
          <Link
            href="/agente/perfil"
            className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para perfil
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-5xl mx-auto">
          {/* --------------------------------------------------------------------
            HEADER COM GRADIENTE
            Inclui:
            - Botão voltar
            - Ícone decorativo
            - Título grande
            - Descrição
          -------------------------------------------------------------------- */}
          <div className="mb-8 sm:mb-10 lg:mb-12 relative">
            {/* Fundo gradiente */}
            <div className="absolute inset-0 -top-4 sm:-top-6 -mx-4 sm:-mx-6 lg:-mx-8 h-40 sm:h-48 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 rounded-b-2xl sm:rounded-b-3xl pointer-events-none" />

            {/* Conteúdo do header */}
            <div className="relative">
              {/* Botão voltar */}
              <div className="flex justify-between items-start mb-6 sm:mb-0">
                <Link
                  href="/agente/perfil"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 group transition-all duration-200 text-sm sm:text-base bg-white/80 backdrop-blur-sm sm:bg-transparent px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-medium group-hover:text-blue-600">
                    Voltar para perfil
                  </span>
                </Link>
              </div>

              {/* Título e ícone */}
              <div className="text-center pt-4 sm:pt-8 lg:pt-12 pb-6 sm:pb-8">
                {/* Ícone decorativo */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                  </div>
                </div>

                {/* Título */}
                <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                  Edição de Perfil
                </h1>

                {/* Descrição */}
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-xl mx-auto px-4 leading-relaxed">
                  Revise e atualize suas informações pessoais, de contato e
                  preferências
                </p>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------
            CARD DO FORMULÁRIO
          -------------------------------------------------------------------- */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* ESTADO 3: AGENTE NÃO ENCONTRADO */}
            {!agente ? (
              <div className="p-4 sm:p-6 md:p-8 text-center">
                {/* Ícone */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserX className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400" />
                </div>

                {/* Título e mensagem */}
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Agente não encontrado
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Não foi possível carregar as informações do agente.
                </p>

                {/* Botão de retorno */}
                <Link
                  href="/agente/perfil"
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para perfil
                </Link>
              </div>
            ) : (
              /* ESTADO 4: AGENTE ENCONTRADO - Formulário de edição */
              <div className="p-3 xs:p-4 sm:p-6 lg:p-8">
                <EditarAgente
                  agente={agente}
                  onSuccess={() => router.push('/agente/perfil')}
                />
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------------
            CARD INFORMATIVO (dicas importantes)
          -------------------------------------------------------------------- */}
          <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 p-3 xs:p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {/* Ícone */}
              <div className="flex-shrink-0">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 text-xs xs:text-sm sm:text-base">
                  Informação importante
                </h4>
                <p className="text-blue-700 text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed">
                  As alterações feitas aqui serão refletidas imediatamente no
                  seu perfil. Certifique-se de que todas as informações estão
                  corretas antes de salvar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
