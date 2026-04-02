'use client';

import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/hooks/useAuth';
import { deleteMotorista, getMotoristaByUserId } from '@/lib/api/motoristaApi';
import { Motorista } from '@/lib/types/motorista';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  UserIcon,
  Mail,
  Phone,
  FileText,
  Trash2,
  Fingerprint,
  IdCardIcon,
  Loader2,
  Edit,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PushNotificationToggle } from '@/components/notification/PushNotificationToggle';
import ModalConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';
import toast from 'react-hot-toast';

/**
 * @component PerfilMotorista
 * @version 1.0.0
 *
 * @description Página de perfil do motorista.
 * Exibe informações pessoais e da CNH, permite edição e exclusão da conta.
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
 *    - Retorna motorista com dados aninhados (usuario + CNH)
 *
 * 3. ESTADOS DE UI (5 ESTADOS):
 *
 *    a) LOADING INICIAL:
 *       - Spinner centralizado
 *       - Mensagem "Carregando perfil..."
 *
 *    b) ERRO DE AUTENTICAÇÃO/BUSCA:
 *       - Card vermelho com ícone de alerta
 *       - Botão "Fazer Login"
 *
 *    c) MOTORISTA NÃO ENCONTRADO:
 *       - Mensagem simples "Nenhum dado encontrado"
 *
 *    d) SUCESSO:
 *       - Card principal com perfil
 *       - Saudação personalizada
 *       - Grid de informações (6 cards)
 *       - Toggle de notificações push
 *       - Botões "Editar Perfil" e "Excluir Conta"
 *
 * 4. EXCLUSÃO DE CONTA:
 *    - Modal de confirmação (ModalConfirmacaoExclusao)
 *    - Chama API deleteMotorista
 *    - Em sucesso: logout e redirecionamento para home
 *    - Feedback com toast para erro/sucesso
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - ESTRUTURA ANINHADA: Motorista contém objeto usuario
 *   - motorista.usuario.nome
 *   - motorista.usuario.cpf
 *   - motorista.numeroCnh (direto)
 *
 * - GRID RESPONSIVO:
 *   - Mobile: 1 coluna
 *   - Tablet: 2 colunas
 *   - Desktop: 3 colunas (com email ocupando espaço especial)
 *
 * - AÇÕES DO PERFIL:
 *   - Editar: Link para página de edição
 *   - Excluir: Modal de confirmação + toast feedback
 *
 * - SEGURANÇA:
 *   - Confirmação em modal antes de excluir
 *   - Logout automático após exclusão
 *   - Redirecionamento para home
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - PushNotificationToggle: Configuração de notificações
 * - ModalConfirmacaoExclusao: Modal de confirmação
 * - /motorista/perfil/editar-perfil: Página de edição
 * - useAuth: Hook de autenticação (com logout)
 *
 * @example
 * ```tsx
 * // Uso em rota protegida
 * <PerfilMotorista />
 * ```
 *
 * @see /src/lib/api/motoristaApi.ts - Funções getMotoristaByUserId e deleteMotorista
 * @see /src/components/notification/PushNotificationToggle.tsx - Toggle de notificações
 * @see /src/components/modal/confirmacaoExclusao.tsx - Modal de confirmação
 */

export default function PerfilMotorista() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // --------------------------------------------------------------------------
  // EFEITO DE BUSCA
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchMotorista = async () => {
      setLoading(true);
      setError(null);

      try {
        const resultado = await getMotoristaByUserId(user.id);
        if (resultado.error) {
          setError(resultado.message || 'Erro ao buscar perfil');
        } else {
          setMotorista(resultado.motorista);
        }
      } catch {
        setError('Erro ao carregar informações do perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchMotorista();
  }, [user?.id]);

  // --------------------------------------------------------------------------
  // HANDLER DE EXCLUSÃO
  // --------------------------------------------------------------------------

  const handleExcluir = async () => {
    if (!user) return;

    try {
      const resultado = await deleteMotorista(user.id);

      if (resultado?.error) {
        toast.error(resultado.message || 'Erro ao excluir conta.');
        return;
      }

      setModalAberto(false);
      await logout();
      router.push('/');
    } catch {
      toast.error('Erro ao excluir conta. Tente novamente.');
    }
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando perfil...</span>
      </div>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro ao carregar perfil
          </h2>
          <p className="text-gray-600 mb-4 break-words">{error}</p>
          <button
            onClick={() => router.push('/autorizacao/login')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition w-full sm:w-auto"
          >
            Fazer Login
          </button>
        </div>
      </main>
    );
  }

  if (!motorista) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado encontrado.</p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO DE SUCESSO
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ── */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Seu Perfil, {motorista.usuario.nome.split(' ')[0]}!
          </h1>
          <p className="text-xs text-white/50 capitalize">
            Aqui você pode ver suas informações e atualizar seus dados.
          </p>
        </div>
      </header>
      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* CTA flutuante */}
        <div className="-mt-4 mb-2 flex justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#071D41] rounded-2xl flex items-center justify-center shadow-lg">
            <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
        <Card className="w-full max-w-4xl mx-auto shadow-sm md:shadow-lg">
          <div className="px-4 sm:px-6 pb-6 space-y-6">
            {/* Grid de informações (6 cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 1: Nome */}
              <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {motorista.usuario.nome}
                  </p>
                </div>
              </div>

              {/* Card 2: Telefone */}
              <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {motorista.usuario.telefone}
                  </p>
                </div>
              </div>

              {/* Card 3: Número da CNH */}
              <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                <IdCardIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    Número da CNH
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                    {motorista.numeroCnh}
                  </p>
                </div>
              </div>

              {/* Card 4: Tipo da CNH */}
              <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    Tipo da CNH
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {motorista.tipoCnh}
                  </p>
                </div>
              </div>

              {/* Card 5: CPF */}
              <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                <Fingerprint className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">CPF</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                    {motorista.usuario.cpf}
                  </p>
                </div>
              </div>

              {/* Card 6: Email (ocupa espaço especial no tablet) */}
              <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl col-span-1 sm:col-span-2 lg:col-span-1">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                    {motorista.usuario.email}
                  </p>
                </div>
              </div>
            </div>
            {/* Toggle de notificações push */}
            <section>
              <PushNotificationToggle usuarioId={motorista.usuario.id} />
            </section>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6">
              {/* Botão Editar Perfil */}
              <Link
                href="/motorista/perfil/editar-perfil"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'flex items-center justify-center gap-2 px-8 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base w-full sm:w-auto min-w-[150px] font-medium',
                )}
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Editar Perfil</span>
              </Link>

              {/* Botão Excluir Conta */}
              <button
                onClick={() => setModalAberto(true)}
                className={cn(
                  buttonVariants({ variant: 'destructive' }),
                  'flex items-center justify-center gap-2 px-8 py-3 h-12 bg-red-500 hover:bg-red-600 text-sm sm:text-base w-full sm:w-auto min-w-[150px] font-medium',
                )}
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Desativar Conta</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Modal de confirmação de exclusão */}
        <ModalConfirmacaoExclusao
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          onConfirm={handleExcluir}
          mensagem='Deseja mesmo desativar sua conta? Para reativar, basta ir em "Ativa Conta" no login.'
        />

        {/* Tutorial */}
        <Link
          href="/motorista/tutorial#perfil"
          className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors mt-6"
        >
          <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-[#1351B4]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#071D41]">
              Seus dados estão corretos?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Aprenda a manter seu perfil sempre atualizado
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
