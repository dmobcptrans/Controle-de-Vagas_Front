'use client';

import EditarGestor from '@/components/gestor/editar/edicao-perfil';
import { useAuth } from '@/components/hooks/useAuth';
import { getGestorByUserId } from '@/lib/api/gestorApi';
import { Gestor } from '@/lib/types/gestor';
import {
  AlertCircle,
  ArrowLeft,
  Info,
  Loader2,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * @component EditarGestorPerfil
 * @version 1.0.0
 *
 * @description Página de edição de perfil do gestor.
 * Gerencia carregamento dos dados, estados de erro e renderiza o formulário de edição.
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
 *    - useEffect dispara fetchGestor na montagem
 *    - Chama API getGestorByUserId com ID do usuário
 *    - Trata diferentes respostas da API (erro/sucesso)
 *
 * 3. ESTADOS DE UI (5 ESTADOS):
 *
 *    a) LOADING INICIAL:
 *       - Spinner centralizado
 *       - Mensagem "Carregando perfil do gestor..."
 *
 *    b) ERRO DE AUTENTICAÇÃO:
 *       - Card vermelho com ícone de alerta
 *       - Botão "Voltar para perfil"
 *
 *    c) ERRO DE BUSCA:
 *       - Falha na API
 *       - Mensagem específica do erro
 *
 *    d) GESTOR NÃO ENCONTRADO:
 *       - Ícone ShieldX (escudo com X)
 *       - Mensagem "Gestor não encontrado"
 *       - Botão "Voltar para perfil"
 *
 *    e) GESTOR ENCONTRADO (SUCESSO):
 *       - Header com gradiente esmeralda/azul
 *       - Ícone ShieldCheck (escudo com check)
 *       - Formulário EditarGestor
 *       - Card informativo esmeralda
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - DIFERENCIAÇÃO DO AGENTE:
 *   - Cores: Esmeralda (verde) em vez de azul
 *   - Ícones: ShieldCheck/ShieldX (escudo) em vez de UserCircle/UserX
 *   - Títulos: "Editando perfil de gestor" no header
 *   - Textos: "Informação importante para gestores"
 *
 * - LAYOUT RICO:
 *   - Gradiente esmeralda/azul no fundo
 *   - Ícones contextuais
 *   - Card informativo esmeralda
 *   - Design responsivo (múltiplos breakpoints)
 *
 * - SEPARAÇÃO DE RESPONSABILIDADES:
 *   - Este componente: gerencia carregamento e erros
 *   - EditarGestor: formulário de edição puro
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - EditarGestor: Formulário de edição (filho)
 * - useAuth: Hook de autenticação
 * - getGestorByUserId: API de busca
 * - /gestor/perfil: Página de destino (após sucesso/voltar)
 *
 * @example
 * // Uso em rota protegida
 * <EditarGestorPerfil />
 *
 * @see /src/components/gestor/editar/edicao-perfil.tsx - Formulário de edição
 * @see /src/lib/api/gestorApi.ts - Função getGestorByUserId
 */

export default function EditarGestorPerfil() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const router = useRouter();

  const [gestor, setGestor] = useState<Gestor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // --------------------------------------------------------------------------
  // EFEITO DE BUSCA
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    async function fetchGestor() {
      setLoading(true);
      setError('');

      try {
        const result = await getGestorByUserId(user!.id);

        if (result.error) {
          setError(result.gestor);
          setGestor(null);
        } else {
          const m = result.gestor;
          if (!m) {
            setError('Gestor não encontrado.');
          } else {
            setGestor(m);
          }
        }
      } catch {
        setError('Erro ao buscar perfil do gestor.');
      } finally {
        setLoading(false);
      }
    }

    fetchGestor();
  }, [user?.id]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <Loader2 className="animate-spin w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-500" />
        <span className="text-gray-600 text-sm sm:text-base">
          Carregando perfil do gestor...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-500" />
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Ocorreu um erro
          </h3>
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base break-words">
            {error}
          </p>
          <Link
            href="/gestor/perfil"
            className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-5xl mx-auto">
          {/* HEADER COM GRADIENTE */}
          <div className="mb-8 sm:mb-10 lg:mb-12 relative">
            {/* Fundo gradiente (esmeralda/azul) */}
            <div className="absolute inset-0 -top-4 sm:-top-6 -mx-4 sm:-mx-6 lg:-mx-8 h-40 sm:h-48 bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30 rounded-b-2xl sm:rounded-b-3xl pointer-events-none" />

            <div className="relative">
              {/* Barra superior com botão voltar e indicador */}
              <div className="flex justify-between items-start mb-6 sm:mb-0">
                {/* Botão voltar */}
                <Link
                  href="/gestor/perfil"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 group transition-all duration-200 text-sm sm:text-base bg-white/80 backdrop-blur-sm sm:bg-transparent px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-medium group-hover:text-emerald-600">
                    Voltar para perfil
                  </span>
                </Link>

                {/* Indicador de página (desktop) */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span>Editando perfil de gestor</span>
                </div>
              </div>

              {/* Título e ícone */}
              <div className="text-center pt-4 sm:pt-8 lg:pt-12 pb-6 sm:pb-8">
                {/* Ícone decorativo (ShieldCheck) */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                  </div>
                </div>

                {/* Título */}
                <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                  Edição de Perfil
                </h1>

                {/* Descrição */}
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-xl mx-auto px-4 leading-relaxed">
                  Gerencie suas informações administrativas e preferências de
                  supervisão
                </p>
              </div>
            </div>
          </div>

          {/* CARD DO FORMULÁRIO */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* ESTADO 4: GESTOR NÃO ENCONTRADO */}
            {!gestor ? (
              <div className="p-4 sm:p-6 md:p-8 text-center">
                {/* Ícone ShieldX */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShieldX className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400" />
                </div>

                {/* Título e mensagem */}
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Gestor não encontrado
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Não foi possível carregar as informações do gestor.
                </p>

                {/* Botão de retorno */}
                <Link
                  href="/gestor/perfil"
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm sm:text-base font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para perfil
                </Link>
              </div>
            ) : (
              /* ESTADO 5: GESTOR ENCONTRADO - Formulário de edição */
              <div className="p-3 xs:p-4 sm:p-6 lg:p-8">
                <EditarGestor
                  gestor={gestor}
                  onSuccess={() => router.push('/gestor/perfil')}
                />
              </div>
            )}
          </div>

          {/* CARD INFORMATIVO (esmeralda) */}
          <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 p-3 xs:p-4 sm:p-6 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {/* Ícone Info */}
              <div className="flex-shrink-0">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-500" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <h4 className="font-medium text-emerald-900 text-xs xs:text-sm sm:text-base">
                  Informação importante para gestores
                </h4>
                <p className="text-emerald-700 text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed">
                  As alterações realizadas aqui impactam suas permissões de
                  supervisão e acesso aos relatórios da equipe. Certifique-se de
                  manter os dados atualizados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
