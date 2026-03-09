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
import { useActionState, useState, useEffect } from 'react';
import {
  CircleAlert,
  UserIcon,
  CheckCircle,
  Shield,
  ChevronLeft,
  Badge,
  Phone,
  Fingerprint,
  Mail,
  FileText,
} from 'lucide-react';
import FormItem from '@/components/form/form-item';
import { addAgente } from '@/lib/api/agenteApi';
import Link from 'next/link';

export default function CadastroAgentes() {
  const [state, action, pending] = useActionState(addAgente, null);
  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');
  const [emailsIguais, setEmailsIguais] = useState(true);
  const [emailValido, setEmailValido] = useState(true);
  const [formTocado, setFormTocado] = useState(false);

  // Validação dos emails
  useEffect(() => {
    if (confirmarEmail === '') {
      setEmailsIguais(true);
    } else {
      setEmailsIguais(email === confirmarEmail);
    }
  }, [email, confirmarEmail]);

  // Validação do formato do email
  useEffect(() => {
    if (email === '') {
      setEmailValido(true);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValido(emailRegex.test(email));
    }
  }, [email]);

  // Função para lidar com o envio do formulário
  const handleSubmit = async (formData: FormData) => {
    if (!emailsIguais || !emailValido) {
      return; // Impede o envio se os emails não forem válidos
    }

    setFormTocado(true);
    return await action(formData);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Container principal */}
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho melhorado */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/gestor/agentes"
                  className="group flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all hover:shadow-sm hover:border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500 group-hover:text-gray-700 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Voltar
                  </span>
                </Link>
                <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Cadastro de Agente
                  </span>
                </div>
              </div>

              {/* Indicador de progresso para mobile */}
              <div className="sm:hidden flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700">
                    Novo Agente
                  </span>
                </div>
              </div>
            </div>

            {/* Título principal */}
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

          <Card className="w-full overflow-hidden border-gray-200 shadow-lg">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
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

            <Form action={handleSubmit}>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Mensagens de feedback */}
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

                {/* Mensagem de erro para emails diferentes */}
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

                {/* Mensagem de erro para email inválido */}
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

                <div className="space-y-4 sm:space-y-6">
                  {/* Nome */}
                  <FormItem
                    name="Nome Completo"
                    description="Insira o nome completo do agente"
                  >
                    <div className="relative">
                      <Input
                        className={`rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base py-3 px-4 ${
                          formTocado
                            ? 'group-focus-within:ring-2 group-focus-within:ring-blue-100'
                            : ''
                        }`}
                        id="nome"
                        name="nome"
                        placeholder="Exemplo: Eduardo Silva Dantas"
                        required
                        autoComplete="name"
                        onFocus={() => setFormTocado(true)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-500">*</span>
                        </div>
                      </div>
                    </div>
                  </FormItem>

                  {/* Email */}
                  <div className="space-y-4 sm:space-y-6">
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
                          } ${
                            formTocado
                              ? 'group-focus-within:ring-2 group-focus-within:ring-blue-100'
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
                          onFocus={() => setFormTocado(true)}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <Mail className="w-3 h-3 text-gray-500" />
                          </div>
                        </div>
                      </div>
                    </FormItem>

                    {/* Confirmar Email */}
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
                          } ${
                            formTocado
                              ? 'group-focus-within:ring-2 group-focus-within:ring-blue-100'
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
                          onFocus={() => setFormTocado(true)}
                        />
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

                  {/* CPF */}
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
                        autoComplete="off"
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(
                            /\D/g,
                            '',
                          );
                        }}
                        onFocus={() => setFormTocado(true)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <Fingerprint className="w-3 h-3 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </FormItem>

                  {/* Telefone */}
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
                        autoComplete="tel"
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(
                            /\D/g,
                            '',
                          );
                        }}
                        onFocus={() => setFormTocado(true)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <Phone className="w-3 h-3 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </FormItem>

                  {/* Matrícula */}
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
                        autoComplete="off"
                        onFocus={() => setFormTocado(true)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <Badge className="w-3 h-3 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </FormItem>
                </div>
              </CardContent>

              <CardFooter className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Ao cadastrar, o agente receberá um email com instruções de
                      acesso
                    </p>
                  </div>
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

          {/* Informações adicionais */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
