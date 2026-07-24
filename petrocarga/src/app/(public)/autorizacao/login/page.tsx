'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Key, User } from 'lucide-react';
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
 * @see /components/hooks/useAuth.ts - Hook de autenticação
 * @see /components/modal/autorizacao/login/ModalAtivacaoConta - Modal de ativação
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

  CNPJ_VALID: '✓ CNPJ válido (14 dígitos)',
  CNPJ_INCOMPLETE: (current: number) => `⚠ CNPJ: ${current}/14 dígitos`,

  INVALID: '✗ Formato inválido. Use email, CPF ou CNPJ (apenas números)',

  HINT: 'Digite seu email, CPF ou CNPJ',
} as const;

/**
 * Rotas de redirecionamento por permissão
 */
const ROUTES_BY_PERMISSION = {
  ADMIN: '/gestor/visualizar-vagas',
  GESTOR: '/gestor/visualizar-vagas',
  MOTORISTA: '/motorista/dashboard',
  AGENTE: '/agente/dashboard',
  EMPRESA: '/empresa/dashboard',
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
): 'email' | 'cpf' | 'cnpj' | 'invalido' | 'indeterminado' {
  if (!input.trim()) return 'indeterminado';

  const valor = input.trim();
  const apenasNumeros = valor.replace(/\D/g, '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(valor)) {
    return 'email';
  }

  if (apenasNumeros.length === 11) {
    return 'cpf';
  }

  if (apenasNumeros.length === 14) {
    return 'cnpj';
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
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
      const loginProcessado =
        tipoInput === 'email'
          ? loginInput.trim().toLowerCase()
          : loginInput.replace(/\D/g, '');

      const decodedUser = await login({
        login: loginProcessado,
        senha,
      });

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
    const apenasNumeros = value.replace(/\D/g, '');

    if (tipoInput === 'cpf') {
      if (apenasNumeros.length <= 11) {
        setLoginInput(apenasNumeros);
      }
      return;
    }

    if (tipoInput === 'cnpj') {
      if (apenasNumeros.length <= 14) {
        setLoginInput(apenasNumeros);
      }
      return;
    }

    if (/^\d+$/.test(apenasNumeros)) {
      if (apenasNumeros.length <= 14) {
        setLoginInput(apenasNumeros);
      }
      return;
    }

    // Email
    setLoginInput(value);
  };

  // --------------------------------------------------------------------------
  // UI DINÂMICA (valores calculados para renderização)
  // --------------------------------------------------------------------------

  /**
   * Ícone dinâmico baseado no tipo de input
   */
  const inputIcon =
    tipoInput === 'cpf' || tipoInput === 'cnpj' ? (
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
    }

    if (tipoInput === 'cpf') {
      const apenasNumeros = loginInput.replace(/\D/g, '');

      return apenasNumeros.length === 11 ? (
        <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
          {INPUT_FEEDBACK.CPF_VALID}
        </span>
      ) : (
        <span className="text-xs text-amber-600 mt-1">
          {INPUT_FEEDBACK.CPF_INCOMPLETE(apenasNumeros.length)}
        </span>
      );
    }

    if (tipoInput === 'cnpj') {
      const apenasNumeros = loginInput.replace(/\D/g, '');

      return apenasNumeros.length === 14 ? (
        <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
          {INPUT_FEEDBACK.CNPJ_VALID}
        </span>
      ) : (
        <span className="text-xs text-amber-600 mt-1">
          {INPUT_FEEDBACK.CNPJ_INCOMPLETE(apenasNumeros.length)}
        </span>
      );
    }

    if (loginInput && tipoInput === 'invalido') {
      return (
        <span className="text-xs text-red-600 mt-1">
          {INPUT_FEEDBACK.INVALID}
        </span>
      );
    }

    return (
      <span className="text-xs text-gray-500 mt-1">{INPUT_FEEDBACK.HINT}</span>
    );
  })();

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <div
      className="
      relative
      min-h-[calc(100dvh-64px)]
      w-full
      overflow-hidden
      bg-blue-800
    "
    >
      <div
        className="
        absolute
        left-1/2
        -translate-x-1/2
        bottom-0
        bg-blue-900/90
        backdrop-blur-[1px]
        pointer-events-none
        z-0
      "
        style={{
          width: '220%',
          height: '18%',
          borderTopLeftRadius: '50%',
          borderTopRightRadius: '50%',
          boxShadow: '0 -20px 60px rgba(30,58,138,0.35)',
        }}
      />

      <div className="relative z-10 w-full h-full min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Container principal de duas colunas */}
        <div
          className="
          relative
          z-10
          w-full
          max-w-6xl
          grid
          grid-cols-1
          md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]
          lg:grid-cols-2
          items-center
          justify-items-center
          gap-6
          md:gap-10
          lg:gap-12
          my-auto
        "
        >
          {/* 2. COLUNA DA IMAGEM (Ativa apenas no desktop) */}
          <div className="hidden md:flex items-center justify-center w-full max-w-4xl relative p-6 lg:p-12 self-stretch order-2 md:order-1">
            <motion.div
              initial={{ opacity: 1, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-900/90 backdrop-blur-[1px] pointer-events-none"
              style={{
                width: '400%',
                height: '100%',
                borderTopLeftRadius: '50% 100%',
                borderTopRightRadius: '50% 100%',
                boxShadow: '0 -30px 80px rgba(30,58,138,0.35)',
              }}
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Image
                src="/images/ilustracao-login-simples.webp"
                alt="Ilustração de login"
                width={1278}
                height={1024}
                priority
                className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,.25)]"
              />
            </motion.div>
          </div>

          {/* Card de Login à direita */}
          <motion.div
            initial={{
              x: isMobile ? 0 : 80,
              y: isMobile ? 80 : 0,
            }}
            animate={{
              x: 0,
              y: 0,
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-sm sm:max-w-md z-10 order-1 md:order-2"
          >
            <div
              className="
      w-full
      overflow-hidden
      rounded-4xl
      bg-white
      border border-gray-100
      shadow-[0_8px_30px_rgb(0,0,0,0.08)]
      p-8
    "
            >
              {/* Cabeçalho */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Bem-vindo de volta
                </h1>
                <p className="text-sm text-gray-500 mt-2">
                  Insira seus dados para acessar o sistema
                </p>
              </div>

              {/* Conteúdo / Formulário */}
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                  className="space-y-5"
                >
                  {/* Mensagem de erro */}
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  {/* Campo de login (Email/CPF/CNPJ) */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Email, CPF ou CNPJ
                    </label>

                    <div className="relative">
                      <div>{inputIcon}</div>

                      <Input
                        type="text"
                        value={loginInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="seu@email.com, 12345678900 ou 12345678000190"
                        className="pl-10 h-11 bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-lg w-full"
                        disabled={loading}
                        inputMode={
                          tipoInput === 'cpf' || tipoInput === 'cnpj'
                            ? 'numeric'
                            : 'text'
                        }
                      />
                    </div>

                    {formatHint && <div className="mt-1">{formatHint}</div>}
                  </div>

                  {/* Campo de senha */}
                  <div className="space-y-1.5">
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
                        className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-lg w-full"
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

                  {/* Links de ação (Ativação e Recuperação) */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleOpenModal}
                      className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Key className="w-4 h-4" />
                      Ativar Conta
                    </button>

                    <Link
                      href="/autorizacao/verificacao"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1.5"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>

                  {/* Botão de submit */}
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !loginInput ||
                      !senha ||
                      tipoInput === 'invalido'
                    }
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      'Entrar no sistema'
                    )}
                  </Button>
                </form>

                {/* Divisor Visual */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      ou
                    </span>
                  </div>
                </div>

                {/* Botão do Google */}
                <div className="w-full">
                  <ButtonLoginGoogle />
                </div>

                {/* Botão de cadastro no rodapé (mais sutil) */}
                <p className="text-center text-sm text-gray-600 mt-8">
                  Ainda não tem acesso?{' '}
                  <Link
                    href="/autorizacao/cadastro"
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Criar uma conta
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de ativação de conta */}
      <ModalAtivacaoConta
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        onClose={handleCloseModal}
        tipo="generico"
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
