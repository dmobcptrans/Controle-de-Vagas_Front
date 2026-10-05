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
import Form from 'next/form';
import { useEffect, useState } from 'react';
import FormItem from '@/components/form/form-item';
import { atualizarGestorPayload, gestorResponse } from '../../types/gestor';
import { useGestorMutation } from '../../hooks/useGestorMutation';

interface EditarGestorProps {
  gestor: gestorResponse;
  onSuccess?: () => void;
}

/**
 * @component EditarGestor
 * @version 2.0.0
 *
 * @description Formulário de edição de perfil do gestor (nome e telefone).
 * CPF e email não são editáveis.
 *
 * - `atualizar` do hook `useGestorMutation` retorna `true`/`false`;
 *   a mensagem de erro fica em `error`.
 * - O sucesso é controlado localmente (`sucesso`), e `onSuccess` é chamado
 *   250ms depois, para o usuário ver a confirmação.
 * - Não usa mais useActionState: `state` e `pending` viraram
 *   `error`/`sucesso` e `loading`.
 *
 * @example
 * <EditarGestor gestor={gestor} onSuccess={() => router.push('/gestor/perfil')} />
 */
export default function EditarGestor({ gestor, onSuccess }: EditarGestorProps) {
  const { atualizar, loading, error, limparError } = useGestorMutation();

  const [sucesso, setSucesso] = useState(false);

  // ==================== SUBMIT ====================

  const handleSubmit = async (formData: FormData) => {
    limparError();
    setSucesso(false);

    const telefone = (formData.get('telefone') as string)?.replace(/\D/g, '');

    const ok = await atualizar(gestor.id, {
      nome: formData.get('nome') as string,
      telefone,
    } as atualizarGestorPayload);

    if (ok) setSucesso(true);
  };

  // ==================== REDIRECIONAMENTO APÓS SUCESSO ====================
  useEffect(() => {
    if (!sucesso || !onSuccess) return;

    const timer = setTimeout(onSuccess, 250);
    return () => clearTimeout(timer);
  }, [sucesso, onSuccess]);

  return (
    <main className="container mx-auto px-4 py-4 md:py-8">
      <Card className="w-full max-w-5xl mx-auto">
        {/* ==================== HEADER (TEMA EMERALD) ==================== */}
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            Editar Perfil
          </CardTitle>
          <CardDescription className="text-base">
            Atualize seus dados cadastrais
          </CardDescription>
        </CardHeader>

        {/* ==================== FORMULÁRIO ==================== */}
        <Form action={handleSubmit}>
          <CardContent className="p-4 md:p-6 lg:p-8">
            {/* ==================== FEEDBACK ==================== */}
            {error && (
              <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 text-red-900 p-4 mb-6">
                <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{error}</span>
              </div>
            )}

            {sucesso && (
              <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 text-green-900 p-4 mb-6">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm md:text-base">
                    Perfil atualizado com sucesso!
                  </span>
                  {onSuccess && (
                    <p className="text-green-700 text-sm mt-1">
                      Redirecionando para o perfil...
                    </p>
                  )}
                </div>
              </div>
            )}

            <CardDescription className="text-base text-center mb-6 text-emerald-800 font-bold">
              Dados Pessoais
            </CardDescription>

            {/* ==================== NOME ==================== */}
            <FormItem name="Nome" description="Insira seu nome completo.">
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="nome"
                name="nome"
                placeholder="João Alves da Silva"
                defaultValue={gestor.usuario.nome}
                disabled={loading}
                required
              />
            </FormItem>

            {/* ==================== TELEFONE ==================== */}
            <FormItem
              name="Telefone"
              description="Digite seu número de telefone com DDD (apenas números)."
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="telefone"
                name="telefone"
                placeholder="22912345678"
                maxLength={11}
                type="text"
                inputMode="numeric"
                defaultValue={gestor.usuario.telefone}
                disabled={loading}
                required
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.value = target.value.replace(/\D/g, '');
                }}
              />
            </FormItem>
          </CardContent>

          {/* ==================== BOTÃO ==================== */}
          <CardFooter className="px-4 md:px-6 lg:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={loading || sucesso}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium text-emerald-800 bg-emerald-200 hover:bg-emerald-300 focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </main>
  );
}
