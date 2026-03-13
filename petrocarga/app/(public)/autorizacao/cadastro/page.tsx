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
import { addMotorista } from '@/lib/api/motoristaApi';
import { CircleAlert, Eye, EyeOff, UserIcon, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Form from 'next/form';
import { useActionState } from 'react';
import { useState, useEffect } from 'react';
import FormItem from '@/components/form/form-item';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
import useValidacaoSenha from '@/components/hooks/useValidacaoSenha';
import FeedbackSenha from '@/components/feedback/feedback-senha';
import ModalSucessoCadastro from '@/components/modal/autorizacao/cadastro/ModalSucessoCadastro';

/**
 * @component CadastroUsuario
 * @version 1.0.0
 *
 * @description Formulário multi-etapas para cadastro de motoristas parceiros.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO DO CADASTRO:
 * ----------------------------------------------------------------------------
 * 1. Coleta dados pessoais (nome, CPF, telefone) - com máscara automática
 * 2. Coleta dados da CNH (número, categoria, validade)
 * 3. Coleta dados de acesso (email, senha, confirmação)
 * 4. Validações em tempo real:
 *    - Força da senha via hook useValidacaoSenha
 *    - Correspondência entre senha e confirmação
 *    - Campos obrigatórios preenchidos
 * 5. Envio para API via useActionState (gerencia loading/error/success)
 * 6. Pós-cadastro:
 *    - Modal de ativação da conta
 *    - Email salvo no sessionStorage para fluxo de ativação
 *    - Formulário resetado para novo uso
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * - Estados individuais: Optamos por useState separados em vez de um objeto
 *   único para melhor legibilidade e para evitar re-renders desnecessários
 *   em campos não relacionados
 *
 * - Senha controlada via hook: useValidacaoSenha encapsula lógica complexa
 *   de validação (requisitos, força) para reuso em outros componentes
 *
 * - SessionStorage pós-cadastro: Escolhido em vez de localStorage para não
 *   persistir dados sensíveis após fechar a aba. Usado apenas para disparar
 *   o modal de ativação na página de login
 *
 * - useActionState do Next.js: Gerencia estados de loading, erro e sucesso
 *   de forma integrada com Server Actions, eliminando boilerplate manual
 *
 * - Campos controlados vs não-controlados: Todos os inputs são controlados
 *   via useState para garantir sincronia entre validações e UI
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * - ModalSucessoCadastro: Modal de confirmação e ativação da conta
 * - FeedbackSenha: Feedback visual dos requisitos e força da senha
 * - SelecaoCustomizada: Select estilizado para categoria da CNH
 * - FormItem: Wrapper com label e tooltip de ajuda
 * - useValidacaoSenha: Hook com lógica de validação de senha
 *
 * ----------------------------------------------------------------------------
 * 📦 CONSTANTES E CONFIGURAÇÕES:
 * ----------------------------------------------------------------------------
 * @constant CATEGORIAS_CNH - Opções baseadas na legislação brasileira (DENATRAN)
 * @constant VALIDATION_LENGTHS - Tamanhos máximos para campos numéricos
 * @constant ERROR_MESSAGES - Mensagens padronizadas de erro
 *
 * @example
 * // Uso básico em rota protegida
 * <CadastroUsuario />
 *
 * @see /src/lib/api/motoristaApi.ts - Integração com backend
 * @see /src/components/hooks/useValidacaoSenha - Validação de senha
 * @see /src/components/modal/autorizacao/cadastro/ModalSucessoCadastro - Modal pós-cadastro
 */

// ----------------------------------------------------------------------------
// CONSTANTES
// ----------------------------------------------------------------------------

/**
 * Tamanhos máximos para campos numéricos
 * Centralizados para facilitar alterações futuras
 */
const VALIDATION_LENGTHS = {
  CPF: 11,
  PHONE: 11,
  CNH: 11, // Formato padrão nacional
} as const;

/**
 * Mensagens de erro padronizadas
 * Garantem consistência na experiência do usuário
 */
const ERROR_MESSAGES = {
  PASSWORD_MISMATCH: 'As senhas não coincidem. Por favor, verifique.',
  PASSWORD_REQUIREMENTS: 'A senha não atende aos requisitos mínimos.',
  GENERIC_ERROR: 'Erro ao cadastrar motorista.',
  SUCCESS: 'Cadastro realizado com sucesso!',
} as const;

export default function CadastroUsuario() {
  // --------------------------------------------------------------------------
  // ESTADOS DE FORMULÁRIO E UI
  // --------------------------------------------------------------------------

  // useActionState gerencia o estado da submissão (loading, erro, sucesso)
  // Integrado com Server Actions do Next.js para chamadas à API
  const [state, addMotoristaAction, pending] = useActionState(
    addMotorista,
    null,
  );

  // Controles de UI para mostrar/ocultar senhas
  const [exibirSenha, setExibirSenha] = useState(false);
  const [exibirConfirmarSenha, setExibirConfirmarSenha] = useState(false);

  // Hook customizado que encapsula toda lógica de validação de senha
  // Retorna: senha, setSenha, regras, ehValida, forca
  const { senha, setSenha, regras, ehValida, forca } = useValidacaoSenha();

  // Estado da confirmação de senha (separado para validação cruzada)
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados para feedback pós-cadastro
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Estados individuais para cada campo do formulário
  // Escolha intencional: estados separados melhoram legibilidade e performance
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [numeroCnh, setNumeroCnh] = useState('');
  const [tipoCnh, setTipoCnh] = useState('');
  const [dataValidadeCnh, setDataValidadeCnh] = useState('');
  const [email, setEmail] = useState('');

  // --------------------------------------------------------------------------
  // VALORES DERIVADOS (COMPUTADOS)
  // --------------------------------------------------------------------------

  // Verifica se as senhas são iguais (ignora quando confirmação está vazia)
  // Preferimos calcular diretamente em vez de usar estado + useEffect
  const senhasIguais = confirmarSenha === '' || senha === confirmarSenha;

  // Verifica se todos os campos obrigatórios estão preenchidos
  // Usado para habilitar/desabilitar botão de submit
  const camposPreenchidos =
    nome.trim() !== '' &&
    cpf.trim() !== '' &&
    telefone.trim() !== '' &&
    numeroCnh.trim() !== '' &&
    tipoCnh !== '' && // Select precisa ter valor selecionado
    dataValidadeCnh !== '' &&
    email.trim() !== '' &&
    senha !== '' &&
    confirmarSenha !== '';

  // --------------------------------------------------------------------------
  // FUNÇÕES DE RESET E UTILITÁRIAS
  // --------------------------------------------------------------------------

  /**
   * Reseta todos os estados do formulário para valores iniciais
   * Usada após cadastro bem-sucedido para preparar novo cadastro
   */
  const resetForm = () => {
    setNome('');
    setCpf('');
    setTelefone('');
    setNumeroCnh('');
    setTipoCnh('');
    setDataValidadeCnh('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
  };

  /**
   * Fecha o modal de sucesso pós-cadastro
   */
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  // --------------------------------------------------------------------------
  // HANDLERS DE EVENTOS
  // --------------------------------------------------------------------------

  /**
   * Processa o envio do formulário de cadastro
   *
   * @param formData - Dados do formulário (excluindo senha, que é adicionada manualmente)
   * @returns Promise com resultado da API
   *
   * @remarks
   * A senha é adicionada manualmente ao FormData porque:
   * 1. O input de senha não tem atributo 'name' (evita duplicidade no FormData)
   * 2. Precisamos garantir que a senha validada seja exatamente a mesma enviada
   * 3. O hook useValidacaoSenha mantém a senha em estado separado do formulário
   *
   * @throws Não lança erros diretamente, usa toast para feedback visual
   */
  const handleSubmit = async (formData: FormData) => {
    // Validações antes do envio
    if (!senhasIguais) {
      toast.error(ERROR_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    if (!ehValida) {
      toast.error(ERROR_MESSAGES.PASSWORD_REQUIREMENTS);
      return;
    }

    // Adiciona a senha validada ao FormData
    formData.append('senha', senha);

    // Envia para a Server Action
    return await addMotoristaAction(formData);
  };

  // --------------------------------------------------------------------------
  // EFEITOS COLATERAIS
  // --------------------------------------------------------------------------

  /**
   * Monitora o resultado da Server Action (addMotoristaAction)
   *
   * @effect
   * - Em caso de erro: Exibe toast com mensagem
   * - Em caso de sucesso:
   *   - Exibe toast de sucesso
   *   - Salva email no sessionStorage (para modal de ativação na página de login)
   *   - Abre modal de sucesso
   *   - Reseta formulário
   *
   * @dependency state - Resultado da Server Action
   * @dependency email - Para salvar no sessionStorage
   * @dependency setSenha - Necessário para reset do formulário
   */
  useEffect(() => {
    if (!state) return;

    // Caso de erro na API
    if (state.error) {
      toast.error(state.message || ERROR_MESSAGES.GENERIC_ERROR);
      return;
    }

    // Sucesso no cadastro
    toast.success(state.message || ERROR_MESSAGES.SUCCESS);

    // Prepara dados para o modal de ativação
    // SessionStorage: escolhido para não persistir após fechar a aba
    setUserEmail(email);
    sessionStorage.setItem('abrirModalAtivacao', 'true');
    sessionStorage.setItem('emailCadastro', email);

    // Abre modal e limpa formulário
    setShowSuccessModal(true);
    resetForm();
  }, [state]); // Incluímos a dependência necessária

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <>
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        <Card className="w-full max-w-5xl mx-auto">
          {/* Header do Card com ícone e título */}
          <CardHeader className="space-y-3 text-center pb-4 sm:pb-6">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg">
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Cadastro
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Forneça os dados para criar sua conta
            </CardDescription>
          </CardHeader>

          {/* Formulário - usa Form do Next.js para integração com Server Actions */}
          <Form action={handleSubmit}>
            <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
              {/* Feedback de erro/sucesso da API */}
              {(state?.error || state?.message) && (
                <div
                  className={`flex items-start gap-2 sm:gap-3 rounded-md border p-3 sm:p-4 mb-4 sm:mb-6 ${
                    state.error
                      ? 'border-red-200 bg-red-50 text-red-900'
                      : 'border-green-200 bg-green-50 text-green-900'
                  }`}
                >
                  {state.error ? (
                    <CircleAlert className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs sm:text-sm md:text-base">
                    {state.message}
                  </span>
                </div>
              )}

              {/* Feedback de senhas diferentes */}
              {!senhasIguais && (
                <div className="flex items-start gap-2 sm:gap-3 rounded-md border border-red-200 bg-red-50 text-red-900 p-3 sm:p-4 mb-4 sm:mb-6">
                  <CircleAlert className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm md:text-base">
                    {ERROR_MESSAGES.PASSWORD_MISMATCH}
                  </span>
                </div>
              )}

              <div className="space-y-6 sm:space-y-8">
                {/* SEÇÃO 1: DADOS PESSOAIS */}
                <div className="space-y-4">
                  <CardDescription className="text-sm sm:text-base text-center text-blue-800 font-bold">
                    Primeiro, alguns dados pessoais
                  </CardDescription>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Nome completo - largura total em mobile e desktop */}
                    <div className="md:col-span-2">
                      <FormItem
                        name="Nome"
                        description="Insira seu nome completo."
                      >
                        <Input
                          className="rounded-sm border-gray-400 text-sm sm:text-base"
                          id="nome"
                          name="nome"
                          placeholder="João Alves da Silva"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                        />
                      </FormItem>
                    </div>

                    {/* CPF - com máscara automática (remove não-números) */}
                    <FormItem
                      name="CPF"
                      description="Insira seu CPF (apenas números). Exemplo: 12345678900"
                    >
                      <Input
                        className="rounded-sm border-gray-400 text-sm sm:text-base"
                        id="cpf"
                        name="cpf"
                        placeholder="12345678900"
                        maxLength={VALIDATION_LENGTHS.CPF}
                        type="text"
                        inputMode="numeric"
                        value={cpf}
                        onChange={(e) =>
                          setCpf(e.target.value.replace(/\D/g, ''))
                        }
                        required
                      />
                    </FormItem>

                    {/* Telefone - com máscara automática (remove não-números) */}
                    <FormItem
                      name="Número de Telefone"
                      description="Digite seu número de telefone com DDD (apenas números). Exemplo: 22912345678"
                    >
                      <Input
                        className="rounded-sm border-gray-400 text-sm sm:text-base"
                        id="telefone"
                        name="telefone"
                        placeholder="22912345678"
                        maxLength={VALIDATION_LENGTHS.PHONE}
                        type="text"
                        inputMode="numeric"
                        value={telefone}
                        onChange={(e) =>
                          setTelefone(e.target.value.replace(/\D/g, ''))
                        }
                        required
                      />
                    </FormItem>
                  </div>
                </div>

                {/* SEÇÃO 2: DADOS DA CNH */}
                <div className="space-y-4">
                  <CardDescription className="text-sm sm:text-base text-center text-blue-800 font-bold">
                    Agora Vamos para a CNH
                  </CardDescription>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Número da CNH */}
                    <div className="md:col-span-2">
                      <FormItem
                        name="Número da CNH"
                        description="Ponha o número da CNH. Exemplo: 12345678900"
                      >
                        <Input
                          className="rounded-sm border-gray-400 text-sm sm:text-base"
                          id="numeroCnh"
                          name="numeroCnh"
                          placeholder="12345678900"
                          maxLength={VALIDATION_LENGTHS.CNH}
                          value={numeroCnh}
                          onChange={(e) => setNumeroCnh(e.target.value)}
                          required
                        />
                      </FormItem>
                    </div>

                    {/* Categoria da CNH - Select customizado */}
                    <FormItem
                      name="Categoria da CNH"
                      description="Selecione a categoria da sua CNH"
                    >
                      <SelecaoCustomizada
                        id="tipoCnh"
                        name="tipoCnh"
                        placeholder="Selecione a categoria"
                        value={tipoCnh}
                        onChange={(val) => setTipoCnh(val)}
                        options={[
                          { value: 'B', label: 'Categoria B' },
                          { value: 'AB', label: 'Categoria AB' },
                          { value: 'C', label: 'Categoria C' },
                          { value: 'AC', label: 'Categoria AC' },
                          { value: 'D', label: 'Categoria D' },
                          { value: 'AD', label: 'Categoria AD' },
                          { value: 'E', label: 'Categoria E' },
                          { value: 'AE', label: 'Categoria AE' },
                        ]}
                      />
                    </FormItem>

                    {/* Data de validade da CNH */}
                    <FormItem
                      name="Data de Vencimento da CNH"
                      description="Informe a data de vencimento da sua CNH"
                    >
                      <Input
                        className="rounded-sm border-gray-400 text-sm sm:text-base"
                        type="date"
                        id="dataValidadeCnh"
                        name="dataValidadeCnh"
                        value={dataValidadeCnh}
                        onChange={(e) => setDataValidadeCnh(e.target.value)}
                        required
                      />
                    </FormItem>
                  </div>
                </div>

                {/* SEÇÃO 3: DADOS DE ACESSO */}
                <div className="space-y-4">
                  <CardDescription className="text-sm sm:text-base text-center text-blue-800 font-bold">
                    Por fim, os dados de acesso
                  </CardDescription>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Email */}
                    <div className="md:col-span-2">
                      <FormItem name="Email" description="Digite seu email">
                        <Input
                          className="rounded-sm border-gray-400 text-sm sm:text-base"
                          type="email"
                          id="email"
                          name="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </FormItem>
                    </div>

                    {/* Senha - com botão de mostrar/ocultar e feedback visual */}
                    <FormItem name="Senha" description="Digite sua senha">
                      <div className="relative">
                        <Input
                          type={exibirSenha ? 'text' : 'password'}
                          className="rounded-sm border-gray-400 text-sm sm:text-base pr-10"
                          id="senha"
                          placeholder="••••••••"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setExibirSenha(!exibirSenha)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={
                            exibirSenha ? 'Ocultar senha' : 'Mostrar senha'
                          }
                        >
                          {exibirSenha ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                      {/* Componente de feedback visual da força da senha */}
                      <FeedbackSenha
                        regras={regras}
                        forca={forca}
                        senha={senha}
                      />
                    </FormItem>

                    {/* Confirmar Senha - com validação em tempo real */}
                    <FormItem
                      name="Confirmar Senha"
                      description="Digite novamente sua senha"
                    >
                      <div className="relative">
                        <Input
                          type={exibirConfirmarSenha ? 'text' : 'password'}
                          className={`rounded-sm border-gray-400 text-sm sm:text-base pr-10 ${
                            !senhasIguais && confirmarSenha !== ''
                              ? 'border-red-500 focus:ring-red-500'
                              : ''
                          }`}
                          id="confirmarSenha"
                          placeholder="••••••••"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setExibirConfirmarSenha(!exibirConfirmarSenha)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={
                            exibirConfirmarSenha
                              ? 'Ocultar senha'
                              : 'Mostrar senha'
                          }
                        >
                          {exibirConfirmarSenha ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                      {/* Feedback específico para senhas diferentes */}
                      {!senhasIguais && confirmarSenha !== '' && (
                        <p className="text-red-500 text-xs mt-1">
                          As senhas não coincidem
                        </p>
                      )}
                    </FormItem>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Footer com botão de submit */}
            <CardFooter className="px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 pt-0">
              <Button
                type="submit"
                disabled={
                  pending || !camposPreenchidos || !senhasIguais || !ehValida
                }
                className="w-full rounded-sm px-4 sm:px-6 md:px-10 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-blue-800 bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {pending ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardFooter>
          </Form>
        </Card>
      </main>

      {/* Modal de sucesso pós-cadastro */}
      <ModalSucessoCadastro
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        userEmail={userEmail}
      />
    </>
  );
}
