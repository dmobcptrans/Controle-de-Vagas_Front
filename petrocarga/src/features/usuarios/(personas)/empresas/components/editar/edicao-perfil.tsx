'use client';

import { EmpresaResponse, AtualizarEmpresaPayload } from '../../types/empresa2';

import { useState } from 'react';

import { useEmpresaMutation } from '../../hooks/useEmpresaMutation';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  CheckCircle,
  CircleAlert,
  Building2,
} from 'lucide-react';

import FormItem from '@/components/form/form-item';

import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import toast from 'react-hot-toast';

interface EditarEmpresaProps {
  empresa: EmpresaResponse;
  onSuccess?: () => void;
}

export default function EditarEmpresa({
  empresa,
  onSuccess,
}: EditarEmpresaProps) {
  const { atualizar, loading, error, limparError } =
    useEmpresaMutation();

  /*
   * Dados da empresa/usuário
   *
   * A API retorna:
   * empresa.usuario.nome
   * empresa.usuario.telefone
   * empresa.usuario.email
   * empresa.usuario.cnpj
   */

  const [nome, setNome] = useState(
    empresa.usuario?.nome ?? '',
  );

  const [telefone, setTelefone] = useState(
    empresa.usuario?.telefone?.replace(/\D/g, '') ?? '',
  );

  const [email, setEmail] = useState(
    empresa.usuario?.email ?? '',
  );

  const [cnpj, setCnpj] = useState(
    empresa.usuario?.cnpj?.replace(/\D/g, '') ?? '',
  );

  const [senha, setSenha] = useState('');

  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    limparError();
    setSuccess(false);

    const payload: AtualizarEmpresaPayload = {
      nome,
      telefone: telefone.replace(/\D/g, ''),
      email,
      cnpj: cnpj.replace(/\D/g, ''),
      senha,
    };

    const sucesso = await atualizar(
      empresa.id,
      payload,
    );

    if (!sucesso) {
      toast.error(
        error ?? 'Não foi possível atualizar a empresa.',
      );

      return;
    }

    setSuccess(true);

    toast.success('Empresa atualizada com sucesso!');

    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 250);
    }
  }

  return (
    <main className="container mx-auto px-4 py-4 md:py-8">
      <Card className="mx-auto w-full max-w-4xl">

        {/* Header */}
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>

          <CardTitle className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-3xl font-bold text-transparent">
            Edição de Empresa
          </CardTitle>

          <CardDescription className="text-base">
            Atualize os dados da empresa conforme necessário.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 md:p-6 lg:p-8">

            {/* Feedback */}
            {(error || success) && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-md border p-4 ${
                  error
                    ? 'border-red-200 bg-red-50 text-red-900'
                    : 'border-green-200 bg-green-50 text-green-900'
                }`}
              >
                {error ? (
                  <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                )}

                <div>
                  <span className="text-sm md:text-base">
                    {error ?? 'Empresa atualizada com sucesso!'}
                  </span>

                  {!error && (
                    <p className="mt-1 text-sm text-green-700">
                      Redirecionando para o perfil...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* DADOS DA EMPRESA */}
            {/* ========================================================= */}

            <CardDescription className="mb-6 text-center text-base font-bold text-blue-800">
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
                  setCnpj(
                    e.target.value.replace(/\D/g, ''),
                  )
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
                onChange={(e) =>
                  setEmail(e.target.value)
                }
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
                  setTelefone(
                    e.target.value.replace(/\D/g, ''),
                  )
                }
                required
              />
            </FormItem>

            {/* ========================================================= */}
            {/* SENHA */}
            {/* ========================================================= */}

            <CardDescription className="mb-6 mt-8 text-center text-base font-bold text-blue-800">
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
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
              />
            </FormItem>
          </CardContent>

          {/* Footer */}
          <CardFooter className="px-4 pb-6 pt-2 md:px-6 lg:px-8">
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-blue-200 px-6 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-300 focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 md:ml-auto md:w-auto md:px-10 md:py-2.5 md:text-base"
            >
              {loading ? 'Salvando...' : 'Atualizar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
