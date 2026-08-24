'use client';

import { Empresa } from '@/lib/types/personas/empresa';
import { useActionState, useEffect, useState } from 'react';
import { atualizarEmpresa } from '@/services/api/empresaApi';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, CircleAlert, Building2 } from 'lucide-react';
import Form from 'next/form';
import FormItem from '@/components/form/form-item';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditarEmpresaProps {
  empresa: Empresa;
  onSuccess?: () => void;
}

export default function EditarEmpresa({
  empresa,
  onSuccess,
}: EditarEmpresaProps) {
  const [state, atualizarEmpresaAction, pending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      return await atualizarEmpresa(formData);
    },
    null,
  );

  /*
   * Dados da empresa/usuário
   *
   * A API retorna:
   * empresa.usuario.nome
   * empresa.usuario.telefone
   * empresa.usuario.email
   * empresa.usuario.cnpj
   */
  const [nome, setNome] = useState(empresa.usuario?.nome ?? '');
  const [telefone, setTelefone] = useState(
    empresa.usuario?.telefone?.replace(/\D/g, '') ?? '',
  );
  const [email, setEmail] = useState(empresa.usuario?.email ?? '');
  const [cnpj, setCnpj] = useState(
    empresa.usuario?.cnpj?.replace(/\D/g, '') ?? '',
  );

  useEffect(() => {
    if (state && !state.error && state.message && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess();
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [state, onSuccess]);

  return (
    <main className="container mx-auto px-4 py-4 md:py-8">
      <Card className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>

          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Edição de Empresa
          </CardTitle>

          <CardDescription className="text-base">
            Atualize os dados da empresa conforme necessário.
          </CardDescription>
        </CardHeader>

        <Form action={atualizarEmpresaAction}>
          {/* ID da empresa utilizado na URL do PATCH */}
          <input type="hidden" name="id" value={empresa.id} />

          {/* ID da empresa enviado no payload */}
          <input type="hidden" name="empresaId" value={empresa.id} />

          <CardContent className="p-4 md:p-6 lg:p-8">
            {/* Feedback */}
            {(state?.error || state?.message) && (
              <div
                className={`flex items-start gap-3 rounded-md border p-4 mb-6 ${
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

                <div>
                  <span className="text-sm md:text-base">
                    {state.message}
                  </span>

                  {!state.error && (
                    <p className="text-green-700 text-sm mt-1">
                      Redirecionando para o perfil...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* DADOS DA EMPRESA */}
            {/* ========================================================= */}

            <CardDescription className="text-base text-center mb-6 text-blue-800 font-bold">
              Dados da Empresa
            </CardDescription>

            {/* Nome da empresa */}
            <FormItem
              name="Nome"
              description="Informe o nome da empresa."
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="nome"
                name="nome"
                placeholder="Ex.: Mudanças Balthazar"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </FormItem>

            {/* CNPJ */}
            <FormItem
              name="CNPJ"
              description="Informe o CNPJ da empresa."
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="cnpj"
                name="cnpj"
                placeholder="00000000000000"
                maxLength={14}
                inputMode="numeric"
                value={cnpj}
                onChange={(e) =>
                  setCnpj(e.target.value.replace(/\D/g, ''))
                }
                required
              />
            </FormItem>

            {/* E-mail */}
            <FormItem
              name="E-mail"
              description="Informe o endereço de e-mail da empresa."
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="email"
                name="email"
                type="email"
                placeholder="empresa@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormItem>

            {/* Telefone */}
            <FormItem
              name="Telefone"
              description="Digite o telefone com DDD. Ex.: 24999998888"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="telefone"
                name="telefone"
                placeholder="24999998888"
                maxLength={11}
                inputMode="numeric"
                value={telefone}
                onChange={(e) =>
                  setTelefone(e.target.value.replace(/\D/g, ''))
                }
                required
              />
            </FormItem>

            {/* ========================================================= */}
            {/* SENHA */}
            {/* ========================================================= */}

            <CardDescription className="text-base text-center mt-8 mb-6 text-blue-800 font-bold">
              Alteração de Senha
            </CardDescription>

            <FormItem
              name="Nova Senha"
              description="Deixe em branco caso não queira alterar a senha."
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="senha"
                name="senha"
                type="password"
                placeholder="Digite uma nova senha"
              />
            </FormItem>
          </CardContent>

          {/* Footer */}
          <CardFooter className="px-4 md:px-6 lg:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium text-blue-800 bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {pending ? 'Salvando...' : 'Atualizar'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </main>
  );
}