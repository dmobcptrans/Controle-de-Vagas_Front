'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Key,
  RefreshCw,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import ModalAtivacaoConta from '@/components/modal/autorizacao/login/ModalAtivacaoConta';
import ButtonLoginGoogle from '@/components/ui/buttonLoginGoogle';

/**
 * @component LoginPage
 * @version 1.0.0
 *
 * @description Página de autenticação do sistema com suporte a múltiplos tipos de login
 * e redirecionamento baseado em permissões.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO DE AUTENTICAÇÃO:
 * ----------------------------------------------------------------------------
 * 1. Usuário insere credenciais (email ou CPF + senha)
 * 2. Sistema identifica automaticamente o tipo de input (email/CPF/inválido)
 * 3. Validações em tempo real fornecem feedback visual
 * 4. Ao submit, chama hook useAuth.login()
 * 5. Após autenticação bem-sucedida:
 *    - Decodifica permissões do usuário do token JWT
 *    - Redireciona para dashboard específico por perfil
 * 6. Se já estiver autenticado, redireciona automaticamente
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * - Suspense + useSearchParams: O Next.js exige Suspense quando useSearchParams
 *   é usado. Separamos o conteúdo em LoginContent para permitir isso.
 *
 * - Identificação automática de input: Função identificarTipoLogin analisa
 *   o texto digitado para determinar se é email (regex), CPF (11 dígitos)
 *   ou inválido, fornecendo feedback em tempo real.
 *
 * - Controle de input por tipo: handleInputChange limita CPF a 11 dígitos
 *   e remove caracteres não-numéricos automaticamente.
 *
 * - Gerenciamento de estado do modal via URL: Usamos query param 'ativar-conta'
 *   para controlar o modal, permitindo compartilhamento de link e persistência
 *   após refresh.
 *
 * - Redirecionamento pós-login: Baseado na permissão do usuário (ADMIN, GESTOR,
 *   MOTORISTA, AGENTE) para garantir acesso às rotas corretas.
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * - useAuth: Hook customizado com lógica de autenticação (login, logout, estado)
 * - ModalAtivacaoConta: Modal para ativação de conta via código
 * - /autorizacao/cadastro: Página de cadastro de novos usuários
 * - /autorizacao/verificacao: Página de recuperação de senha
 *
 * ----------------------------------------------------------------------------
 * 🎨 ANIMAÇÕES E UX:
 * ----------------------------------------------------------------------------
 * - Blobs animados no fundo para efeito visual moderno
 * - Spinner durante loading
 * - Feedback visual em tempo real para validação de input
 * - Ícones contextuais que mudam conforme tipo de input
 * - Botões com gradientes e sombras para melhor hierarquia visual
 *
 * @example
 * // Uso direto (rota pública)
 * <LoginPage />
 *
 * @see /src/components/hooks/useAuth.ts - Hook de autenticação
 * @see /src/components/modal/autorizacao/login/ModalAtivacaoConta - Modal de ativação
 */

// ----------------------------------------------------------------------------
// CONSTANTES E CONFIGURAÇÕES
// ----------------------------------------------------------------------------

/**
 * Mensagens de erro padronizadas para consistência
 */
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciais inválidas. Verifique email/CPF e senha.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNKNOWN_PERMISSION: 'Permissão desconhecida. Contate o suporte.',
  GENERIC: 'Erro ao fazer login. Tente novamente.',
} as const;

/**
 * Mensagens de feedback para validação de input
 */
const INPUT_FEEDBACK = {
  EMAIL_VALID: '✓ Formato de email válido',
  CPF_VALID: '✓ CPF válido (11 dígitos)',
  CPF_INCOMPLETE: (current: number) => `⚠ CPF: ${current}/11 dígitos`,
  INVALID: '✗ Formato inválido. Use email ou CPF (apenas números)',
  HINT: 'Digite seu email ou CPF (11 dígitos)',
} as const;

/**
 * Rotas de redirecionamento por permissão
 */
const ROUTES_BY_PERMISSION = {
  ADMIN: '/gestor/visualizar-vagas',
  GESTOR: '/gestor/visualizar-vagas',
  MOTORISTA: '/motorista/reservar-vaga',
  AGENTE: '/agente/consulta',
} as const;

/**
 * @function identificarTipoLogin
 * @description Analisa o input do usuário para determinar se é email, CPF ou inválido.
 * Usada para validação em tempo real e adaptação da UI.
 *
 * @param input - String digitada pelo usuário
 * @returns Tipo identificado: 'email' | 'cpf' | 'invalido' | 'indeterminado'
 *
 * @example
 * identificarTipoLogin('joao@email.com') // 'email'
 * identificarTipoLogin('12345678901') // 'cpf'
 * identificarTipoLogin('abc') // 'invalido'
 */
function identificarTipoLogin(
  input: string,
): 'email' | 'cpf' | 'invalido' | 'indeterminado' {
  if (!input.trim()) return 'indeterminado';

  const apenasNumeros = input.replace(/\D/g, '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(input)) {
    return 'email';
  } else if (/^\d+$/.test(input) && apenasNumeros.length === 11) {
    return 'cpf';
  } else if (
    /^\d+$/.test(input) &&
    apenasNumeros.length > 0 &&
    apenasNumeros.length < 11
  ) {
    return 'cpf';
  }

  return 'invalido';
}

/**
 * Componente interno que contém a lógica de login
 * Separado para permitir uso de useSearchParams dentro de Suspense
 */
function LoginContent() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const [loginInput, setLoginInput] = useState(''); // Email ou CPF digitado
  const [senha, setSenha] = useState(''); // Senha digitada
  const [showPassword, setShowPassword] = useState(false); // Controle visual da senha
  const [error, setError] = useState(''); // Mensagem de erro
  const [loading, setLoading] = useState(false); // Estado de loading
  const [mostrarModal, setMostrarModal] = useState(false); // Controle do modal de ativação

  // Hooks
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tipo do input atual (calculado, não estado)
  const tipoInput = identificarTipoLogin(loginInput);

  // --------------------------------------------------------------------------
  // EFEITOS COLATERAIS
  // --------------------------------------------------------------------------

  /**
   * Verifica se a URL contém parâmetro para abrir modal de ativação
   * Permite compartilhamento de link direto para ativação de conta
   */
  useEffect(() => {
    const ativarContaParam = searchParams.get('ativar-conta');
    if (ativarContaParam === 'true') {
      setMostrarModal(true);
    }
  }, [searchParams]);

  /**
   * Redireciona usuário já autenticado para o dashboard correto
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      const route =
        ROUTES_BY_PERMISSION[
          user.permissao as keyof typeof ROUTES_BY_PERMISSION
        ];
      if (route) {
        router.replace(route);
      }
    }
  }, [isAuthenticated, user, router]);

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  /**
   * @function handleLogin
   * @description Processa a tentativa de login do usuário
   *
   * Fluxo:
   * 1. Ativa loading e limpa erros anteriores
   * 2. Processa input conforme tipo (email minúsculo / CPF só números)
   * 3. Chama hook useAuth.login com credenciais
   * 4. Em caso de sucesso: redireciona baseado na permissão
   * 5. Em caso de erro: exibe mensagem amigável
   *
   * @throws {Error} Se login falhar (capturado e tratado)
   */
  async function handleLogin() {
    setLoading(true);
    setError('');

    try {
      // Normaliza o input conforme o tipo
      const loginProcessado =
        tipoInput === 'email'
          ? loginInput.trim().toLowerCase() // Email em minúsculo
          : loginInput.replace(/\D/g, ''); // CPF só números

      const decodedUser = await login({
        login: loginProcessado,
        senha,
      });

      // Redireciona baseado na permissão
      const route =
        ROUTES_BY_PERMISSION[
          decodedUser.permissao as keyof typeof ROUTES_BY_PERMISSION
        ];

      if (route) {
        router.replace(route);
      } else {
        setError(ERROR_MESSAGES.UNKNOWN_PERMISSION);
      }
    } catch (err: unknown) {
      // Tratamento de erro amigável
      setError((err as Error).message || ERROR_MESSAGES.GENERIC);
    } finally {
      setLoading(false);
    }
  }

  /**
   * @function handleOpenModal
   * @description Abre o modal de ativação de conta e atualiza URL com parâmetro
   * Isso permite compartilhamento de link direto para ativação
   */
  const handleOpenModal = () => {
    setMostrarModal(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('ativar-conta', 'true');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  /**
   * @function handleCloseModal
   * @description Fecha o modal de ativação e remove parâmetro da URL
   */
  const handleCloseModal = () => {
    setMostrarModal(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('ativar-conta');
    const newUrl =
      params.toString() === ''
        ? window.location.pathname
        : `?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  /**
   * @function handleInputChange
   * @description Gerencia mudanças no input de login com validação contextual
   *
   * Regras:
   * - Se for CPF (ou só números): limita a 11 dígitos e remove não-números
   * - Se for email: aceita qualquer caractere (validação apenas no submit)
   */
  const handleInputChange = (value: string) => {
    if (tipoInput === 'cpf' || /^\d+$/.test(value)) {
      const apenasNumeros = value.replace(/\D/g, '');
      if (apenasNumeros.length <= 11) {
        setLoginInput(apenasNumeros);
      }
    } else {
      setLoginInput(value);
    }
  };

  // --------------------------------------------------------------------------
  // UI DINÂMICA (valores calculados para renderização)
  // --------------------------------------------------------------------------

  /**
   * Ícone dinâmico baseado no tipo de input
   */
  const inputIcon =
    tipoInput === 'cpf' ? (
      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
    ) : (
      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
    );

  /**
   * Hint dinâmico para feedback em tempo real
   */
  const formatHint = (() => {
    if (tipoInput === 'email') {
      return (
        <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
          {INPUT_FEEDBACK.EMAIL_VALID}
        </span>
      );
    } else if (tipoInput === 'cpf') {
      const apenasNumeros = loginInput.replace(/\D/g, '');
      if (apenasNumeros.length === 11) {
        return (
          <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
            {INPUT_FEEDBACK.CPF_VALID}
          </span>
        );
      } else {
        return (
          <span className="text-xs text-amber-600 mt-1">
            {INPUT_FEEDBACK.CPF_INCOMPLETE(apenasNumeros.length)}
          </span>
        );
      }
    } else if (loginInput && tipoInput === 'invalido') {
      return (
        <span className="text-xs text-red-600 mt-1">
          {INPUT_FEEDBACK.INVALID}
        </span>
      );
    } else {
      return (
        <span className="text-xs text-gray-500 mt-1">
          {INPUT_FEEDBACK.HINT}
        </span>
      );
    }
  })();

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Elementos decorativos de fundo (blobs animados) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-more-delayed"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl backdrop-blur-sm bg-white/90 border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Bem-vindo
          </CardTitle>
          <CardDescription className="text-base">
            Entre com email ou CPF para acessar o sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Campo de login (email/CPF) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email ou CPF
              </label>
              <div className="relative">
                {inputIcon}
                <Input
                  type="text"
                  value={loginInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="seu@email.com ou 12345678900"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                  disabled={loading}
                  inputMode={tipoInput === 'cpf' ? 'numeric' : 'text'}
                />
              </div>
              {formatHint}
            </div>

            {/* Campo de senha */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Links de ação (ativação e recuperação de senha) */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleOpenModal}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline flex items-center gap-1"
              >
                <Key className="w-4 h-4" />
                Ativar Conta
              </button>

              <div className="flex-1 text-center mx-4">
                <div className="h-px bg-gray-300"></div>
              </div>

              <Link
                href="/autorizacao/verificacao"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Botão de submit */}
            <Button
              type="submit"
              disabled={
                loading || !loginInput || !senha || tipoInput === 'invalido'
              }
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          
          <div className="mt-4 w-full flex flex-col items-center">
          <ButtonLoginGoogle />
          </div>

          {/* Botão de cadastro */}
          <div className="mt-4 space-y-4">
            <Link href="/autorizacao/cadastro">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                Criar Conta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Modal de ativação de conta */}
      <ModalAtivacaoConta
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        onClose={handleCloseModal}
        cpfInicial={tipoInput === 'cpf' ? loginInput.replace(/\D/g, '') : ''}
      />
    </div>
  );
}

/**
 * @component LoginPage
 * @description Wrapper com Suspense para permitir uso de useSearchParams
 *
 * O Next.js 13+ exige que componentes que usam useSearchParams sejam
 * envolvidos em Suspense. Este wrapper garante que a página funcione
 * corretamente com SSR e CSR.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
