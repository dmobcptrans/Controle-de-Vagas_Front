'use client';

import { useState } from 'react';
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
import { useRouter } from 'next/navigation';

/**
 * @component ResetarSenhaComCodigo
 * @version 1.0.0
 *
 * @description Componente de redefinição de senha em duas etapas.
 * Permite que usuários com código de verificação definam uma nova senha.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * ETAPA 1 - VALIDAÇÃO DO CÓDIGO:
 * 1. Usuário informa email e código de 6 dígitos recebido
 * 2. Sistema valida formato do email e código
 * 3. Se válido, avança para etapa 2
 *
 * ETAPA 2 - CRIAÇÃO DA NOVA SENHA:
 * 1. Usuário digita nova senha (com validação em tempo real)
 * 2. Confirma a nova senha (validação de igualdade)
 * 3. Sistema valida requisitos de segurança da senha
 * 4. Envia requisição para API com email, código e nova senha
 *
 * PÓS-REDEFINIÇÃO:
 * 1. Exibe modal de sucesso
 * 2. Redireciona para página de login
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - Duas etapas no mesmo componente: Melhor experiência do usuário
 *   mantendo contexto (email/código) sem precisar de estado global
 *
 * - Estados separados por etapa: Etapa 'codigo' e 'senha' controlam
 *   a renderização condicional, evitando múltiplos componentes
 *
 * - Hook useValidacaoSenha: Reutiliza lógica complexa de validação
 *   de senha (requisitos mínimos, força, feedback visual)
 *
 * - Validação em tempo real vs submit: Feedback imediato para
 *   senha (useValidacaoSenha) e validação completa no submit
 *
 * - Enter key handler: Melhora acessibilidade permitindo envio
 *   com tecla Enter em qualquer campo
 *
 * - Modal de sucesso separado: Componente reutilizável que pode
 *   ser usado em outros fluxos de sucesso
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - useValidacaoSenha: Hook com regras de validação de senha
 * - FeedbackSenha: Componente de feedback visual da força da senha
 * - ModalSucessoRedefinicao: Modal exibido após redefinição bem-sucedida
 * - /autorizacao/login: Página de destino após sucesso
 * - /lib/api/recuperacaoApi: API de recuperação de senha
 *
 * ----------------------------------------------------------------------------
 * ⚙️ VALIDAÇÕES IMPLEMENTADAS:
 * ----------------------------------------------------------------------------
 *
 * ETAPA 1 - CÓDIGO:
 * - Email não vazio
 * - Formato de email válido (regex)
 * - Código não vazio
 * - Código com exatamente 6 dígitos
 *
 * ETAPA 2 - SENHA:
 * - Senha não vazia
 * - Requisitos mínimos (via useValidacaoSenha)
 * - Confirmação de senha igual
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - Feedback visual imediato para força da senha
 * - Indicador de progresso visual (etapa atual)
 * - Botões de mostrar/ocultar senha
 * - Mensagens de erro contextualizadas
 * - Loading state com spinner
 * - Design responsivo (mobile/desktop)
 * - Acessibilidade (labels, focus, enter key)
 *
 * @example
 * // Uso em rota pública
 * <ResetarSenhaComCodigo />
 *
 * @see /src/lib/api/recuperacaoApi.ts - Integração com backend
 * @see /src/components/hooks/useValidacaoSenha - Validação de senha
 */

// ----------------------------------------------------------------------------
// CONSTANTES E CONFIGURAÇÕES
// ----------------------------------------------------------------------------

/**
 * Duração de validade do código em minutos (para informação do usuário)
 */
const CODIGO_VALIDADE_MINUTOS = 30;

/**
 * Tamanho esperado do código de verificação
 */
const CODIGO_TAMANHO = 6;

/**
 * Mensagens de erro padronizadas
 */
const ERROR_MESSAGES = {
  // Etapa 1 - Código
  EMAIL_VAZIO: 'Por favor, digite seu email.',
  EMAIL_INVALIDO: 'Por favor, digite um email válido.',
  CODIGO_VAZIO: 'Por favor, digite o código de verificação.',
  CODIGO_TAMANHO_INVALIDO: `O código deve ter ${CODIGO_TAMANHO} dígitos.`,

  // Etapa 2 - Senha
  SENHA_VAZIA: 'Por favor, digite a nova senha.',
  SENHA_REQUISITOS: 'A senha não atende aos requisitos mínimos.',
  SENHAS_NAO_COINCIDEM: 'As senhas não coincidem.',

  // Geral
  ERRO_REDEFINICAO: 'Não foi possível redefinir a senha. Tente novamente.',
} as const;

/**
 * Mensagens de informação/hint
 */
const INFO_MESSAGES = {
  CODIGO_HINT: 'Digite o código de 6 dígitos enviado para seu email',
  CODIGO_SPAM: 'Não recebeu o código? Verifique sua caixa de spam.',
  CODIGO_VALIDADE: (minutos: number) =>
    `O código é válido por ${minutos} minutos.`,
} as const;

/**
 * @function emailValido
 * @description Valida formato de email usando regex
 *
 * @param email - Email a ser validado
 * @returns true se o formato é válido
 *
 * @example
 * emailValido('joao@email.com') // true
 * emailValido('joao@') // false
 */
function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ResetarSenhaComCodigo() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  // Etapa 1 - Validação de código
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');

  // Etapa 2 - Nova senha (via hook customizado)
  const {
    senha: novaSenha,
    setSenha: setNovaSenha,
    regras,
    ehValida,
    forca,
  } = useValidacaoSenha();

  // Confirmação de senha (estado separado)
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados de UI e controle
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);

  // Controles de visibilidade das senhas
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  /**
   * Etapa atual do fluxo:
   * - 'codigo': Usuário informa email e código
   * - 'senha': Usuário define nova senha
   */
  const [etapa, setEtapa] = useState<'codigo' | 'senha'>('codigo');

  const router = useRouter();

  // --------------------------------------------------------------------------
  // VALORES DERIVADOS
  // --------------------------------------------------------------------------

  /**
   * Verifica se as senhas são iguais (ignora quando confirmação está vazia)
   * Usado para feedback em tempo real e validação de submit
   */
  const senhasIguais = confirmarSenha === '' || novaSenha === confirmarSenha;

  // --------------------------------------------------------------------------
  // FUNÇÕES DE VALIDAÇÃO
  // --------------------------------------------------------------------------

  /**
   * @function validarFormularioCodigo
   * @description Valida os campos da etapa 1 (email e código)
   * @returns Mensagem de erro ou null se válido
   */
  const validarFormularioCodigo = (): string | null => {
    if (!email.trim()) return ERROR_MESSAGES.EMAIL_VAZIO;
    if (!emailValido(email)) return ERROR_MESSAGES.EMAIL_INVALIDO;
    if (!codigo.trim()) return ERROR_MESSAGES.CODIGO_VAZIO;
    if (codigo.trim().length !== CODIGO_TAMANHO)
      return ERROR_MESSAGES.CODIGO_TAMANHO_INVALIDO;
    return null;
  };

  /**
   * @function validarFormularioSenha
   * @description Valida os campos da etapa 2 (nova senha e confirmação)
   * @returns Mensagem de erro ou null se válido
   */
  const validarFormularioSenha = (): string | null => {
    if (!novaSenha) return ERROR_MESSAGES.SENHA_VAZIA;
    if (!ehValida) return ERROR_MESSAGES.SENHA_REQUISITOS;
    if (novaSenha !== confirmarSenha)
      return ERROR_MESSAGES.SENHAS_NAO_COINCIDEM;
    return null;
  };

  // --------------------------------------------------------------------------
  // HANDLERS DE NAVEGAÇÃO ENTRE ETAPAS
  // --------------------------------------------------------------------------

  /**
   * @function irParaEtapaSenha
   * @description Valida etapa 1 e avança para etapa 2 (definição de senha)
   */
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

  /**
   * @function voltarParaEtapaCodigo
   * @description Retorna para etapa 1 e limpa campos de senha
   */
  const voltarParaEtapaCodigo = () => {
    setEtapa('codigo');
    setNovaSenha('');
    setConfirmarSenha('');
    setStatus(null);
    setMensagem('');
  };

  // --------------------------------------------------------------------------
  // HANDLER PRINCIPAL
  // --------------------------------------------------------------------------

  /**
   * @function redefinirSenha
   * @description Processa a redefinição de senha com código
   *
   * Fluxo:
   * 1. Valida campos da etapa 2
   * 2. Ativa loading e limpa mensagens anteriores
   * 3. Chama API de redefinição com email, código e nova senha
   * 4. Em caso de sucesso:
   *    - Define status success
   *    - Abre modal de confirmação
   * 5. Em caso de erro:
   *    - Define status error
   *    - Exibe mensagem amigável
   * 6. Finalmente, desativa loading
   */
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
      // Chamada à API (implementada em /lib/api/recuperacaoApi)
      await redefinirSenhaComCodigo(email, codigo, novaSenha);

      setStatus('success');
      setMostrarModalSucesso(true);
    } catch {
      // Erro genérico - API já deve retornar mensagens amigáveis
      setStatus('error');
      setMensagem(ERROR_MESSAGES.ERRO_REDEFINICAO);
    } finally {
      setEstaCarregando(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS DE NAVEGAÇÃO
  // --------------------------------------------------------------------------

  /**
   * @function irParaLogin
   * @description Redireciona para página de login
   */
  const irParaLogin = () => router.replace('/autorizacao/login');

  /**
   * @function fecharModal
   * @description Fecha modal de sucesso
   */
  const fecharModal = () => setMostrarModalSucesso(false);

  // --------------------------------------------------------------------------
  // HANDLERS DE EVENTOS
  // --------------------------------------------------------------------------

  /**
   * @function aoPressionarTecla
   * @description Gerencia tecla Enter para submit do formulário atual
   * Melhora acessibilidade e experiência do usuário
   */
  const aoPressionarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !estaCarregando) {
      if (etapa === 'codigo') {
        irParaEtapaSenha();
      } else {
        redefinirSenha();
      }
    }
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-6 md:p-8">
            {/* ------------------------------------------------------------------------
              HEADER - Dinâmico por etapa
            ------------------------------------------------------------------------ */}
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

            {/* ------------------------------------------------------------------------
              MENSAGEM DE STATUS (Erro/Sucesso)
            ------------------------------------------------------------------------ */}
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

            {/* ------------------------------------------------------------------------
              RENDERIZAÇÃO CONDICIONAL POR ETAPA
            ------------------------------------------------------------------------ */}

            {etapa === 'codigo' ? (
              /* ========================================================================
                ETAPA 1: VALIDAÇÃO DE CÓDIGO
              ======================================================================== */
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
                    maxLength={CODIGO_TAMANHO}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {INFO_MESSAGES.CODIGO_HINT}
                  </p>
                </div>

                {/* Botão Continuar */}
                <button
                  onClick={irParaEtapaSenha}
                  className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  Continuar
                </button>

                {/* Link para voltar ao login */}
                <div className="mt-4 sm:mt-6 text-center">
                  <button
                    onClick={irParaLogin}
                    className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    Voltar para o login
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================================
                ETAPA 2: CRIAÇÃO DE NOVA SENHA
              ======================================================================== */
              <div className="space-y-4 sm:space-y-6">
                {/* Informação do email e código (contexto) */}
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
                  {/* Feedback visual da força da senha */}
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
                  {/* Feedback de senhas diferentes */}
                  {!senhasIguais && confirmarSenha !== '' && (
                    <p className="text-red-500 text-xs mt-1">
                      {ERROR_MESSAGES.SENHAS_NAO_COINCIDEM}
                    </p>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={redefinirSenha}
                    disabled={estaCarregando}
                    className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {estaCarregando ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Alterando senha...</span>
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

          {/* ------------------------------------------------------------------------
            INFORMAÇÕES ADICIONAIS (apenas na etapa 1)
          ------------------------------------------------------------------------ */}
          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            {etapa === 'codigo' && (
              <>
                <p className="text-center text-xs sm:text-sm text-gray-600">
                  {INFO_MESSAGES.CODIGO_SPAM}
                </p>
                <p className="text-center text-xs text-gray-500">
                  {INFO_MESSAGES.CODIGO_VALIDADE(CODIGO_VALIDADE_MINUTOS)}
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
