'use client';
import React, { useState, useTransition } from 'react';
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
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle,
  CircleAlert,
  Loader2,
  TruckIcon,
} from 'lucide-react';
import Form from 'next/form';
import FormItem from '@/components/form/form-item';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
import { addVeiculo } from '@/lib/api/veiculoApi';
import { useAuth } from '@/components/hooks/useAuth';
import Link from 'next/link';

/**
 * @component CadastroVeiculo
 * @version 1.0.0
 *
 * @description Página de cadastro de veículos para motoristas.
 * Formulário completo com validações para dados do veículo e proprietário (CPF/CNPJ).
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Usuário deve estar autenticado para cadastrar veículo
 *    - ID do usuário é anexado ao formulário automaticamente
 *
 * 2. FORMULÁRIO EM DUAS SEÇÕES:
 *
 *    a) DADOS DO VEÍCULO:
 *       - Placa (formato livre)
 *       - Marca
 *       - Modelo
 *       - Tipo (select com 5 opções)
 *
 *    b) DADOS DO PROPRIETÁRIO:
 *       - CPF (pessoa física, 11 dígitos)
 *       - CNPJ (pessoa jurídica, 14 dígitos)
 *       - Regra: APENAS UM dos campos deve ser preenchido
 *
 * 3. VALIDAÇÕES:
 *    - CPF: apenas números, máximo 11 dígitos
 *    - CNPJ: apenas números, máximo 14 dígitos
 *    - Todos os campos obrigatórios (exceto CPF/CNPJ, mas um deles é obrigatório)
 *
 * 4. ENVIO:
 *    - useTransition para controle de estado de loading
 *    - addVeiculo chama API de cadastro
 *    - Feedback com toast para sucesso/erro
 *
 * 5. PÓS-CADASTRO:
 *    - Redirecionamento via link "Voltar" (não automático)
 *    - Mensagem de sucesso em toast
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - useTransition: Gerencia estado de loading sem bloquear UI
 * - Regra de CPF/CNPJ: Exclusividade tratada no backend (API)
 * - Máscaras: Remoção automática de caracteres não numéricos
 * - Design rico: Gradientes, sombras, bordas arredondadas
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - SelecaoCustomizada: Select estilizado para tipo de veículo
 * - FormItem: Campo com label e descrição
 * - addVeiculo: API de cadastro
 * - /motorista/veiculos/meus-veiculos: Página de listagem (retorno)
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <CadastroVeiculo />
 * ```
 *
 * @see /src/lib/api/veiculoApi.ts - Função addVeiculo
 * @see /src/components/selecaoItem/selecao-customizada.tsx - Select customizado
 */

export default function CadastroVeiculo() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [tipo, setTipo] = useState('');

  // --------------------------------------------------------------------------
  // HANDLER DE SUBMIT
  // --------------------------------------------------------------------------

  /**
   * @function handleAction
   * @description Processa o envio do formulário
   *
   * Fluxo:
   * 1. Verifica autenticação do usuário
   * 2. Anexa usuarioId ao FormData
   * 3. Chama API addVeiculo
   * 4. Exibe toast de sucesso/erro
   *
   * @param formData - Dados do formulário
   */
  async function handleAction(formData: FormData) {
    startTransition(async () => {
      try {
        if (!user) {
          toast.error('Usuário não autenticado. Faça login novamente.');
          return;
        }

        formData.append('usuarioId', user.id);
        const result = await addVeiculo(formData);

        if (result?.error) {
          toast.error(result.message || 'Erro ao cadastrar veículo');
        } else {
          toast.success(result?.message || 'Veículo cadastrado com sucesso!');
        }
      } catch {
        toast.error('Erro inesperado ao cadastrar veículo.');
      }
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* --------------------------------------------------------------------
            LINK DE RETORNO
          -------------------------------------------------------------------- */}
          <div className="mb-6 md:mb-8">
            <Link
              href="/motorista/veiculos/meus-veiculos"
              className="inline-flex items-center gap-2 text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:bg-blue-50 rounded-lg px-3 py-2"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              Voltar para os meus veículos
            </Link>
          </div>

          {/* --------------------------------------------------------------------
            CARD PRINCIPAL
          -------------------------------------------------------------------- */}
          <Card className="w-full mx-auto shadow-2xl border-0 rounded-2xl overflow-hidden bg-white">
            {/* Header com gradiente */}
            <CardHeader className="px-4 py-8 md:px-12 md:py-12 space-y-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                <TruckIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>

              <div className="space-y-3">
                <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                  Cadastro de Veículo
                </CardTitle>
                <CardDescription className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                  Preencha os dados abaixo para adicionar um novo veículo à sua
                  frota
                </CardDescription>
              </div>
            </CardHeader>

            {/* Formulário */}
            <Form action={handleAction}>
              <CardContent className="p-6 md:p-10 lg:p-12 space-y-12">
                {/* --------------------------------------------------------------------
                  SEÇÃO 1: DADOS DO VEÍCULO
                -------------------------------------------------------------------- */}
                <div className="space-y-10">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-3">
                      <div className="w-8 h-0.5 bg-blue-600"></div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                        Dados do Veículo
                      </h3>
                      <div className="w-8 h-0.5 bg-blue-600"></div>
                    </div>
                    <CardDescription className="text-gray-600 text-base md:text-lg">
                      Informe as características principais do veículo
                    </CardDescription>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                    {/* Coluna esquerda */}
                    <div className="space-y-8">
                      <FormItem
                        name="Placa do Veículo"
                        description="Formato: ABC1D23. Exemplo: KLD2J19"
                      >
                        <Input
                          className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-12 text-base md:text-lg shadow-sm"
                          id="placa"
                          name="placa"
                          placeholder="KLD2J19"
                          required
                        />
                      </FormItem>

                      <FormItem
                        name="Marca do Veículo"
                        description="Exemplo: Ford, Volkswagen, Chevrolet"
                      >
                        <Input
                          className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-12 text-base md:text-lg shadow-sm"
                          id="marca"
                          name="marca"
                          placeholder="Ford"
                          required
                        />
                      </FormItem>
                    </div>

                    {/* Coluna direita */}
                    <div className="space-y-8">
                      <FormItem
                        name="Modelo do Veículo"
                        description="Exemplo: Fiesta, Gol, Onix"
                      >
                        <Input
                          className="w-full rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-12 text-base md:text-lg shadow-sm"
                          id="modelo"
                          name="modelo"
                          placeholder="Fiesta"
                          required
                        />
                      </FormItem>

                      <FormItem
                        name="Tipo do Veículo"
                        description="Selecione o tipo de veículo"
                      >
                        <SelecaoCustomizada
                          id="tipo"
                          name="tipo"
                          placeholder="Selecione o tipo"
                          value={tipo}
                          onChange={(val) => setTipo(val)}
                          options={[
                            {
                              value: 'AUTOMOVEL',
                              label: 'Carro - Até 5 metros',
                            },
                            {
                              value: 'CAMINHONETE',
                              label: 'Caminhonete - Até 6 metros',
                            },
                            { value: 'VUC', label: 'VUC - Até a 8 metros' },
                            {
                              value: 'CAMINHAO_MEDIO',
                              label: 'Caminhão Médio - 9 a 12 metros',
                            },
                            {
                              value: 'CAMINHAO_LONGO',
                              label: 'Caminhão Longo - 13 a 19 metros',
                            },
                          ]}
                        />
                      </FormItem>
                    </div>
                  </div>
                </div>

                {/* --------------------------------------------------------------------
                  SEÇÃO 2: DADOS DO PROPRIETÁRIO
                -------------------------------------------------------------------- */}
                <div className="space-y-10 pt-10 border-t-2 border-gray-300">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-3">
                      <div className="w-8 h-0.5 bg-blue-600"></div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                        Dados do Proprietário
                      </h3>
                      <div className="w-8 h-0.5 bg-blue-600"></div>
                    </div>
                    <CardDescription className="text-gray-600 text-base md:text-lg">
                      Informe apenas um dos campos abaixo
                    </CardDescription>
                  </div>

                  <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                      {/* Campo CPF */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <label className="font-semibold text-gray-800">
                            CPF do Proprietário
                          </label>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Para pessoa física. Apenas números. Exemplo:
                          12345678900
                        </p>
                        <Input
                          className="w-full rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-12 text-lg md:text-xl shadow-sm px-6"
                          id="cpfProprietario"
                          name="cpfProprietario"
                          placeholder="12345678900"
                          maxLength={11}
                          inputMode="numeric"
                          value={cpf}
                          onChange={(e) =>
                            setCpf(
                              e.target.value.replace(/\D/g, '').slice(0, 11),
                            )
                          }
                        />
                      </div>

                      {/* Campo CNPJ */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          <label className="font-semibold text-gray-800">
                            CNPJ do Proprietário
                          </label>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Para pessoa jurídica. Apenas números. Exemplo:
                          12345678000190
                        </p>
                        <Input
                          className="w-full rounded-xl border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-12 text-lg md:text-xl shadow-sm px-6"
                          id="cnpjProprietario"
                          name="cnpjProprietario"
                          placeholder="12345678000190"
                          maxLength={14}
                          inputMode="numeric"
                          value={cnpj}
                          onChange={(e) =>
                            setCnpj(
                              e.target.value.replace(/\D/g, '').slice(0, 14),
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Divisor "OU" (desktop) */}
                    <div className="hidden lg:flex items-center justify-center my-8">
                      <div className="relative w-full max-w-md">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-6 font-semibold text-gray-500">
                            OU
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card de aviso importante */}
                    <div className="mt-10">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
                              <CircleAlert className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h4 className="text-xl md:text-2xl font-bold text-blue-800 mb-3">
                              Atenção Importante!
                            </h4>
                            <p className="text-lg md:text-xl text-blue-700 font-semibold">
                              Preencha{' '}
                              <span className="underline decoration-2">
                                APENAS UM
                              </span>{' '}
                              dos campos acima
                            </p>
                            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                <span className="text-blue-700 font-medium">
                                  CPF para pessoa física
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                                <span className="text-indigo-700 font-medium">
                                  CNPJ para pessoa jurídica
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Footer com botão de submit */}
              <CardFooter className="px-6 md:px-10 lg:px-12 pb-10 md:pb-12 pt-8 md:pt-10 border-t-2 border-gray-300 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8">
                  <div className="text-center lg:text-left">
                    <p className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                      Todos os campos são obrigatórios
                    </p>
                    <p className="text-sm md:text-base text-gray-600">
                      Exceto CPF/CNPJ - preencha apenas um deles conforme o caso
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl px-8 md:px-10 py-3 md:py-4 text-lg md:text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] min-w-[220px]"
                    >
                      {isPending ? (
                        <span className="flex items-center gap-3 justify-center">
                          <Loader2 className="animate-spin h-6 w-6 text-white" />
                          <span className="text-lg md:text-xl">
                            Cadastrando...
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-3 justify-center">
                          <CheckCircle className="w-6 h-6" />
                          Cadastrar Veículo
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Form>
          </Card>
        </div>
      </div>
    </main>
  );
}
