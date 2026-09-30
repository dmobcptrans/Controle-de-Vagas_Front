'use client';

import { useEffect, useState } from 'react';

import { useAgenteMutation } from '../../hooks/useAgenteMutation';
import { agenteResponse } from '../../types/agente2';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { CheckCircle, CircleAlert, UserIcon } from 'lucide-react';

import FormItem from '@/components/form/form-item';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditarAgenteProps {
  agente: agenteResponse;
  onSuccess?: () => void;
}

export default function EditarAgente({ agente, onSuccess }: EditarAgenteProps) {
  const { atualizar, loading, error, limparError } = useAgenteMutation();

  const [nome, setNome] = useState<string>(agente.usuario.nome);

  const [telefone, setTelefone] = useState<string>(
    agente.usuario.telefone ?? '',
  );

  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    if (mensagem && !error && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess();
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [mensagem, error, onSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    limparError();
    setMensagem(null);

    const payload = {
      nome,
      telefone,
    };

    const response = await atualizar(agente.usuario.id, payload);

    if (response) {
      setMensagem('Dados do agente atualizados com sucesso.');
    }
  };

  const mensagemErro = error;
  const mensagemSucesso = mensagem && !error;

  return (
    <main className="container mx-auto px-4 py-4 md:py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>

          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Edição de Perfil
          </CardTitle>

          <CardDescription className="text-base">
            Atualize os seus dados conforme necessário.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 md:p-6 lg:p-8">
            {(mensagemErro || mensagemSucesso) && (
              <div
                className={`flex items-start gap-3 rounded-md border p-4 mb-6 ${
                  mensagemErro
                    ? 'border-red-200 bg-red-50 text-red-900'
                    : 'border-green-200 bg-green-50 text-green-900'
                }`}
              >
                {mensagemErro ? (
                  <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}

                <div>
                  <span className="text-sm md:text-base">
                    {mensagemErro ?? mensagem}
                  </span>

                  {mensagemSucesso && (
                    <p className="text-green-700 text-sm mt-1">
                      Redirecionando para o perfil...
                    </p>
                  )}
                </div>
              </div>
            )}

            <CardDescription className="text-base text-center mb-6 text-blue-800 font-bold">
              Seus Dados
            </CardDescription>

            <FormItem
              name="Nome"
              description="Insira o nome completo do agente."
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="nome"
                name="nome"
                placeholder="Ex.: Eduardo Dantas"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </FormItem>

            <FormItem
              name="Telefone"
              description="Digite o telefone com DDD (apenas números). Exemplo: 21988887777"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="telefone"
                name="telefone"
                placeholder="21999998888"
                maxLength={11}
                inputMode="numeric"
                value={telefone}
                onChange={(e) =>
                  setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))
                }
                required
              />
            </FormItem>
          </CardContent>

          <CardFooter className="px-4 md:px-6 lg:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium text-blue-800 bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Salvando...' : 'Atualizar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
