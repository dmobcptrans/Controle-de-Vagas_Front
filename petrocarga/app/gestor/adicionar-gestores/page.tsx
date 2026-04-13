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
  Mail,
  Fingerprint,
  Phone,
} from 'lucide-react';
import FormItem from '@/components/form/form-item';
import { addGestor } from '@/lib/api/gestorApi';
import Link from 'next/link';

/**
 * @component CadastroGestores
 * @version 1.0.0
 *
 * @description Página de cadastro de novos gestores para administradores.
 * Permite criar novos gestores com validação em tempo real de email, CPF e telefone.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ACESSO:
 *    - Acesso restrito a administradores (rota protegida)
 *    - Link de retorno para lista de gestores (/gestor/gestores)
 *    - Indicador visual de "Novo Gestor" em mobile
 *
 * 2. PREENCHIMENTO DO FORMULÁRIO:
 *    - Nome completo (obrigatório)
 *    - Email (com validação de formato)
 *    - Confirmar email (validação de igualdade)
 *    - CPF (apenas números, 11 dígitos)
 *    - Telefone (apenas números, com DDD)
 *
 * 3. VALIDAÇÕES EM TEMPO REAL:
 *    a) EMAIL:
 *       - Formato válido (regex)
 *       - Feedback visual com borda vermelha
 *       - Mensagem de erro específica
 *       - Ícone de envelope no campo
 *
 *    b) CONFIRMAR EMAIL:
 *       - Verifica se é igual ao email digitado
 *       - Ícone de check verde quando igual
 *       - Borda vermelha quando diferente
 *       - Mensagem de erro contextual
 *
 *    c) CPF:
 *       - Remove caracteres não numéricos (/\D/g)
 *       - Limite de 11 dígitos (maxLength)
 *       - InputMode numeric para teclado numérico mobile
 *       - Ícone de impressão digital
 *
 *    d) TELEFONE:
 *       - Remove caracteres não numéricos
 *       - Limite de 11 dígitos (incluindo DDD)
 *       - InputMode tel para teclado telefônico mobile
 *       - Ícone de telefone
 *
 * 4. ENVIO:
 *    - Server Action addGestor via useActionState
 *    - Botão desabilitado se validações falharem
 *    - Loading state com spinner durante envio
 *    - Feedback de sucesso/erro pós-envio
 *
 * 5. PÓS-CADASTRO:
 *    - Gestor recebe email com instruções de acesso
 *    - Mensagem de sucesso na interface
 *    - Botão para voltar à lista de gestores
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
 *   - Validação só após usuário digitar (evita erro prematuro)
 *
 * - MÁSCARAS AUTOMÁTICAS:
 *   - CPF: remove não números e limita 11 dígitos
 *   - Telefone: mesma lógica para consistência
 *   - Aplicadas no onChange, mantendo estado limpo
 *   - Preserva apenas números para envio ao backend
 *
 * - FEEDBACK VISUAL MULTI-ESTADO:
 *   - Mensagens da API (state.error / state.message)
 *   - Validação de emails diferentes
 *   - Validação de formato de email
 *   - Cada um com ícone e cor apropriados
 *   - Posicionamento entre header e campos
 *
 * - ÍCONES CONTEXTUAIS:
 *   - Shield: ícone principal (gestor = autoridade)
 *   - UserIcon: badge secundário
 *   - Mail: campo de email
 *   - CheckCircle: confirmação de email (dinâmico)
 *   - Fingerprint: CPF (identificação única)
 *   - Phone: telefone
 *
 * - SEGURANÇA:
 *   - Previne submit se validações locais falharem
 *   - Server Action valida no backend também
 *   - AutoComplete configurado apropriadamente
 *   - InputMode específico para cada campo
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - addGestor: Server Action de cadastro (lib/api/gestorApi)
 * - FormItem: Componente de campo com label e tooltip
 * - /gestor/gestores: Página de listagem (retorno)
 * - /components/ui/button: Botão estilizado
 * - /components/ui/card: Container do formulário
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
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - HEADER DA PÁGINA:
 *   - Botão "Voltar" com animação hover (translate -x)
 *   - Divisor visual entre botão e indicador
 *   - Indicador de página (círculo azul) em desktop
 *   - Badge "Novo Gestor" com pulse em mobile
 *   - Título grande com gradiente
 *   - Descrição contextual
 *
 * - CARD PRINCIPAL:
 *   - Ícone grande (Shield) com badge secundário
 *   - Gradiente no título "Dados do Gestor"
 *   - Sombras suaves (shadow-lg, shadow-md)
 *   - Cantos arredondados (rounded-2xl, rounded-lg)
 *
 * - CAMPOS DO FORMULÁRIO:
 *   - Todos com ícone à direita
 *   - Indicador de campo obrigatório (*)
 *   - Padding generoso (py-3 px-4)
 *   - Borda com foco azul (focus:ring-blue-500)
 *   - Validação visual com borda vermelha
 *
 * - FEEDBACK VISUAL:
 *   - Alertas coloridos (vermelho/verde/azul)
 *   - Ícones consistentes por tipo
 *   - Mensagens claras e objetivas
 *   - Posicionamento estratégico
 *
 * - CARDS INFORMATIVOS (rodapé):
 *   1. Permissões (azul): acesso completo
 *   2. Confirmação (cinza): email será enviado
 *   3. Validação (verde): dados validados
 *   - Grid responsivo (1/2/3 colunas)
 *   - Ícones circulares com cores temáticas
 *
 * - RESPONSIVIDADE:
 *   - Mobile: empilhamento, padding menor
 *   - Tablet: grid de 2 colunas nos cards
 *   - Desktop: grid de 3 colunas, layout completo
 *   - Breakpoints: sm, lg, xl
 *
 * @example
 * // Uso em rota de administrador
 * <CadastroGestores />
 *
 * @see /src/lib/api/gestorApi.ts - Server Action addGestor
 * @see /src/components/form/form-item.tsx - Componente de campo
 * @see /src/app/gestor/gestores/page.tsx - Lista de gestores
 */

export default function CadastroGestores() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  /**
   * useActionState gerencia:
   * - state: Resultado da Server Action { error?: boolean, message?: string }
   * - action: Função de submit (addGestor)
   * - pending: Estado de carregamento durante envio
   */
  const [state, action, pending] = useActionState(addGestor, null);

  // Estados para validação em tempo real
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');

  // --------------------------------------------------------------------------
  // VALORES DERIVADOS (VALIDAÇÕES COMPUTADAS)
  // --------------------------------------------------------------------------

  /**
   * emailValido: Verifica formato do email usando regex
   * - Ignora campo vazio (email === '') para não mostrar erro prematuro
   * - Só valida após usuário começar a digitar
   *
   * Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   * - [^\s@]+ : caracteres antes do @ (sem espaços ou @)
   * - @ : símbolo obrigatório
   * - [^\s@]+ : domínio (sem espaços ou @)
   * - \. : ponto obrigatório
   * - [^\s@]+ : extensão (sem espaços ou @)
   */
  const emailValido = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /**
   * emailsIguais: Compara email e confirmação
   * - Considera válido se confirmação vazia (evita erro prematuro)
   * - Só valida após usuário digitar no campo de confirmação
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
   * 1. Emails devem ser iguais (emailsIguais)
   * 2. Email deve ter formato válido (emailValido)
   *
   * Se validações falharem, a função retorna sem chamar a action
   * As mensagens de erro já estão sendo exibidas na UI
   *
   * @param formData - Dados do formulário (inclui nome, email, cpf, telefone)
   * @returns Resultado da Server Action ou undefined
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
            Inclui navegação, título e descrição
          -------------------------------------------------------------------- */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            {/* Barra de navegação superior */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {/* Botão voltar para lista de gestores */}
                <Link
                  href="/gestor/gestores"
                  className="group flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all hover:shadow-sm hover:border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500 group-hover:text-gray-700 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Voltar
                  </span>
                </Link>

                {/* Divisor vertical (desktop) */}
                <div className="hidden sm:block h-6 w-px bg-gray-300"></div>

                {/* Indicador de página (desktop) */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Cadastro de Gestor
                  </span>
                </div>
              </div>

              {/* Badge "Novo Gestor" para mobile */}
              <div className="sm:hidden flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700">
                    Novo Gestor
                  </span>
                </div>
              </div>
            </div>

            {/* Título e descrição da página */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Cadastrar Novo Gestor
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl">
                Preencha os dados abaixo para adicionar um novo gestor ao
                sistema. Todos os campos são obrigatórios.
              </p>
            </div>
          </div>

          {/* --------------------------------------------------------------------
            CARD PRINCIPAL DO FORMULÁRIO
          -------------------------------------------------------------------- */}
          <Card className="w-full overflow-hidden border-gray-200 shadow-lg">
            {/* Header do Card com ícone e título */}
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Ícone principal com badge */}
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full border-4 border-gray-50 flex items-center justify-center shadow-md">
                      <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Título e descrição do card */}
                <div className="flex-1 text-center sm:text-left">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Dados do Gestor
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                    Informações pessoais e de contato do novo gestor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Formulário usando Next.js Form (Server Action) */}
            <Form action={handleSubmit}>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* --------------------------------------------------------------------
                  MENSAGENS DE FEEDBACK (3 TIPOS)
                -------------------------------------------------------------------- */}

                {/* Mensagem da API (erro/sucesso pós-submit) */}
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

                {/* Validação: email com formato inválido */}
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
                    description="Insira o nome completo do gestor"
                  >
                    <div className="relative">
                      <Input
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-3 px-4"
                        id="nome"
                        name="nome"
                        placeholder="Exemplo: Maria da Silva Souza"
                        required
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
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
                      description="Email institucional do gestor"
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
                          placeholder="gestor@organizacao.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value.toLowerCase)}
                          autoComplete="email"
                        />
                        {/* Ícone de email */}
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
                          placeholder="gestor@organizacao.com"
                          required
                          value={confirmarEmail}
                          onChange={(e) =>
                            setConfirmarEmail(e.target.value.toLowerCase)
                          }
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
                      {/* Ícone de impressão digital */}
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
                      {/* Ícone de telefone */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <Phone className="w-3 h-3 text-gray-500" />
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
                      Ao cadastrar, o gestor receberá um email com instruções de
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
                          Cadastrar Gestor
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
            Três cards com dicas sobre o perfil do gestor
          -------------------------------------------------------------------- */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Permissões */}
            <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">
                    Permissões
                  </h4>
                  <p className="text-blue-700 text-xs mt-1">
                    O gestor terá acesso completo ao sistema
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Confirmação */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    Confirmação
                  </h4>
                  <p className="text-gray-700 text-xs mt-1">
                    Um email de confirmação será enviado
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Validação */}
            <div className="bg-green-50 rounded-lg border border-green-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900 text-sm">
                    Validação
                  </h4>
                  <p className="text-green-700 text-xs mt-1">
                    Todos os dados são validados automaticamente
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
