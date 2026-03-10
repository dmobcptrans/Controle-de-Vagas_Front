'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { redefinirSenhaComCodigo } from '@/lib/api/recuperacaoApi';
import useValidacaoSenha from '@/components/hooks/useValidacaoSenha';
import FeedbackSenha from '@/components/feedback/feedback-senha';
import ModalSucessoRedefinicao from '@/components/modal/autorizacao/nova-senha/ModalSucessoRedefinicao';

export default function ResetarSenhaComCodigo() {
  // Estados principais
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const {
    senha: novaSenha,
    setSenha: setNovaSenha,
    regras,
    ehValida,
    forca,
  } = useValidacaoSenha();
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados de controle
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [senhasIguais, setSenhasIguais] = useState(true);
  const [etapa, setEtapa] = useState<'codigo' | 'senha'>('codigo');

  // Validação das senhas
  useEffect(() => {
    if (confirmarSenha === '') {
      setSenhasIguais(true);
    } else {
      setSenhasIguais(novaSenha === confirmarSenha);
    }
  }, [novaSenha, confirmarSenha]);

  // Validações
  const emailValido = useCallback((email: string): boolean => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }, []);

  const validarFormularioCodigo = (): string | null => {
    if (!email.trim()) return 'Por favor, digite seu email.';
    if (!emailValido(email)) return 'Por favor, digite um email válido.';
    if (!codigo.trim()) return 'Por favor, digite o código de verificação.';
    if (codigo.trim().length !== 6) return 'O código deve ter 6 dígitos.';
    return null;
  };

  const validarFormularioSenha = (): string | null => {
    if (!novaSenha) return 'Por favor, digite a nova senha.';
    if (!ehValida) return 'A senha não atende aos requisitos mínimos.';
    if (novaSenha !== confirmarSenha) return 'As senhas não coincidem.';
    return null;
  };

  // Função para ir para a etapa de senha
  const irParaEtapaSenha = () => {
    const erroValidacao = validarFormularioCodigo();
    if (erroValidacao) {
      setStatus('error');
      setMensagem(erroValidacao);
      return;
    }

    setEtapa('senha');
    setStatus(null);
    setMensagem('');
  };

  // Função para voltar para etapa de código
  const voltarParaEtapaCodigo = () => {
    setEtapa('codigo');
    setNovaSenha('');
    setConfirmarSenha('');
    setStatus(null);
    setMensagem('');
  };

  // Função para redefinir a senha
  const redefinirSenha = async () => {
    const erroValidacao = validarFormularioSenha();
    if (erroValidacao) {
      setStatus('error');
      setMensagem(erroValidacao);
      return;
    }

    setEstaCarregando(true);
    setStatus(null);
    setMensagem('');

    try {
      await redefinirSenhaComCodigo(email, codigo, novaSenha);

      setStatus('success');
      setMostrarModalSucesso(true);
    } catch {
      setStatus('error');
      setMensagem('Não foi possível redefinir a senha. Tente novamente.');
    } finally {
      setEstaCarregando(false);
    }
  };

  // Funções auxiliares
  const irParaLogin = () => {
    window.location.href = '/autorizacao/login';
  };

  const fecharModal = () => {
    setMostrarModalSucesso(false);
  };

  const aoPressionarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !estaCarregando) {
      if (etapa === 'codigo') {
        irParaEtapaSenha();
      } else {
        redefinirSenha();
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-indigo-100 rounded-full mb-3 sm:mb-4">
                {etapa === 'codigo' ? (
                  <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-indigo-600" />
                ) : (
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-indigo-600" />
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                {etapa === 'codigo' ? 'Validar Código' : 'Nova Senha'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {etapa === 'codigo'
                  ? 'Digite seu email e o código recebido'
                  : 'Crie sua nova senha'}
              </p>
            </div>

            {/* Mensagem de Status */}
            {mensagem && (
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

            {etapa === 'codigo' ? (
              /* Etapa 1: Código */
              <div className="space-y-4 sm:space-y-6">
                {/* Campo Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={aoPressionarTecla}
                    placeholder="seu@email.com"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50"
                    disabled={estaCarregando}
                  />
                </div>

                {/* Campo Código */}
                <div>
                  <label
                    htmlFor="codigo"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Código de Verificação
                  </label>
                  <input
                    type="text"
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    onKeyDown={aoPressionarTecla}
                    placeholder="Digite o código recebido"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50 uppercase"
                    disabled={estaCarregando}
                    maxLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Digite o código de 6 dígitos enviado para seu email
                  </p>
                </div>

                {/* Botão Continuar */}
                <button
                  onClick={irParaEtapaSenha}
                  disabled={estaCarregando}
                  className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {estaCarregando ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Processando...</span>
                      <span className="inline sm:hidden">Processando...</span>
                    </>
                  ) : (
                    'Continuar'
                  )}
                </button>

                {/* Link para voltar */}
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
              /* Etapa 2: Nova Senha */
              <div className="space-y-4 sm:space-y-6">
                {/* Informação do email e código */}
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      Email:
                    </span>
                    <span className="text-xs text-gray-600 truncate ml-2">
                      {email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Código:
                    </span>
                    <span className="text-xs text-gray-600 font-mono">
                      {codigo}
                    </span>
                  </div>
                </div>

                {/* Campo Nova Senha */}
                <div>
                  <label
                    htmlFor="novaSenha"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      id="novaSenha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      onKeyDown={aoPressionarTecla}
                      placeholder="Digite sua nova senha"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50"
                      disabled={estaCarregando}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarSenha ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  <FeedbackSenha
                    regras={regras}
                    forca={forca}
                    senha={novaSenha}
                  />
                </div>

                {/* Campo Confirmar Senha */}
                <div>
                  <label
                    htmlFor="confirmarSenha"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarConfirmarSenha ? 'text' : 'password'}
                      id="confirmarSenha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      onKeyDown={aoPressionarTecla}
                      placeholder="Digite a senha novamente"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50"
                      disabled={estaCarregando}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                      }
                      className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarConfirmarSenha ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {!senhasIguais && confirmarSenha !== '' && (
                    <p className="text-red-500 text-xs mt-1">
                      As senhas não coincidem
                    </p>
                  )}
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={redefinirSenha}
                    disabled={estaCarregando}
                    className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {estaCarregando ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">
                          Alterando senha...
                        </span>
                        <span className="inline sm:hidden">Alterando...</span>
                      </>
                    ) : (
                      'Redefinir Senha'
                    )}
                  </button>

                  <button
                    onClick={voltarParaEtapaCodigo}
                    disabled={estaCarregando}
                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            {etapa === 'codigo' && (
              <>
                <p className="text-center text-xs sm:text-sm text-gray-600">
                  Não recebeu o código? Verifique sua caixa de spam.
                </p>
                <p className="text-center text-xs text-gray-500">
                  O código é válido por 30 minutos.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Sucesso */}
      <ModalSucessoRedefinicao
        isOpen={mostrarModalSucesso}
        onClose={fecharModal}
        onLoginRedirect={irParaLogin}
      />
    </>
  );
}
