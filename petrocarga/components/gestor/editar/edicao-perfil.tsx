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
import { atualizarGestor } from '@/lib/api/gestorApi';
import { CheckCircle, CircleAlert, UserIcon } from 'lucide-react';
import Form from 'next/form';
import { useActionState, useEffect } from 'react';
import FormItem from '@/components/form/form-item';
import { Gestor } from '@/lib/types/gestor';

interface EditarGestorProps {
  gestor: Gestor;
  onSuccess?: () => void;
}

/**
 * @component EditarGestor
 * @version 1.0.0
 * 
 * @description Formulário de edição de perfil para gestores.
 * Permite atualizar nome e telefone do gestor autenticado.
 * 
 * ----------------------------------------------------------------------------
 * 📋 CAMPOS EDITÁVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. Nome completo (obrigatório)
 * 2. Telefone (obrigatório, apenas números, 11 dígitos)
 * 
 * ----------------------------------------------------------------------------
 * 📋 CAMPOS NÃO EDITÁVEIS:
 * ----------------------------------------------------------------------------
 * 
 * - CPF (fixo)
 * - Email (fixo)
 * - Senha (não aparece no formulário)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useActionState: Gerencia estado da Server Action
 * - Wrapper assíncrono: Para compatibilidade com useActionState
 * - useEffect com timer: Redirecionamento suave após sucesso (250ms)
 * - Máscara de telefone: remove não números e limita 11 dígitos
 * - Hidden input: Envia ID do gestor sem exibir na UI
 * - TEMA EMERALD: Cores em tons de verde (emerald)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - atualizarGestor: Server Action de atualização
 * - FormItem: Campo com label e descrição
 * 
 * @example
 * ```tsx
 * <EditarGestor
 *   gestor={gestor}
 *   onSuccess={() => router.push('/gestor/perfil')}
 * />
 * ```
 * 
 * @see /src/lib/api/gestorApi.ts - Função atualizarGestor
 */

export default function EditarGestor({ gestor, onSuccess }: EditarGestorProps) {
  // ==================== SERVER ACTION ====================
  /**
   * Wrapper assíncrono para atualizarGestor
   * Permite uso com useActionState
   */
  const atualizar = async (prevState: unknown, formData: FormData) => {
    return atualizarGestor(formData);
  };

  const [state, atualizarGestorAction, pending] = useActionState(
    atualizar,
    null,
  );

  // ==================== EFEITO DE REDIRECIONAMENTO ====================
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
        <Form action={atualizarGestorAction}>
          
          {/* Campo oculto com ID do gestor */}
          <input type="hidden" name="id" value={gestor.id} />

          <CardContent className="p-4 md:p-6 lg:p-8">
            
            {/* ==================== MENSAGEM DE FEEDBACK ==================== */}
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
                  <span className="text-sm md:text-base">{state.message}</span>
                  {!state.error && (
                    <p className="text-green-700 text-sm mt-1">
                      Redirecionando para o perfil...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ==================== TÍTULO DA SEÇÃO ==================== */}
            <CardDescription className="text-base text-center mb-6 text-emerald-800 font-bold">
              Dados Pessoais
            </CardDescription>

            {/* ==================== CAMPO NOME ==================== */}
            <FormItem name="Nome" description="Insira seu nome completo.">
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="nome"
                name="nome"
                placeholder="João Alves da Silva"
                defaultValue={gestor.nome}
                required
              />
            </FormItem>

            {/* ==================== CAMPO TELEFONE (COM MÁSCARA) ==================== */}
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
                defaultValue={gestor.telefone}
                required
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, '');
                }}
              />
            </FormItem>
          </CardContent>

          {/* ==================== FOOTER COM BOTÃO ==================== */}
          <CardFooter className="px-4 md:px-6 lg:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium text-emerald-800 bg-emerald-200 hover:bg-emerald-300 focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {pending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </main>
  );
}