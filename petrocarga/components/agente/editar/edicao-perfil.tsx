'use client';

import { Agente } from '@/lib/types/agente';
import { useActionState, useEffect, useState } from 'react';
import { atualizarAgente } from '@/lib/api/agenteApi';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, CircleAlert, UserIcon } from 'lucide-react';
import Form from 'next/form';
import FormItem from '@/components/form/form-item';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditarAgenteProps {
  agente: Agente;
  onSuccess?: () => void;
}

/**
 * @component EditarAgente
 * @version 1.0.0
 * 
 * @description Formulário de edição de perfil para agentes.
 * Permite atualizar nome e telefone do agente autenticado.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. RECEBE DADOS DO AGENTE:
 *    - agente: objeto completo do agente (via props)
 *    - onSuccess: callback opcional após atualização bem-sucedida
 * 
 * 2. ESTADOS LOCAIS:
 *    - telefone: controlado para aplicar máscara
 *    - state: resultado da Server Action (useActionState)
 *    - pending: estado de loading durante envio
 * 
 * 3. FORMULÁRIO:
 *    - Campo nome (pré-preenchido com valor atual)
 *    - Campo telefone (com máscara e validação)
 *    - Hidden input com ID do usuário
 * 
 * 4. SUBMIT:
 *    - Server Action atualizarAgente via useActionState
 *    - Validação de telefone (apenas números)
 *    - Feedback visual durante envio
 * 
 * 5. PÓS-SUBMIT:
 *    - Exibe mensagem de sucesso/erro
 *    - Se sucesso e onSuccess existir, redireciona após 250ms
 *    - Mensagem adicional "Redirecionando para o perfil..."
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useActionState: Gerencia estado da Server Action
 * - useEffect com timer: Redirecionamento suave após sucesso
 * - Máscara de telefone: remove não números e limita 11 dígitos
 * - Hidden input: Envia ID do usuário sem exibir na UI
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - atualizarAgente: Server Action de atualização
 * - FormItem: Campo com label e descrição
 * - /agente/perfil: Página de destino após sucesso
 * 
 * @example
 * ```tsx
 * <EditarAgente 
 *   agente={agente} 
 *   onSuccess={() => router.push('/agente/perfil')}
 * />
 * ```
 * 
 * @see /src/lib/api/agenteApi.ts - Função atualizarAgente
 */

export default function EditarAgente({ agente, onSuccess }: EditarAgenteProps) {
// --------------------------------------------------------------------------
// HOOKS E ESTADOS
// --------------------------------------------------------------------------

  /**
   * useActionState gerencia o estado da Server Action de atualização.
   * 
   * @param action - Função assíncrona que processa o formulário
   * @param initialState - Estado inicial (null)
   * 
   * @returns [state, action, pending]
   * - state: Resultado da Server Action { error?: boolean, message?: string, valores?: any }
   * - atualizarAgenteAction: Função de submit (envolvida pelo useActionState)
   * - pending: Estado de carregamento durante envio (boolean)
   * 
   * 🧠 POR QUE UM WRAPPER ASSÍNCRONO?
   * 
   * O wrapper assíncrono é usado para:
   * 1. EXPLICITUDE: Deixa claro os parâmetros (_prevState, formData)
   * 2. PREPARAÇÃO: _prevState pode ser usado para lógicas futuras (retry, histórico)
   * 3. TIPAGEM: Parâmetros explicitamente tipados (unknown, FormData)
   * 
   * @example
   * ```tsx
   * <Form action={atualizarAgenteAction}>
   *   {/* campos do formulário *\/}
   * </Form>
   * ```
   */
  const [state, atualizarAgenteAction, pending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      // _prevState: estado anterior (útil para tentativas futuras)
      // formData: dados do formulário enviado
      return await atualizarAgente(formData);
    },
    null,
  );
  
  const [telefone, setTelefone] = useState(agente.usuario.telefone);

  // --------------------------------------------------------------------------
  // EFEITO DE REDIRECIONAMENTO
  // --------------------------------------------------------------------------
  
  useEffect(() => {
    // Se houve sucesso e existe callback de sucesso
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
        
        {/* Header do card */}
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

        {/* Formulário (Server Action) */}
        <Form action={atualizarAgenteAction}>
          
          {/* Campo oculto com ID do usuário */}
          <input type="hidden" name="id" value={agente.usuario.id} />

          <CardContent className="p-4 md:p-6 lg:p-8">
            
            {/* Mensagem de feedback da API */}
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
                  {/* Mensagem adicional de redirecionamento */}
                  {!state.error && (
                    <p className="text-green-700 text-sm mt-1">
                      Redirecionando para o perfil...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Título da seção */}
            <CardDescription className="text-base text-center mb-6 text-blue-800 font-bold">
              Seus Dados
            </CardDescription>

            {/* Campo Nome */}
            <FormItem
              name="Nome"
              description="Insira o nome completo do agente."
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="nome"
                name="nome"
                placeholder="Ex.: Eduardo Dantas"
                defaultValue={agente.usuario.nome}
                required
              />
            </FormItem>

            {/* Campo Telefone (com máscara) */}
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
                  setTelefone(e.target.value.replace(/\D/g, ''))
                }
                required
              />
            </FormItem>
          </CardContent>

          {/* Footer com botão de submit */}
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