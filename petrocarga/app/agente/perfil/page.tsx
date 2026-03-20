'use client';

import { useAuth } from '@/components/hooks/useAuth';
import { PushNotificationToggle } from '@/components/notification/PushNotificationToggle';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAgenteByUserId } from '@/lib/api/agenteApi';
import { Agente } from '@/lib/types/agente';
import {
  AlertCircle,
  Edit,
  FileText,
  Fingerprint,
  Loader2,
  Mail,
  Phone,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * @component PerfilAgente
 * @version 1.0.0
 *
 * @description Página de visualização do perfil do agente.
 * Exibe informações pessoais e profissionais do agente logado,
 * com opções para editar perfil e configurar notificações.
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
 *       - Altura mínima para centralização perfeita
 *
 *    b) ERRO DE AUTENTICAÇÃO:
 *       - Quando user?.id não existe
 *       - Botão "Fazer Login" redireciona
 *
 *    c) ERRO DE BUSCA:
 *       - Falha na API
 *       - Card de erro com ícone vermelho
 *       - Mensagem específica do erro
 *
 *    d) AGENTE NÃO ENCONTRADO:
 *       - API retornou sucesso mas agente = null
 *       - Mensagem simples "Nenhum dado encontrado"
 *
 *    e) AGENTE ENCONTRADO (SUCESSO):
 *       - Card principal com perfil
 *       - Saudação personalizada com nome
 *       - Grid de informações (5 cards)
 *       - Toggle de notificações push
 *       - Botão "Editar Perfil"
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - Hooks (useAuth, useState, useEffect, useRouter)
 *   - Interatividade (toggle de notificações, botões)
 *
 * - SEPARAÇÃO DE RESPONSABILIDADES:
 *   - Este componente: exibição de dados
 *   - PushNotificationToggle: configuração de notificações (independente)
 *   - getAgenteByUserId: busca de dados (API)
 *
 * - GRID RESPONSIVO DE INFORMAÇÕES:
 *   - sm:grid-cols-2 (tablet: 2 colunas)
 *   - lg:grid-cols-3 (desktop: 3 colunas)
 *   - Adaptação para campos longos (break-all, truncate)
 *
 * - TRATAMENTO DE ERROS DA API:
 *   - API pode retornar { error: true, message: string }
 *   - Mapeamento para estados de UI apropriados
 *   - Fallback para mensagens genéricas
 *
 * - SEGURANÇA:
 *   - Verificação de user?.id antes da busca
 *   - Previne chamadas à API sem autenticação
 *
 * - UX RICA:
 *   - Saudação personalizada com nome
 *   - Ícones contextuais para cada campo
 *   - Cores e gradientes consistentes com o sistema
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - useAuth: Hook de autenticação
 * - PushNotificationToggle: Componente de configuração de notificações
 * - getAgenteByUserId: API de busca
 * - Agente: TypeScript type
 * - /agente/perfil/editar-perfil: Página de edição
 * - /autorizacao/login: Página de login (fallback)
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - HEADER:
 *   - Ícone gradiente azul
 *   - Título com gradiente de texto
 *   - Saudação "Olá, {nome}!"
 *   - Descrição amigável
 *
 * - CARDS DE INFORMAÇÃO (5):
 *   1. Nome completo
 *   2. Matrícula (com quebra de linha)
 *   3. Telefone
 *   4. CPF (com quebra)
 *   5. Email (com quebra, ocupa espaço especial)
 *
 * - AÇÕES:
 *   - Toggle de notificações push (salva preferência)
 *   - Botão "Editar Perfil" (link para formulário)
 *
 * - RESPONSIVIDADE:
 *   - Mobile: 1 coluna
 *   - Tablet: 2 colunas (email ocupa espaço especial)
 *   - Desktop: 3 colunas
 *   - Textos responsivos (text-sm, text-base, text-lg)
 *
 * - ESTADOS DE CARREGAMENTO:
 *   - Loading: spinner grande e centralizado
 *   - Erro: ícone vermelho e mensagem clara
 *   - Vazio: mensagem simples
 *
 * @example
 * // Uso em rota protegida
 * <PerfilAgente />
 *
 * @see /src/components/hooks/useAuth.ts - Hook de autenticação
 * @see /src/components/notification/PushNotificationToggle.tsx - Toggle de notificações
 * @see /src/lib/api/agenteApi.ts - Função getAgenteByUserId
 * @see /src/lib/types/agente.ts - Tipagem do agente
 */

export default function PerfilAgente() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const [agente, setAgente] = useState<Agente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // --------------------------------------------------------------------------
  // EFEITO DE BUSCA
  // --------------------------------------------------------------------------

  /**
   * @effect Busca dados do agente
   *
   * Fluxo:
   * 1. Verifica autenticação (user?.id)
   * 2. Se não autenticado: apenas desativa loading (aguarda redirecionamento)
   * 3. Se autenticado: chama API getAgenteByUserId
   * 4. Trata resposta da API:
   *    - Se resultado.error: erro da API (com mensagem)
   *    - Se não: salva agente
   * 5. Em caso de exceção: erro genérico
   * 6. Finally: desativa loading
   *
   * @dependency user?.id - Recarrega se usuário mudar
   */
  useEffect(() => {
    // Verificação de autenticação
    if (!user?.id) {
      setLoading(false);
      return;
    }

    /**
     * Função interna assíncrona para buscar agente
     */
    const fetchAgente = async () => {
      setLoading(true);
      setError(null);

      try {
        const resultado = await getAgenteByUserId(user.id);

        // Verifica se API retornou erro
        if (resultado.error) {
          setError(resultado.message || 'Erro ao buscar perfil');
        } else {
          setAgente(resultado.agente);
        }
      } catch {
        // Erro de rede ou exceção não tratada
        setError('Erro ao carregar informações do perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

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
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2
            className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4"
            aria-hidden="true"
          />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  /**
   * ESTADO 2: ERRO (autenticação ou busca)
   * Exibido quando há erro na requisição
   */
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md px-4">
          {/* Ícone de erro */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Título e mensagem */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro ao carregar perfil
          </h2>
          <p className="text-gray-600 mb-4 break-words">{error}</p>

          {/* Botão de ação */}
          <button
            onClick={() => router.push('/autorizacao/login')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition w-full sm:w-auto"
          >
            Fazer Login
          </button>
        </div>
      </main>
    );
  }

  /**
   * ESTADO 3: AGENTE NÃO ENCONTRADO
   * Exibido quando API retorna sucesso mas agente é null
   */
  if (!agente) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado encontrado.</p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------------------------
  // ESTADO 4: SUCESSO - Renderização do perfil
  // --------------------------------------------------------------------------

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8 min-h-[calc(100vh-4rem)]">
      {/* Card principal do perfil */}
      <Card className="w-full max-w-4xl mx-auto shadow-sm md:shadow-lg">
        {/* --------------------------------------------------------------------
          HEADER DO PERFIL
          Inclui:
          - Ícone gradiente
          - Saudação personalizada
          - Descrição amigável
        -------------------------------------------------------------------- */}
        <CardHeader className="space-y-3 text-center pb-6 px-4 sm:px-6">
          {/* Ícone decorativo */}
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          {/* Saudação com nome do agente */}
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Olá, {agente.usuario.nome}!
          </CardTitle>

          {/* Descrição */}
          <CardDescription className="text-sm sm:text-base px-2">
            Este é o seu perfil. Aqui você pode ver suas informações e atualizar
            seus dados conforme necessário.
          </CardDescription>
        </CardHeader>

        {/* --------------------------------------------------------------------
          CONTEÚDO DO PERFIL
        -------------------------------------------------------------------- */}
        <div className="px-4 sm:px-6 pb-6 space-y-6">
          {/* Grid de informações (5 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: Nome completo */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {agente.usuario.nome}
                </p>
              </div>
            </div>

            {/* Card 2: Número de Matrícula */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Número de Matrícula
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {agente.matricula}
                </p>
              </div>
            </div>

            {/* Card 3: Telefone */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {agente.usuario.telefone}
                </p>
              </div>
            </div>

            {/* Card 4: CPF */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Fingerprint className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">CPF</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {agente.usuario.cpf}
                </p>
              </div>
            </div>

            {/* Card 5: Email (ocupa espaço especial no tablet) */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg col-span-1 sm:col-span-2 lg:col-span-1">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {agente.usuario.email}
                </p>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------
            CONFIGURAÇÕES ADICIONAIS
          -------------------------------------------------------------------- */}

          {/* Toggle de notificações push */}
          <PushNotificationToggle usuarioId={agente.usuario.id} />

          {/* --------------------------------------------------------------------
            AÇÕES
          -------------------------------------------------------------------- */}

          {/* Botão Editar Perfil */}
          <div className="flex justify-center pt-6">
            <Link
              href="/agente/perfil/editar-perfil"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition text-sm sm:text-base w-full sm:w-auto min-w-[150px] font-medium"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Editar Perfil</span>
            </Link>
          </div>
        </div>
      </Card>
    </main>
  );
}
