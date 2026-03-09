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
import {
  CircleAlert,
  Eye,
  EyeOff,
  UserIcon,
  CheckCircle,
  Mail,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Form from 'next/form';
import { useActionState } from 'react';
import { useState, useEffect, useRef } from 'react';
import FormItem from '@/components/form/form-item';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
import useValidacaoSenha from '@/components/hooksGerais/useValidacaoSenha';
import FeedbackSenha from '@/components/feedback/feedback-senha';

export default function CadastroUsuario() {
  const [state, addMotoristaAction, pending] = useActionState(
    addMotorista,
    null,
  );
  const [exibirSenha, setExibirSenha] = useState(false);
  const [exibirConfirmarSenha, setExibirConfirmarSenha] = useState(false);
  const { senha, setSenha, regras, ehValida, forca } = useValidacaoSenha();
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhasIguais, setSenhasIguais] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [camposPreenchidos, setCamposPreenchidos] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Validação das senhas
  useEffect(() => {
    if (confirmarSenha === '') {
      setSenhasIguais(true);
    } else {
      setSenhasIguais(senha === confirmarSenha);
    }
  }, [senha, confirmarSenha]);

  // Função para verificar se todos os campos obrigatórios estão preenchidos
  const verificarCamposObrigatorios = () => {
    if (!formRef.current) return false;

    // Lista de IDs dos campos obrigatórios
    const camposObrigatorios = [
      'nome',
      'cpf',
      'telefone',
      'numeroCnh',
      'tipoCnh',
      'dataValidadeCnh',
      'email',
      'senha',
      'confirmarSenha',
    ];

    // Verifica se todos os campos estão preenchidos
    for (const campoId of camposObrigatorios) {
      if (campoId === 'tipoCnh') {
        // Para o select personalizado, verifica através do name
        const selectElement = document.querySelector(
          '[name="tipoCnh"]',
        ) as HTMLSelectElement;
        if (!selectElement || !selectElement.value) {
          return false;
        }
      } else {
        const campo = document.getElementById(campoId) as HTMLInputElement;
        if (!campo || !campo.value || campo.value.trim() === '') {
          return false;
        }
      }
    }

    return true;
  };

  // useEffect para monitorar mudanças nos campos e atualizar o estado
  useEffect(() => {
    const verificarCampos = () => {
      setCamposPreenchidos(verificarCamposObrigatorios());
    };

    // Verifica inicialmente
    setTimeout(verificarCampos, 100); // Pequeno delay para garantir que o DOM esteja pronto

    // Adiciona event listeners para todos os campos obrigatórios
    const camposIds = [
      'nome',
      'cpf',
      'telefone',
      'numeroCnh',
      'dataValidadeCnh',
      'email',
      'senha',
      'confirmarSenha',
    ];

    const handleChange = () => {
      verificarCampos();
    };

    // WeakSet para rastrear elementos que já têm listeners
    const elementsWithListeners = new WeakSet<Element>();

    // Função para adicionar listeners após o DOM estar pronto
    const adicionarListeners = () => {
      camposIds.forEach((id) => {
        const campo = document.getElementById(id);
        if (campo) {
          campo.addEventListener('input', handleChange);
          campo.addEventListener('change', handleChange);
        }
      });

      // Listener específico para o select personalizado
      const selectTipoCnh = document.querySelector('[name="tipoCnh"]');
      if (selectTipoCnh) {
        selectTipoCnh.addEventListener('change', handleChange);
        elementsWithListeners.add(selectTipoCnh);
      }
    };

    adicionarListeners();

    // Observer para detectar quando o select personalizado é carregado
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const selectTipoCnh = document.querySelector('[name="tipoCnh"]');
          if (selectTipoCnh && !elementsWithListeners.has(selectTipoCnh)) {
            selectTipoCnh.addEventListener('change', handleChange);
            elementsWithListeners.add(selectTipoCnh);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      camposIds.forEach((id) => {
        const campo = document.getElementById(id);
        if (campo) {
          campo.removeEventListener('input', handleChange);
          campo.removeEventListener('change', handleChange);
        }
      });

      const selectTipoCnh = document.querySelector('[name="tipoCnh"]');
      if (selectTipoCnh) {
        selectTipoCnh.removeEventListener('change', handleChange);
      }

      observer.disconnect();
    };
  }, []); // Executa apenas uma vez na montagem

  // useEffect adicional para monitorar mudanças nos estados de senha
  useEffect(() => {
    if (formRef.current) {
      setCamposPreenchidos(verificarCamposObrigatorios());
    }
  }, [senha, confirmarSenha]);

  // Monitora o state para abrir o modal quando o cadastro for bem-sucedido
  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast.error(state.message || 'Erro ao cadastrar motorista.');
      return;
    }

    if (!state.error) {
      toast.success(state.message || 'Cadastro realizado com sucesso!');

      const emailInput = document.getElementById('email') as HTMLInputElement;

      if (emailInput) {
        setUserEmail(emailInput.value);
        sessionStorage.setItem('abrirModalAtivacao', 'true');
        sessionStorage.setItem('emailCadastro', emailInput.value);
      }

      setShowSuccessModal(true);

      if (formRef.current) {
        formRef.current.reset();
        setSenha('');
        setConfirmarSenha('');
      }
    }
  }, [setSenha, state]);

  // Função para lidar com o envio do formulário
  const handleSubmit = async (formData: FormData) => {
    if (!senhasIguais) {
      // Impede o envio se as senhas não forem iguais
      toast.error('As senhas não coincidem.');
      return;
    }

    if (!ehValida) {
      toast.error('A senha não atende aos requisitos mínimos.');
      return;
    }

    // Adiciona a senha ao formData
    formData.append('senha', senha);

    // Chama a action
    return await addMotoristaAction(formData);
  };

  // Fechar modal
  const closeModal = () => {
    setShowSuccessModal(false);
  };

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSuccessModal) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showSuccessModal]);

  return (
    <>
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        <Card className="w-full max-w-5xl mx-auto">
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

          <Form action={handleSubmit} ref={formRef}>
            <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
              {/* Mensagem de erro ou sucesso */}
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

              {/* Mensagem de erro para senhas diferentes */}
              {!senhasIguais && (
                <div className="flex items-start gap-2 sm:gap-3 rounded-md border border-red-200 bg-red-50 text-red-900 p-3 sm:p-4 mb-4 sm:mb-6">
                  <CircleAlert className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm md:text-base">
                    As senhas não coincidem. Por favor, verifique.
                  </span>
                </div>
              )}

              <div className="space-y-6 sm:space-y-8">
                {/* Seção Dados Pessoais */}
                <div className="space-y-4">
                  <CardDescription className="text-sm sm:text-base text-center text-blue-800 font-bold">
                    Primeiro, alguns dados pessoais
                  </CardDescription>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Nome */}
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
                          required
                        />
                      </FormItem>
                    </div>

                    {/* CPF */}
                    <FormItem
                      name="CPF"
                      description="Insira seu CPF (apenas números). Exemplo: 12345678900"
                    >
                      <Input
                        className="rounded-sm border-gray-400 text-sm sm:text-base"
                        id="cpf"
                        name="cpf"
                        placeholder="12345678900"
                        maxLength={11}
                        type="text"
                        inputMode="numeric"
                        required
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/\D/g, '');
                        }}
                      />
                    </FormItem>

                    {/* Telefone */}
                    <FormItem
                      name="Número de Telefone"
                      description="Digite seu número de telefone com DDD (apenas números). Exemplo: 22912345678"
                    >
                      <Input
                        className="rounded-sm border-gray-400 text-sm sm:text-base"
                        id="telefone"
                        name="telefone"
                        placeholder="22912345678"
                        maxLength={11}
                        type="text"
                        inputMode="numeric"
                        required
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/\D/g, '');
                        }}
                      />
                    </FormItem>
                  </div>
                </div>

                {/* Seção CNH */}
                <div className="space-y-4">
                  <CardDescription className="text-sm sm:text-base text-center text-blue-800 font-bold">
                    Agora Vamos para a CNH
                  </CardDescription>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* CNH */}
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
                          required
                        />
                      </FormItem>
                    </div>

                    {/* Tipo da CNH */}
                    <FormItem
                      name="Categoria da CNH"
                      description="Selecione a categoria da sua CNH"
                    >
                      <SelecaoCustomizada
                        id="tipoCnh"
                        name="tipoCnh"
                        placeholder="Selecione a categoria"
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

                    {/* Data de Vencimento da CNH */}
                    <FormItem
                      name="Data de Vencimento da CNH"
                      description="Informe a data de vencimento da sua CNH"
                    >
                      <Input
                        className="rounded-sm border-gray-400 text-sm sm:text-base"
                        type="date"
                        id="dataValidadeCnh"
                        name="dataValidadeCnh"
                        required
                      />
                    </FormItem>
                  </div>
                </div>

                {/* Seção Dados de Acesso */}
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
                          required
                        />
                      </FormItem>
                    </div>

                    {/* Senha */}
                    <FormItem name="Senha" description="Digite sua senha">
                      <div className="relative">
                        <Input
                          type={exibirSenha ? 'text' : 'password'}
                          className="rounded-sm border-gray-400 text-sm sm:text-base pr-10"
                          id="senha"
                          name="senha"
                          placeholder="••••••••"
                          required
                          onChange={(e) => setSenha(e.target.value)}
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
                      <FeedbackSenha
                        regras={regras}
                        forca={forca}
                        senha={senha}
                      />
                    </FormItem>

                    {/* Confirmar Senha */}
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
                          name="confirmarSenha"
                          placeholder="••••••••"
                          required
                          onChange={(e) => setConfirmarSenha(e.target.value)}
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

            {/* Footer com botão */}
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

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de fechar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Conteúdo do Modal */}
            <div className="p-6 sm:p-8">
              {/* Ícone de sucesso */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
                Cadastro Realizado com Sucesso! 🎉
              </h2>

              {/* Mensagem principal */}
              <p className="text-center text-gray-600 mb-6">
                Sua conta foi criada com sucesso. Agora você precisa ativá-la.
              </p>

              {/* Card de verificação de email */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-800 text-lg mb-2">
                      📧 Verifique seu e-mail
                    </h3>
                    <p className="text-blue-600 text-sm mt-3">
                      <strong>
                        Use o código enviado para ativar sua conta.
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    window.location.href =
                      '/autorizacao/login?ativar-conta=true';
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Ir para Ativar Conta
                </Button>

                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-3 rounded-lg font-medium text-base transition-colors"
                >
                  Fechar
                </Button>

                <p className="text-center text-gray-500 text-sm mt-2">
                  Já ativou sua conta?{' '}
                  <a
                    href="/autorizacao/login"
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Faça login agora
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
