'use client';

import { useState, useCallback } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { solicitarRecuperacaoSenha } from '@/lib/api/recuperacaoApi';
import { validateEmail } from '@/lib/utils';

export default function RecuperacaoSenha() {
  const [identificador, setIdentificador] = useState('');
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [tipoInput, setTipoInput] = useState<'email' | 'cpf' | 'indeterminado'>(
    'indeterminado',
  );

  const identificarTipoIdentificador = useCallback(
    (input: string): 'email' | 'cpf' | 'indeterminado' => {
      if (!input.trim()) return 'indeterminado';

      const apenasNumeros = input.replace(/\D/g, '');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailRegex.test(input)) {
        return 'email';
      } else if (/^\d+$/.test(input) && apenasNumeros.length === 11) {
        return 'cpf';
      } else if (/^\d+$/.test(input) && apenasNumeros.length > 0) {
        return 'cpf';
      }

      return 'indeterminado';
    },
    [],
  );

  const emailValido = useCallback((email: string): boolean => {
    return validateEmail(email);
  }, []);

  const cpfValido = useCallback((cpf: string): boolean => {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
  }, []);

  const validarFormulario = (): string | null => {
    if (!identificador.trim()) {
      return 'Por favor, digite seu email ou CPF.';
    }

    const tipo = identificarTipoIdentificador(identificador);

    if (tipo === 'email' && !emailValido(identificador)) {
      return 'Por favor, digite um email válido.';
    }

    if (tipo === 'cpf' && !cpfValido(identificador)) {
      return 'CPF deve conter 11 dígitos.';
    }

    if (tipo === 'indeterminado') {
      return 'Formato inválido. Use email ou CPF (apenas números).';
    }

    return null;
  };

  const handleIdentificadorChange = (value: string) => {
    setIdentificador(value);
    setTipoInput(identificarTipoIdentificador(value));
  };

  const enviarCodigoRecuperacao = async () => {
    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setStatus('error');
      setMensagem(erroValidacao);
      return;
    }

    setEstaCarregando(true);
    setStatus(null);
    setMensagem('');

    try {
      await solicitarRecuperacaoSenha(identificador);
      setStatus('success');
      setMensagem(
        'Se este email/CPF estiver cadastrado, você receberá um código em instantes.',
      );
      setMostrarModal(true);
      setCodigoEnviado(true);
    } catch (erro: unknown) {
      setStatus('error');
      setMensagem(
        (erro instanceof Error ? erro.message : 'Erro ao solicitar recuperação. Tente novamente.') || 'Erro ao solicitar recuperação. Tente novamente.',
      );
    } finally {
      setEstaCarregando(false);
    }
  };

  const aoPressionarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !estaCarregando) {
      enviarCodigoRecuperacao();
    }
  };

  const irParaLogin = () => {
    window.location.href = '/autorizacao/login';
  };

  const tentarOutroIdentificador = () => {
    setIdentificador('');
    setCodigoEnviado(false);
    setStatus(null);
    setMensagem('');
    setMostrarModal(false);
    setTipoInput('indeterminado');
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setStatus(null);
    setMensagem('');
    irParaLogin();
  };

  const getInputIcon = () => {
    if (tipoInput === 'email') {
      return <Mail className="w-5 h-5 text-indigo-600" />;
    } else if (tipoInput === 'cpf') {
      return <User className="w-5 h-5 text-indigo-600" />;
    }
    return <Mail className="w-5 h-5 text-indigo-600" />;
  };

  const getFormatHint = () => {
    if (tipoInput === 'email') {
      return (
        <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
          ✓ Formato de email válido
        </span>
      );
    } else if (tipoInput === 'cpf') {
      const apenasNumeros = identificador.replace(/\D/g, '');
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
    } else if (identificador && tipoInput === 'indeterminado') {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm sm:backdrop-blur-lg flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-5 sm:p-6 md:p-8 max-w-sm sm:max-w-md w-full mx-3 animate-fadeIn">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Solicitação recebida
              </h2>

              {status && (
                <div
                  className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 border ${
                    status === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-xs sm:text-sm">{mensagem}</p>
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                <button
                  onClick={fecharModal}
                  className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-200 transition"
                >
                  Voltar para o login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-indigo-100 rounded-full mb-3 sm:mb-4">
              {getInputIcon()}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Recuperar Senha
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Digite seu email ou CPF para receber o código de recuperação.
            </p>
          </div>

          {status && !mostrarModal && (
            <div
              className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 border ${
                status === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-xs sm:text-sm">{mensagem}</p>
            </div>
          )}

          {!codigoEnviado ? (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor="identificador"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                >
                  Email ou CPF cadastrado
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {getInputIcon()}
                  </div>
                  <input
                    type="text"
                    id="identificador"
                    value={identificador}
                    onChange={(e) => handleIdentificadorChange(e.target.value)}
                    onKeyDown={aoPressionarTecla}
                    placeholder="seu@email.com ou 12345678900"
                    className="w-full pl-10 pr-3 sm:pl-10 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50"
                    disabled={estaCarregando}
                  />
                </div>
                {getFormatHint()}
              </div>

              <button
                onClick={enviarCodigoRecuperacao}
                disabled={estaCarregando || tipoInput === 'indeterminado'}
                className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {estaCarregando ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Enviando...</span>
                    <span className="inline sm:hidden">Enviando...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Enviar código de recuperação
                    </span>
                    <span className="inline sm:hidden">Enviar código</span>
                  </>
                )}
              </button>

              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={irParaLogin}
                  disabled={estaCarregando}
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 disabled:opacity-50"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  Voltar para o login
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Solicitação recebida!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Se este {tipoInput === 'email' ? 'email' : 'CPF'} estiver
                  cadastrado, você receberá um código em instantes.
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Verifique sua caixa de entrada e também a pasta de spam.
                </p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={irParaLogin}
                  className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition"
                >
                  Voltar para o login
                </button>
                <button
                  onClick={tentarOutroIdentificador}
                  className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-200 transition"
                >
                  Tentar outro {tipoInput === 'email' ? 'email' : 'CPF'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            O código tem validade de 15 minutos. Não compartilhe com ninguém.
          </p>
        </div>
      </div>
    </div>
  );
}
