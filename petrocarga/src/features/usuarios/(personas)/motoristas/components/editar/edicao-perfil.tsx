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
import { CheckCircle, CircleAlert, UserIcon } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import FormItem from '@/components/form/form-item';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
import { useMotoristaMutation } from '../../hooks/useMotoristaMutation';
import { MotoristaResponse1 } from '../../types/motorista';
import { AtualizarMotoristaPayload } from '../../types/motorista';

interface EditarMotoristaProps {
  motorista: MotoristaResponse1;
  onSuccess?: () => void;
}

/**
 * @component EditarMotorista
 * @version 2.0.0
 *
 * @description Formulário de edição de perfil para motoristas.
 * Permite atualizar nome, telefone, categoria da CNH e data de validade.
 *
 * 🧠 DECISÕES TÉCNICAS (v2):
 * - useMotoristaMutation: loading/error vêm do hook (via useApi),
 *   substituindo useActionState + Server Action.
 * - onSubmit + FormData: monta o payload tipado e chama atualizar(id, payload).
 * - Estado local `sucesso`: o hook só expõe `error`, então o sucesso
 *   é controlado aqui (resposta !== null).
 * - useEffect com timer: redireciona 250ms após o sucesso.
 * - O ID do motorista agora vai como argumento, não mais em input hidden.
 *
 * CAMPOS NÃO EDITÁVEIS: CPF, e-mail, número da CNH e senha.
 */
export default function EditarMotorista({
  motorista,
  onSuccess,
}: EditarMotoristaProps) {
  const { loading, error, atualizar, limparError } = useMotoristaMutation();
  const [sucesso, setSucesso] = useState(false);

  // ==================== REDIRECIONAMENTO APÓS SUCESSO ====================
  useEffect(() => {
    if (sucesso && onSuccess) {
      const timer = setTimeout(onSuccess, 250);
      return () => clearTimeout(timer);
    }
  }, [sucesso, onSuccess]);

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    limparError();
    setSucesso(false);

    const formData = new FormData(e.currentTarget);

    const payload: AtualizarMotoristaPayload = {
      nome: String(formData.get('nome') ?? ''),
      telefone: String(formData.get('telefone') ?? ''),
      tipoCnh: String(formData.get('tipoCnh') ?? ''),
      dataValidadeCnh: String(formData.get('dataValidadeCnh') ?? ''),
    };

    const resultado = await atualizar(motorista.usuario.id, payload);

    if (resultado) setSucesso(true);
  };

  return (
    <main className="container mx-auto px-4 py-4 md:py-8">
      <Card className="w-full max-w-5xl mx-auto">
        {/* Header do card */}
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Editar Perfil
          </CardTitle>
          <CardDescription className="text-base">
            Atualize seus dados cadastrais
          </CardDescription>
        </CardHeader>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 md:p-6 lg:p-8">
            {/* ==================== MENSAGEM DE FEEDBACK ==================== */}
            {(error || sucesso) && (
              <div
                className={`flex items-start gap-3 rounded-md border p-4 mb-6 ${
                  error
                    ? 'border-red-200 bg-red-50 text-red-900'
                    : 'border-green-200 bg-green-50 text-green-900'
                }`}
              >
                {error ? (
                  <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-sm md:text-base">
                    {error ?? 'Perfil atualizado com sucesso!'}
                  </span>
                  {!error && (
                    <p className="text-green-700 text-sm mt-1">
                      Redirecionando para o perfil...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ==================== SEÇÃO DADOS PESSOAIS ==================== */}
            <CardDescription className="text-base text-center mb-6 text-blue-800 font-bold">
              Dados Pessoais
            </CardDescription>

            <FormItem name="Nome" description="Insira seu nome completo.">
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="nome"
                name="nome"
                placeholder="João Alves da Silva"
                defaultValue={motorista.usuario.nome}
                required
              />
            </FormItem>

            <FormItem
              name="Número de Telefone"
              description="Digite seu número de telefone com DDD (apenas números). Exemplo: 22912345678"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="telefone"
                name="telefone"
                placeholder="22912345678"
                maxLength={11}
                type="text"
                inputMode="numeric"
                defaultValue={motorista.usuario.telefone}
                required
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, '');
                }}
              />
            </FormItem>

            {/* ==================== SEÇÃO CNH ==================== */}
            <CardDescription className="text-base text-center mb-6 text-blue-800 font-bold">
              CNH
            </CardDescription>

            <FormItem
              name="Categoria da CNH"
              description="Selecione a categoria da sua CNH"
            >
              <SelecaoCustomizada
                id="tipoCnh"
                name="tipoCnh"
                placeholder="Selecione a categoria"
                defaultValue={motorista.tipoCnh}
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

            <FormItem
              name="Data de Vencimento da CNH"
              description="Informe a data de vencimento da sua CNH"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                type="date"
                id="dataValidadeCnh"
                name="dataValidadeCnh"
                defaultValue={motorista.dataValidadeCnh}
                required
              />
            </FormItem>
          </CardContent>

          {/* ==================== FOOTER COM BOTÃO ==================== */}
          <CardFooter className="px-4 md:px-6 lg:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium text-blue-800 bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}