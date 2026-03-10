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

function LoginContent() {
  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoInput, setTipoInput] = useState<
    'email' | 'cpf' | 'invalido' | 'indeterminado'
  >('indeterminado');

  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ativarContaParam = searchParams.get('ativar-conta');

    if (ativarContaParam === 'true') {
      setMostrarModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (mostrarModal) {
      const currentParams = new URLSearchParams(window.location.search);
      const hasParam = currentParams.get('ativar-conta') === 'true';

      if (!hasParam) {
        currentParams.set('ativar-conta', 'true');
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [mostrarModal]);

  useEffect(() => {
    const tipo = identificarTipoLogin(loginInput);
    setTipoInput(tipo);
  }, [loginInput]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      switch (user.permissao) {
        case 'ADMIN':
        case 'GESTOR':
          router.replace('/gestor/visualizar-vagas');
          break;
        case 'MOTORISTA':
          router.replace('/motorista/reservar-vaga');
          break;
        case 'AGENTE':
          router.replace('/agente/reserva-rapida');
          break;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

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

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

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

      switch (decodedUser.permissao) {
        case 'ADMIN':
        case 'GESTOR':
          window.location.href = '/gestor/visualizar-vagas';
          break;
        case 'MOTORISTA':
          window.location.href = '/motorista/reservar-vaga';
          break;
        case 'AGENTE':
          window.location.href = '/agente/consulta';
          break;
        default:
          setError('Permissão desconhecida');
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message || 'Erro ao fazer login. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = () => {
    setMostrarModal(true);

    const params = new URLSearchParams(searchParams.toString());
    params.set('ativar-conta', 'true');
    window.history.replaceState({}, '', `?${params.toString()}`);
  };

  const handleCloseModal = () => {
    setMostrarModal(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('ativar-conta');

    const newUrl =
      params.toString() === ''
        ? window.location.pathname
        : `?${params.toString()}`;

    window.history.replaceState({}, '', newUrl);
  };

  const getInputIcon = () => {
    if (tipoInput === 'email') {
      return (
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      );
    } else if (tipoInput === 'cpf') {
      return (
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      );
    } else {
      return (
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      );
    }
  };

  const getFormatHint = () => {
    if (tipoInput === 'email') {
      return (
        <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
          ✓ Formato de email válido
        </span>
      );
    } else if (tipoInput === 'cpf') {
      const apenasNumeros = loginInput.replace(/\D/g, '');
      if (apenasNumeros.length === 11) {
        return (
          <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
            ✓ CPF válido (11 dígitos)
          </span>
        );
      } else {
        return (
          <span className="text-xs text-amber-600 mt-1">
            ⚠ CPF: {apenasNumeros.length}/11 dígitos
          </span>
        );
      }
    } else if (loginInput && tipoInput === 'invalido') {
      return (
        <span className="text-xs text-red-600 mt-1">
          ✗ Formato inválido. Use email ou CPF (apenas números)
        </span>
      );
    } else {
      return (
        <span className="text-xs text-gray-500 mt-1">
          Digite seu email ou CPF (11 dígitos)
        </span>
      );
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email ou CPF
              </label>
              <div className="relative">
                {getInputIcon()}
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
              {getFormatHint()}
            </div>

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

          <div className="mt-4 space-y-4">
            <Link href="/autorizacao/cadastro">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                Criar Conta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Ativação de Conta */}
      <ModalAtivacaoConta
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        onClose={handleCloseModal}
        cpfInicial={tipoInput === 'cpf' ? loginInput.replace(/\D/g, '') : ''}
      />
    </div>
  );
}

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
