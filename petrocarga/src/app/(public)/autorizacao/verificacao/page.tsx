'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
} from 'lucide-react';
import { solicitarRecuperacaoSenha } from '@/services/api/recuperacaoApi';
import { validateEmail } from '@/lib/utils';
import ModalConfirmacaoEnvio from '@/components/modal/autorizacao/verificacao/ModalConfirmacaoEnvio';
import ModalSucessoEnvio from '@/components/modal/autorizacao/verificacao/ModalSucessoEnvio';
import { useRouter } from 'next/navigation';

/**
 * @component RecuperacaoSenha
 * @version 1.0.0
 *
 * @description Página de recuperação de senha com suporte a identificação
 * por email ou CPF e feedback em tempo real.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. USUÁRIO DIGITA IDENTIFICADOR:
 *    - Sistema identifica automaticamente se é email ou CPF
 *    - Feedback visual em tempo real sobre formato
 *
 * 2. VALIDAÇÃO DO INPUT:
 *    - Email: valida formato via regex
 *    - CPF: verifica 11 dígitos numéricos
 *    - Se inválido: exibe mensagem de erro
 *
 * 3. ENVIO DA SOLICITAÇÃO:
 *    - Chama API de recuperação
 *    - Exibe loading state
 *    - Em caso de sucesso: mostra mensagem amigável e abre modal
 *    - Em caso de erro: exibe mensagem específica
 *
 * 4. PÓS-ENVIO:
 *    - Exibe modal de sucesso
 *    - Oferece opções: voltar ao login ou tentar outro identificador
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - IDENTIFICAÇÃO AUTOMÁTICA: Função identificarTipoIdentificador analisa
 *   o input para determinar se é email (regex) ou CPF (11 dígitos),
 *   permitindo validação contextual e ícone dinâmico.
 *
 * - FEEDBACK EM TEMPO REAL: formatHint calcula mensagens e cores
 *   baseado no tipo identificado, melhorando UX com validação instantânea.
 *
 * - MENSAGEM DE SUCESSO GENÉRICA: "Se este email/CPF estiver cadastrado..."
 *   é uma medida de segurança para não revelar quais emails existem.
 *
 * - DOIS MODAIS DISTINTOS:
 *   - ModalConfirmacaoEnvio: Exibe confirmação do envio
 *   - ModalSucessoEnvio: Exibido APÓS envio com opções
 *
 * - VALIDAÇÃO REUTILIZÁVEL: Usa função validateEmail do utils para
 *   consistência com outras partes do sistema
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ModalConfirmacaoEnvio: Modal de confirmação de envio do código
 * - ModalSucessoEnvio: Modal com opções pós-envio
 * - /autorizacao/login: Página de destino (voltar)
 * - /lib/api/recuperacaoApi: API de recuperação de senha
 * - /lib/utils: Funções utilitárias (validateEmail)
 *
 * ----------------------------------------------------------------------------
 * ⚙️ VALIDAÇÕES IMPLEMENTADAS:
 * ----------------------------------------------------------------------------
 *
 * - Email não vazio
 * - Formato de email válido (regex)
 * - CPF com exatamente 11 dígitos numéricos
 * - Input não pode ser indeterminado (não é email nem CPF)
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - Ícone dinâmico (Mail para email, User para CPF)
 * - Feedback visual colorido (verde/vermelho/amarelo)
 * - Contador de dígitos para CPF (ex: 9/11 dígitos)
 * - Loading state com spinner
 * - Mensagens de erro específicas por tipo de validação
 * - Design responsivo (mobile/desktop)
 * - Acessibilidade (labels, enter key, focus)
 *
 * @example
 * // Uso em rota pública
 * <RecuperacaoSenha />
 *
 * @see /lib/api/recuperacaoApi.ts - Integração com backend
 * @see /components/modal/autorizacao/verificacao/ - Modais relacionados
 */

// ----------------------------------------------------------------------------
// CONSTANTES E CONFIGURAÇÕES
// ----------------------------------------------------------------------------

/**
 * Duração de validade do código em minutos (para informação do usuário)
 */
const CODIGO_VALIDADE_MINUTOS = 15;

/**
 * Tamanho esperado do CPF
 */
const CPF_TAMANHO = 11;
const CNPJ_TAMANHO = 14;

/**
 * Mensagens de erro padronizadas
 */
const ERROR_MESSAGES = {
  IDENTIFICADOR_VAZIO: 'Por favor, digite seu email ou CPF.',
  EMAIL_INVALIDO: 'Por favor, digite um email válido.',
  CPF_TAMANHO_INVALIDO: `CPF deve conter ${CPF_TAMANHO} dígitos.`,
  FORMATO_INVALIDO: 'Formato inválido. Use email ou CPF (apenas números).',
  GENERICO: 'Erro ao solicitar recuperação. Tente novamente.',
} as const;

/**
 * Mensagens de sucesso/informação
 */
const SUCCESS_MESSAGES = {
  RECUPERACAO_SOLICITADA:
    'Se este email/CPF estiver cadastrado, você receberá um código em instantes.',
  CODIGO_VALIDADE: (minutos: number) =>
    `O código tem validade de ${minutos} minutos. Não compartilhe com ninguém.`,
} as const;

/**
 * Mensagens de feedback para validação em tempo real
 */
const INPUT_FEEDBACK = {
  EMAIL_VALID: '✓ Formato de email válido',
  CPF_VALID: (tamanho: number) => `✓ CPF válido (${tamanho} dígitos)`,
  CPF_INCOMPLETE: (current: number, total: number) =>
    `⚠ CPF: ${current}/${total} dígitos`,
  INVALID: '✗ Formato inválido. Use email ou CPF (apenas números)',
  HINT: 'Digite seu email ou CPF (11 dígitos)',
} as const;

/**
 * @function identificarTipoIdentificador
 * @description Analisa o input do usuário para determinar se é email, CPF ou indeterminado
 *
 * @param input - String digitada pelo usuário
 * @returns Tipo identificado: 'email' | 'cpf' | 'indeterminado'
 *
 * @example
 * identificarTipoIdentificador('joao@email.com') // 'email'
 * identificarTipoIdentificador('12345678901') // 'cpf'
 * identificarTipoIdentificador('abc') // 'indeterminado'
 */
function identificarTipoIdentificador(
  input: string,
): 'email' | 'cpf' | 'cnpj' | 'indeterminado' {
  if (!input.trim()) return 'indeterminado';

  const apenasNumeros = input.replace(/\D/g, '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(input)) {
    return 'email';
  }

  if (/^\d+$/.test(apenasNumeros)) {
    if (apenasNumeros.length <= CPF_TAMANHO) {
      return 'cpf'; // CPF incompleto ou completo
    }

    if (apenasNumeros.length <= CNPJ_TAMANHO) {
      return 'cnpj'; // CNPJ incompleto ou completo
    }
  }

  return 'indeterminado';
}

/**
 * @function emailValido
 * @description Valida formato de email (wrapper para validateEmail do utils)
 *
 * @param email - Email a ser validado
 * @returns true se o formato é válido
 */
function emailValido(email: string): boolean {
  return validateEmail(email);
}

/**
 * @function cpfValido
 * @description Verifica se string tem exatamente 11 dígitos numéricos
 *
 * @param cpf - CPF a ser validado
 * @returns true se tem 11 dígitos
 */
function cpfValido(cpf: string): boolean {
  return cpf.replace(/\D/g, '').length === CPF_TAMANHO;
}

export default function RecuperacaoSenha() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const [identificador, setIdentificador] = useState(''); // Email ou CPF digitado
  const [estaCarregando, setEstaCarregando] = useState(false); // Estado de loading
  const [status, setStatus] = useState<'success' | 'error' | null>(null); // Status da operação
  const [mensagem, setMensagem] = useState(''); // Mensagem de feedback
  const [mostrarModal, setMostrarModal] = useState(false); // Controle do modal de confirmação
  const [codigoEnviado, setCodigoEnviado] = useState(false); // Se código já foi enviado

  const router = useRouter();

  // --------------------------------------------------------------------------
  // VALORES DERIVADOS
  // --------------------------------------------------------------------------

  /**
   * Tipo do input atual (email, cpf ou indeterminado)
   * Usado para validação, ícone e feedback visual
   */
  const tipoInput = identificarTipoIdentificador(identificador);

  // --------------------------------------------------------------------------
  // FUNÇÕES DE VALIDAÇÃO
  // --------------------------------------------------------------------------

  /**
   * @function validarFormulario
   * @description Valida o input antes do envio
   * @returns Mensagem de erro ou null se válido
   */
  const validarFormulario = (): string | null => {
    if (!identificador.trim()) {
      return ERROR_MESSAGES.IDENTIFICADOR_VAZIO;
    }

    if (tipoInput === 'email' && !emailValido(identificador)) {
      return ERROR_MESSAGES.EMAIL_INVALIDO;
    }

    if (tipoInput === 'cpf' && !cpfValido(identificador)) {
      return ERROR_MESSAGES.CPF_TAMANHO_INVALIDO;
    }

    if (tipoInput === 'indeterminado') {
      return ERROR_MESSAGES.FORMATO_INVALIDO;
    }

    return null;
  };

  // --------------------------------------------------------------------------
  // HANDLER PRINCIPAL
  // --------------------------------------------------------------------------

  /**
   * @function enviarCodigoRecuperacao
   * @description Processa a solicitação de recuperação de senha
   *
   * Fluxo:
   * 1. Valida o input do usuário
   * 2. Se inválido: exibe mensagem de erro
   * 3. Se válido: ativa loading e chama API
   * 4. Em caso de sucesso:
   *    - Define status success
   *    - Exibe mensagem genérica (segurança)
   *    - Abre modal de confirmação
   *    - Marca código como enviado
   * 5. Em caso de erro:
   *    - Define status error
   *    - Exibe mensagem específica do erro ou genérica
   * 6. Finalmente, desativa loading
   *
   * @security Mensagem de sucesso genérica não confirma existência do email
   */
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
      setMensagem(SUCCESS_MESSAGES.RECUPERACAO_SOLICITADA);
      setMostrarModal(true);
      setCodigoEnviado(true);
    } catch (erro: unknown) {
      setStatus('error');
      setMensagem(
        erro instanceof Error ? erro.message : ERROR_MESSAGES.GENERICO,
      );
    } finally {
      setEstaCarregando(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS DE EVENTOS E NAVEGAÇÃO
  // --------------------------------------------------------------------------

  /**
   * @function aoPressionarTecla
   * @description Gerencia tecla Enter para submit do formulário
   * Melhora acessibilidade e experiência do usuário
   */
  const aoPressionarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !estaCarregando) {
      enviarCodigoRecuperacao();
    }
  };

  /**
   * @function irParaLogin
   * @description Redireciona para página de login
   */
  const irParaLogin = () => router.replace('/autorizacao/login');

  /**
   * @function tentarOutroIdentificador
   * @description Limpa o formulário para tentar outro email/CPF
   */
  const tentarOutroIdentificador = () => {
    setIdentificador('');
    setCodigoEnviado(false);
    setStatus(null);
    setMensagem('');
    setMostrarModal(false);
  };

  /**
   * @function fecharModal
   * @description Fecha modal de confirmação e redireciona para login
   */
  const fecharModal = () => {
    setMostrarModal(false);
    setStatus(null);
    setMensagem('');
    irParaCodigo()
  };

  const irParaCodigo = () => {
    router.push('/autorizacao/nova-senha');
  };

  // --------------------------------------------------------------------------
  // UI DINÂMICA (valores calculados para renderização)
  // --------------------------------------------------------------------------

  /**
   * Ícone dinâmico baseado no tipo de input
   */
  const inputIcon =
    tipoInput === 'cpf' ? (
      <User className="w-5 h-5 text-blue-600" />
    ) : (
      <Mail className="w-5 h-5 text-blue-600" />
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
      const apenasNumeros = identificador.replace(/\D/g, '');
      if (apenasNumeros.length === CPF_TAMANHO) {
        return (
          <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
            {INPUT_FEEDBACK.CPF_VALID(CPF_TAMANHO)}
          </span>
        );
      } else {
        return (
          <span className="text-xs text-amber-600 mt-1">
            {INPUT_FEEDBACK.CPF_INCOMPLETE(apenasNumeros.length, CPF_TAMANHO)}
          </span>
        );
      }
    } else if (identificador && tipoInput === 'indeterminado') {
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
    <>
      <div
        className="
        relative
        flex
        items-center
        justify-center
        min-h-[calc(100dvh-64px)]
        overflow-hidden
        bg-blue-800
        px-6
      "
      >
        {/* Blobs de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-32 -left-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        {/* Domo */}
        <div
          className="
          absolute
          left-1/2
          bottom-0
          -translate-x-1/2
          w-[150%]
          h-[55%]
          bg-blue-900
          pointer-events-none
          z-0
        "
          style={{
            borderTopLeftRadius: '50%',
            borderTopRightRadius: '50%',
            boxShadow: '0 -20px 60px rgba(30,58,138,.35)',
          }}
        />

        {/* Card principal */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="relative z-10 w-full max-w-md"
        >
          <div
            className="
            bg-white
            rounded-xl
            sm:rounded-4xl
            shadow-lg
            sm:shadow-xl
            p-5
            sm:p-6
            md:p-8
          "
          >
            {/* HEADER */}
            <div className="text-center mb-6 sm:mb-8">
              <div
                className="
                inline-flex
                items-center
                justify-center
                w-12
                h-12
                sm:w-14
                sm:h-14
                md:w-16
                md:h-16
                bg-blue-900
                rounded-full
                mb-3
                sm:mb-4
              "
              >
                <Mail className="text-white" />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-black mb-1 sm:mb-2">
                Recuperar Senha
              </h1>

              <p className="text-xs sm:text-sm text-gray-700">
                Digite seu email, CPF ou CNPJ para receber o código de
                recuperação.
              </p>
            </div>

            {/* STATUS */}
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

            {/* FORMULÁRIO / SUCESSO */}
            {!codigoEnviado ? (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Campo identificação */}
                <div>
                  <label
                    htmlFor="identificador"
                    className="
                    block
                    text-xs
                    sm:text-sm
                    font-medium
                    text-black
                    mb-1
                    sm:mb-2
                  "
                  >
                    Email, CPF ou CNPJ da conta
                  </label>

                  <div className="relative">
                    <div
                      className="
                      absolute
                      left-3
                      top-1/2
                      transform
                      -translate-y-1/2
                    "
                    >
                      {inputIcon}
                    </div>

                    <input
                      type="text"
                      id="identificador"
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      onKeyDown={aoPressionarTecla}
                      placeholder="Digite seu email, CPF ou CNPJ"
                      className="
                      w-full
                      pl-10
                      pr-3
                      sm:pl-10
                      sm:pr-4
                      py-2.5
                      sm:py-3
                      text-sm
                      sm:text-base
                      border
                      border-gray-300
                      rounded-lg
                      focus:ring-2
                      focus:ring-blue-500
                      focus:border-transparent
                      outline-none
                      transition
                      disabled:opacity-50
                    "
                      disabled={estaCarregando}
                      autoFocus
                    />
                  </div>

                  {formatHint}
                </div>

                {/* Botão */}
                <button
                  onClick={enviarCodigoRecuperacao}
                  disabled={estaCarregando || tipoInput === 'indeterminado'}
                  className="
    w-full
    bg-blue-600
    text-white
    py-2.5
    sm:py-3
    rounded-lg
    text-sm
    sm:text-base
    font-medium
    hover:bg-blue-700
    transition
    disabled:opacity-50
    disabled:cursor-not-allowed
    flex
    items-center
    justify-center
    gap-2
  "
                >
                  {estaCarregando ? (
                    <>
                      <div
                        className="
          w-4
          h-4
          sm:w-5
          sm:h-5
          border-2
          border-white
          border-t-transparent
          rounded-full
          animate-spin
        "
                      />

                      <span>Enviando...</span>
                    </>
                  ) : (
                    'Enviar código de recuperação'
                  )}
                </button>

                <div className="mt-4 sm:mt-8 flex items-center justify-between gap-4">
                  {/* Voltar */}
                  <button
                    type="button"
                    onClick={irParaLogin}
                    disabled={estaCarregando}
                    className="
      group
      inline-flex
      items-center
      gap-1.5
      rounded-lg
      px-2
      py-1.5
      text-xs
      font-medium
      text-slate-500
      transition-all
      duration-200
      hover:bg-slate-50
      hover:text-blue-600
      disabled:pointer-events-none
      disabled:opacity-50
      sm:text-sm
    "
                  >
                    <ArrowLeft
                      className="
        h-3.5 w-3.5
        transition-transform
        duration-200
        group-hover:-translate-x-0.5
        sm:h-4 sm:w-4
      "
                    />
                    Voltar para o login
                  </button>

                  {/* Já tenho código */}
                  <button
                    type="button"
                    onClick={irParaCodigo}
                    disabled={estaCarregando}
                    className="
      group
      inline-flex
      items-center
      gap-1.5
      rounded-lg
      px-2
      py-1.5
      text-xs
      font-medium
      text-blue-600
      transition-all
      duration-200
      hover:bg-blue-50
      hover:text-blue-700
      disabled:pointer-events-none
      disabled:opacity-50
      sm:text-sm
    "
                  >
                    Já tenho um código
                    <ArrowRight
                      className="
        h-3.5 w-3.5
        transition-transform
        duration-200
        group-hover:translate-x-0.5
        sm:h-4 sm:w-4
      "
                    />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                <ModalSucessoEnvio
                  tipoInput={tipoInput}
                  onVoltarLogin={irParaLogin}
                  onTentarOutro={tentarOutroIdentificador}
                />
              </motion.div>
            )}
          </div>

          {/* Informação inferior */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 2,
            }}
            className="mt-4 sm:mt-6 space-y-2 sm:space-y-3"
          >
            <p className="text-center text-xs sm:text-sm text-white">
              {SUCCESS_MESSAGES.CODIGO_VALIDADE(CODIGO_VALIDADE_MINUTOS)}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal confirmação */}
      <ModalConfirmacaoEnvio
        isOpen={mostrarModal}
        onClose={fecharModal}
        mensagem={mensagem}
        status={status}
      />
    </>
  );
}