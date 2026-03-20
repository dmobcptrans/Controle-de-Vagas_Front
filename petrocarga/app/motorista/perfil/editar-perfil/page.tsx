'use client';

import EditarMotorista from '@/components/motorista/editar/edicao-perfil';
import { Motorista } from '@/lib/types/motorista';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Info,
  Loader2,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';
import { useEffect, useState } from 'react';
import { getMotoristaByUserId } from '@/lib/api/motoristaApi';

/**
 * @component EditarMotoristaPage
 * @version 1.0.0
 *
 * @description Página de edição de perfil do motorista.
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
 *    - useEffect dispara fetchMotorista na montagem
 *    - Chama API getMotoristaByUserId com ID do usuário
 *    - Trata diferentes respostas da API (erro/sucesso)
 *
 * 3. ESTADOS DE UI (5 ESTADOS):
 *
 *    a) LOADING INICIAL:
 *       - Spinner centralizado
 *       - Mensagem "Carregando perfil do motorista..."
 *
 *    b) ERRO DE AUTENTICAÇÃO:
 *       - Card vermelho com ícone de alerta
 *       - Botão "Voltar para perfil" (laranja)
 *
 *    c) ERRO DE BUSCA:
 *       - Falha na API
 *       - Mensagem específica do erro
 *
 *    d) MOTORISTA NÃO ENCONTRADO:
 *       - Ícone UserX (usuário com X)
 *       - Mensagem "Motorista não encontrado"
 *       - Botão "Voltar para perfil" (laranja)
 *
 *    e) MOTORISTA ENCONTRADO (SUCESSO):
 *       - Header com gradiente laranja/amarelo
 *       - Ícone CheckCircle (círculo com check)
 *       - Formulário EditarMotorista
 *       - Card informativo laranja
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - TEMA LARANJA: Diferenciação visual do motorista
 *   - Gradientes: from-orange-50/30 via-white to-yellow-50/30
 *   - Botões: bg-orange-600 hover:bg-orange-700
 *   - Card informativo: bg-orange-50 border-orange-100
 *   - Ícones: text-orange-500
 *
 * - ÍCONES ESPECÍFICOS:
 *   - Sucesso: CheckCircle (em vez de ShieldCheck do gestor)
 *   - Não encontrado: UserX (em vez de ShieldX do gestor)
 *
 * - LAYOUT RICO:
 *   - Gradiente suave no fundo
 *   - Ícones contextuais
 *   - Card informativo laranja
 *   - Design responsivo (múltiplos breakpoints)
 *
 * - SEPARAÇÃO DE RESPONSABILIDADES:
 *   - Este componente: gerencia carregamento e erros
 *   - EditarMotorista: formulário de edição puro
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - EditarMotorista: Formulário de edição (filho)
 * - useAuth: Hook de autenticação
 * - getMotoristaByUserId: API de busca
 * - /motorista/perfil: Página de destino (após sucesso/voltar)
 *
 * @example
 * ```tsx
 * // Uso em rota protegida
 * <EditarMotoristaPage />
 * ```
 *
 * @see /src/components/motorista/editar/edicao-perfil.tsx - Formulário de edição
 * @see /src/lib/api/motoristaApi.ts - Função getMotoristaByUserId
 */

export default function EditarMotoristaPage() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const router = useRouter();

  const [motorista, setMotorista] = useState<Motorista | null>(null);
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

    async function fetchMotorista() {
      setLoading(true);
      setError('');

      try {
        const result = await getMotoristaByUserId(user!.id);

        if (result.error) {
          setError(result.motorista);
          setMotorista(null);
        } else {
          const m = result.motorista;
          if (!m) {
            setError('Motorista não encontrado.');
          } else {
            setMotorista(m);
          }
        }
      } catch {
        setError('Erro ao buscar perfil do motorista.');
      } finally {
        setLoading(false);
      }
    }

    fetchMotorista();
  }, [user?.id]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando perfil do motorista...</span>
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
            href="/motorista/perfil"
            className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base font-medium w-full"
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
            {/* Fundo gradiente (laranja/amarelo) */}
            <div className="absolute inset-0 -top-4 sm:-top-6 -mx-4 sm:-mx-6 lg:-mx-8 h-40 sm:h-48 bg-gradient-to-br from-orange-50/30 via-white to-yellow-50/30 rounded-b-2xl sm:rounded-b-3xl pointer-events-none" />

            <div className="relative">
              {/* Barra superior com botão voltar e indicador */}
              <div className="flex justify-between items-start mb-6 sm:mb-0">
                {/* Botão voltar */}
                <Link
                  href="/motorista/perfil"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 group transition-all duration-200 text-sm sm:text-base bg-white/80 backdrop-blur-sm sm:bg-transparent px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-medium group-hover:text-orange-600">
                    Voltar para perfil
                  </span>
                </Link>

                {/* Indicador de página (desktop) */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span>Editando perfil de motorista</span>
                </div>
              </div>

              {/* Título e ícone */}
              <div className="text-center pt-4 sm:pt-8 lg:pt-12 pb-6 sm:pb-8">
                {/* Ícone decorativo (CheckCircle) */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                  </div>
                </div>

                {/* Título */}
                <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                  Edição de Perfil
                </h1>

                {/* Descrição */}
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-xl mx-auto px-4 leading-relaxed">
                  Atualize suas informações de condução, documentos e
                  disponibilidade
                </p>
              </div>
            </div>
          </div>

          {/* CARD DO FORMULÁRIO */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* ESTADO 4: MOTORISTA NÃO ENCONTRADO */}
            {!motorista ? (
              <div className="p-4 sm:p-6 md:p-8 text-center">
                {/* Ícone UserX */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserX className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400" />
                </div>

                {/* Título e mensagem */}
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Motorista não encontrado
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Não foi possível carregar as informações do motorista.
                </p>

                {/* Botão de retorno */}
                <Link
                  href="/motorista/perfil"
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para perfil
                </Link>
              </div>
            ) : (
              /* ESTADO 5: MOTORISTA ENCONTRADO - Formulário de edição */
              <div className="p-3 xs:p-4 sm:p-6 lg:p-8">
                <EditarMotorista
                  motorista={motorista}
                  onSuccess={() => router.push('/motorista/perfil')}
                />
              </div>
            )}
          </div>

          {/* CARD INFORMATIVO (laranja) */}
          <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 p-3 xs:p-4 sm:p-6 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {/* Ícone Info */}
              <div className="flex-shrink-0">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-500" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 text-xs xs:text-sm sm:text-base">
                  Informação importante para motoristas
                </h4>
                <p className="text-orange-700 text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed">
                  Certifique-se de manter seus documentos de habilitação e
                  veículo sempre atualizados. Informações incorretas podem
                  afetar sua elegibilidade para viagens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
