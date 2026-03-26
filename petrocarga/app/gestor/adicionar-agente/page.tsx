'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Form from 'next/form';
import { useActionState, useState } from 'react';
import {
  CircleAlert,
  UserIcon,
  CheckCircle,
  Shield,
  ChevronLeft,
  Phone,
  Fingerprint,
  Mail,
  FileText,
  Tag,
} from 'lucide-react';
import FormItem from '@/components/form/form-item';
import { addAgente } from '@/lib/api/agenteApi';
import Link from 'next/link';

/**
 * @component CadastroAgentes
 * @version 1.0.0
 *
 * @description Página de cadastro de novos agentes para gestores.
 * Permite criar novos agentes com validação em tempo real de email, CPF e telefone.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ACESSO:
 *    - Acesso restrito a gestores (rota protegida)
 *    - Link de retorno para lista de agentes
 *
 * 2. PREENCHIMENTO DO FORMULÁRIO:
 *    - Nome completo (obrigatório)
 *    - Email (com validação de formato)
 *    - Confirmar email (validação de igualdade)
 *    - CPF (apenas números, 11 dígitos)
 *    - Telefone (apenas números, com DDD)
 *    - Matrícula (identificação única)
 *
 * 3. VALIDAÇÕES EM TEMPO REAL:
 *    a) EMAIL:
 *       - Formato válido (regex)
 *       - Feedback visual com ícone e borda vermelha
 *       - Mensagem de erro específica
 *
 *    b) CONFIRMAR EMAIL:
 *       - Verifica se é igual ao email digitado
 *       - Ícone de check verde quando igual
 *       - Mensagem de erro quando diferente
 *
 *    c) CPF:
 *       - Remove caracteres não numéricos
 *       - Limite de 11 dígitos
 *       - Formatação automática (apenas números)
 *
 *    d) TELEFONE:
 *       - Remove caracteres não numéricos
 *       - Limite de 11 dígitos (incluindo DDD)
 *       - Máscara automática
 *
 * 4. ENVIO:
 *    - Server Action addAgente via useActionState
 *    - Botão desabilitado se validações falharem
 *    - Loading state durante envio
 *    - Feedback de sucesso/erro pós-envio
 *
 * 5. PÓS-CADASTRO:
 *    - Agente recebe email com instruções de acesso
 *    - Mensagem de sucesso com detalhes
 *    - Botão para voltar à lista
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - useState (validações em tempo real)
 *   - useActionState (Server Actions)
 *   - Interatividade (máscaras, feedback visual)
 *
 * - VALIDAÇÕES EM TEMPO REAL:
 *   - emailValido: Regex para formato de email
 *   - emailsIguais: Comparação entre email e confirmarEmail
 *   - Ambos calculados (não estados) para performance
 *
 * - MÁSCARAS AUTOMÁTICAS:
 *   - CPF: remove não números e limita 11 dígitos
 *   - Telefone: mesma lógica para consistência
 *   - Aplicadas no onChange, mantendo estado limpo
 *
 * - FEEDBACK VISUAL MULTI-ESTADO:
 *   - Mensagens de erro da API (state.error)
 *   - Mensagens de sucesso (state.message)
 *   - Validações locais (email inválido, emails diferentes)
 *   - Cada um com ícone e cor apropriados
 *
 * - LAYOUT RICO:
 *   - Gradientes e sombras para hierarquia visual
 *   - Cards informativos sobre o perfil do agente
 *   - Ícones contextuais em cada campo
 *   - Design responsivo (múltiplos breakpoints)
 *
 * - SEGURANÇA:
 *   - Previne submit se validações falharem
 *   - Server Action valida no backend também
 *   - AutoComplete configurado apropriadamente
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - addAgente: Server Action de cadastro
 * - FormItem: Componente de campo com label e tooltip
 * - /gestor/agentes: Página de listagem (retorno)
 *
 * ----------------------------------------------------------------------------
 * ⚙️ VALIDAÇÕES IMPLEMENTADAS:
 * ----------------------------------------------------------------------------
 *
 * - Nome: não vazio (HTML required)
 * - Email: formato válido (regex) e não vazio
 * - Confirmar Email: igual ao email principal
 * - CPF: 11 dígitos numéricos (via required + máscara)
 * - Telefone: 11 dígitos numéricos (via required + máscara)
 * - Matrícula: não vazia (HTML required)
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - HEADER:
 *   - Botão "Voltar" com animação hover
 *   - Indicador visual de etapa (círculo azul)
 *   - Título grande com gradiente
 *   - Descrição do propósito
 *
 * - CARD PRINCIPAL:
 *   - Ícone grande com badge de segurança
 *   - Título e subtítulo
 *   - Campos com ícones contextuais
 *   - Indicador de campo obrigatório (*)
 *
 * - FEEDBACK VISUAL:
 *   - Borda vermelha em campos inválidos
 *   - Ícone verde quando emails coincidem
 *   - Alertas coloridos para erros
 *   - Loading spinner durante envio
 *
 * - CARDS INFORMATIVOS (rodapé):
 *   1. Perfil do Agente (azul)
 *   2. Matrícula (cinza)
 *   3. Acesso Imediato (verde)
 *
 * - RESPONSIVIDADE:
 *   - Mobile: empilhamento, padding menor
 *   - Tablet: ajustes de grid
 *   - Desktop: layout completo
 *
 * @example
 * // Uso em rota de gestor
 * <CadastroAgentes />
 *
 * @see /src/lib/api/agenteApi.ts - Server Action addAgente
 * @see /src/components/form/form-item.tsx - Componente de campo
 */

export default function CadastroAgentes() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  /**
   * useActionState gerencia:
   * - state: Resultado da Server Action (erro/sucesso)
   * - action: Função de submit (addAgente)
   * - pending: Estado de carregamento
   */
  const [state, action, pending] = useActionState(addAgente, null);

  // Estados para validação em tempo real
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [matricula, setMatricula] = useState('');

  // --------------------------------------------------------------------------
  // VALORES DERIVADOS (VALIDAÇÕES)
  // --------------------------------------------------------------------------

  /**
   * emailValido: Verifica formato do email usando regex
   * - Ignora campo vazio (validação só após digitar)
   */
  const emailValido = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /**
   * emailsIguais: Compara email e confirmação
   * - Considera válido se confirmação vazia (evita erro prematuro)
   */
  const emailsIguais = confirmarEmail === '' || email === confirmarEmail;

  // --------------------------------------------------------------------------
  // HANDLER DE SUBMIT
  // --------------------------------------------------------------------------

  /**
   * @function handleSubmit
   * @description Processa o envio do formulário
   *
   * Validações antes do envio:
   * 1. Emails devem ser iguais
   * 2. Email deve ter formato válido
   *
   * @param formData - Dados do formulário
   * @returns Resultado da Server Action
   */
  const handleSubmit = async (formData: FormData) => {
    // Validações locais antes do envio
    if (!emailsIguais || !emailValido) return;

    // Chama Server Action
    return await action(formData);
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* --------------------------------------------------------------------
            HEADER DA PÁGINA
            Inclui:
            - Botão voltar para lista
            - Indicador de página
            - Título e descrição
          -------------------------------------------------------------------- */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            {/* Barra de navegação superior */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {/* Botão voltar */}
                <Link
                  href="/gestor/agentes"
                  className="group flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all hover:shadow-sm hover:border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500 group-hover:text-gray-700 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Voltar
                  </span>
                </Link>

                {/* Divisor (desktop) */}
                <div className="hidden sm:block h-6 w-px bg-gray-300"></div>

                {/* Indicador de página (desktop) */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Cadastro de Agente
                  </span>
                </div>
              </div>

              {/* Indicador mobile */}
              <div className="sm:hidden flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700">
                    Novo Agente
                  </span>
                </div>
              </div>
            </div>

            {/* Título e descrição */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Cadastrar Novo Agente
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl">
                Preencha os dados abaixo para adicionar um novo agente ao
                sistema. Todos os campos são obrigatórios.
              </p>
            </div>
          </div>

          {/* --------------------------------------------------------------------
            CARD PRINCIPAL DO FORMULÁRIO
          -------------------------------------------------------------------- */}
          <Card className="w-full overflow-hidden border-gray-200 shadow-lg">
            {/* Header do Card */}
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Ícone principal com badge de segurança */}
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full border-4 border-gray-50 flex items-center justify-center shadow-md">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Título e descrição */}
                <div className="flex-1 text-center sm:text-left">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Dados do Agente
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                    Informações pessoais e profissionais do novo agente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Formulário (Server Action) */}
            <Form action={handleSubmit}>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* --------------------------------------------------------------------
                  MENSAGENS DE FEEDBACK (3 TIPOS)
                -------------------------------------------------------------------- */}

                {/* Mensagem da API (erro/sucesso) */}
                {(state?.error || state?.message) && (
                  <div
                    className={`flex items-start gap-3 rounded-xl border p-4 mb-6 ${
                      state.error
                        ? 'border-red-200 bg-red-50 text-red-900'
                        : 'border-green-200 bg-green-50 text-green-900'
                    }`}
                  >
                    {state.error ? (
                      <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {state.error ? 'Erro' : 'Sucesso'}
                      </span>
                      <p className="text-sm mt-0.5">{state.message}</p>
                    </div>
                  </div>
                )}

                {/* Validação: emails diferentes */}
                {!emailsIguais && confirmarEmail !== '' && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 text-red-900 p-4 mb-6">
                    <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Atenção</span>
                      <p className="text-sm mt-0.5">
                        Os emails não coincidem. Por favor, verifique.
                      </p>
                    </div>
                  </div>
                )}

                {/* Validação: email inválido */}
                {!emailValido && email !== '' && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 text-red-900 p-4 mb-6">
                    <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        Formato inválido
                      </span>
                      <p className="text-sm mt-0.5">
                        Digite um email válido no formato
                        &quot;exemplo@dominio.com&quot;.
                      </p>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------------
                  CAMPOS DO FORMULÁRIO
                -------------------------------------------------------------------- */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Campo: Nome Completo */}
                  <FormItem
                    name="Nome Completo"
                    description="Insira o nome completo do agente"
                  >
                    <div className="relative">
                      <Input
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-3 px-4"
                        id="nome"
                        name="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Exemplo: Eduardo Silva Dantas"
                        required
                        autoComplete="name"
                      />
                      {/* Indicador de campo obrigatório */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-500">*</span>
                        </div>
                      </div>
                    </div>
                  </FormItem>

                  {/* Grupo: Email e Confirmar Email */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Campo: Email */}
                    <FormItem
                      name="Email"
                      description="Email institucional do agente"
                    >
                      <div className="relative">
                        <Input
                          className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-3 px-4 ${
                            !emailValido && email !== ''
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : ''
                          }`}
                          type="email"
                          id="email"
                          name="email"
                          placeholder="agente@organizacao.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                        />
                        {/* Ícone decorativo */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <Mail className="w-3 h-3 text-gray-500" />
                          </div>
                        </div>
                      </div>
                    </FormItem>

                    {/* Campo: Confirmar Email */}
                    <FormItem
                      name="Confirmar Email"
                      description="Digite novamente para confirmar"
                    >
                      <div className="relative">
                        <Input
                          className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-3 px-4 ${
                            !emailsIguais && confirmarEmail !== ''
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : ''
                          }`}
                          type="email"
                          id="confirmarEmail"
                          name="confirmarEmail"
                          placeholder="agente@organizacao.com"
                          required
                          value={confirmarEmail}
                          onChange={(e) => setConfirmarEmail(e.target.value)}
                          autoComplete="email"
                        />
                        {/* Ícone de validação (verde quando igual) */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <CheckCircle
                              className={`w-3 h-3 ${
                                emailsIguais && confirmarEmail !== ''
                                  ? 'text-green-500'
                                  : 'text-gray-500'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  </div>

                  {/* Campo: CPF */}
                  <FormItem
                    name="CPF"
                    description="Apenas números, sem pontuação"
                  >
                    <div className="relative">
                      <Input
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-3 px-4"
                        id="cpf"
                        name="cpf"
                        placeholder="00000000000"
                        maxLength={11}
                        inputMode="numeric"
                        required
                        value={cpf}
                        onChange={(e) =>
                          setCpf(e.target.value.replace(/\D/g, ''))
                        }
                        autoComplete="off"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <Fingerprint className="w-3 h-3 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </FormItem>

                  {/* Campo: Telefone */}
                  <FormItem
                    name="Telefone"
                    description="Com DDD, apenas números"
                  >
                    <div className="relative">
                      <Input
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-3 px-4"
                        id="telefone"
                        name="telefone"
                        placeholder="21999998888"
                        maxLength={11}
                        inputMode="tel"
                        required
                        value={telefone}
                        onChange={(e) =>
                          setTelefone(e.target.value.replace(/\D/g, ''))
                        }
                        autoComplete="tel"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <Phone className="w-3 h-3 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </FormItem>

                  {/* Campo: Matrícula */}
                  <FormItem
                    name="Matrícula"
                    description="Número de matrícula do agente"
                  >
                    <div className="relative">
                      <Input
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-3 px-4"
                        id="matricula"
                        name="matricula"
                        placeholder="Ex: MSD20231"
                        required
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        autoComplete="off"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <Tag className="w-3 h-3 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </FormItem>
                </div>
              </CardContent>

              {/* Footer do Card com botão de submit */}
              <CardFooter className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Mensagem informativa */}
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Ao cadastrar, o agente receberá um email com instruções de
                      acesso
                    </p>
                  </div>

                  {/* Botão de submit */}
                  <div className="w-full sm:w-auto">
                    <Button
                      type="submit"
                      disabled={pending || !emailsIguais || !emailValido}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all hover:shadow-lg font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {pending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Cadastrando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Cadastrar Agente
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Form>
          </Card>

          {/* --------------------------------------------------------------------
            CARDS INFORMATIVOS (RODAPÉ)
          -------------------------------------------------------------------- */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Perfil do Agente */}
            <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">
                    Perfil do Agente
                  </h4>
                  <p className="text-blue-700 text-xs mt-1">
                    Agentes podem criar e gerenciar reservas rápidas
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Matrícula */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    Matrícula
                  </h4>
                  <p className="text-gray-700 text-xs mt-1">
                    Identificação única do agente na organização
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Acesso Imediato */}
            <div className="bg-green-50 rounded-lg border border-green-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900 text-sm">
                    Acesso Imediato
                  </h4>
                  <p className="text-green-700 text-xs mt-1">
                    O agente poderá acessar o sistema assim que for cadastrado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
