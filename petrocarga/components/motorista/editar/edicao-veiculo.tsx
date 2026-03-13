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
import { atualizarVeiculo } from '@/lib/api/veiculoApi';
import { CircleAlert, TruckIcon } from 'lucide-react';
import Form from 'next/form';
import { useActionState } from 'react';
import FormItem from '@/components/form/form-item';
import { Veiculo } from '@/lib/types/veiculo';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';

export default function EditarVeiculo({ veiculo }: { veiculo: Veiculo }) {
  // Wrapper para passar o token na action
  const atualizarComToken = async (prevState: unknown, formData: FormData) => {
    return atualizarVeiculo(formData);
  };

  const [state, atualizarVeiculoAction, pending] = useActionState(
    atualizarComToken,
    null,
  );

  return (
    <main className="container mx-auto px-4 py-4 md:py-8">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TruckIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Edição de Veículo
          </CardTitle>
          <CardDescription className="text-base">
            Altere os dados para editar as Informações do veículo.
          </CardDescription>
        </CardHeader>
        <Form action={atualizarVeiculoAction}>
          <CardContent className="p-4 md:p-6 lg:p-8">
            {/* Mensagem de erro */}
            {state?.error && (
              <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 mb-6 text-red-900">
                <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{state.message}</span>
              </div>
            )}

            <CardDescription className="text-base text-center mb-6 text-blue-800 font-bold">
              Primeiro, cheque os dados do veículo
            </CardDescription>

            {/* Placa */}
            <FormItem
              name="Placa do Veículo"
              description="Digite a placa do veículo no formato ABC1D23. Exemplo: KLD2J19"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="placa"
                name="placa"
                placeholder="KLD2J19"
                required
              />
            </FormItem>

            {/* Marca */}
            <FormItem
              name="Marca do Veículo"
              description="Insira a marca do veículo. Exemplo: Ford, Volkswagen, Chevrolet"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="marca"
                name="marca"
                placeholder="Ford"
                required
              />
            </FormItem>

            {/* Modelo */}
            <FormItem
              name="Modelo do Veículo"
              description="Ponha o modelo do veículo. Exemplo: Fiesta, Gol, Onix"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="modelo"
                name="modelo"
                placeholder="Fiesta"
                required
              />
            </FormItem>

            {/* Tipo do Veículo */}
            <FormItem
              name="Tipo do Veículo"
              description="Selecione o tipo do veículo"
            >
              <SelecaoCustomizada
                id="tipo"
                name="tipo"
                placeholder="Selecione o tipo"
                options={[
                  { value: 'AUTOMOVEL', label: 'Carro - Até 5 metros' },
                  { value: 'VUC', label: 'VUC - 6 a 7 metros' },
                  { value: 'CAMINHONETA', label: 'Caminhoneta - Até 8 metros' },
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

            <CardDescription className="text-base text-center mb-6 text-blue-800 font-bold">
              Se houver necessidade, altere apenas um dos campos com os novos
              dados do proprietário do veículo, e apague o outro.
            </CardDescription>

            {/* CPF do Proprietário */}
            <FormItem
              name="CPF do Proprietário"
              description="Insira o CPF (apenas números). Exemplo: 12345678900"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="cpf"
                name="cpf"
                placeholder="12345678900"
                maxLength={11}
                type="text"
                inputMode="numeric"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, ''); // Remove tudo que não é número
                }}
              />
            </FormItem>

            {/* CNPJ do Proprietário */}
            <FormItem
              name="CNPJ do Proprietário"
              description="Insira o CNPJ (apenas números). Exemplo: 12345678000190"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="cpf"
                name="cpf"
                placeholder="12345678000190"
                maxLength={14}
                type="text"
                inputMode="numeric"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, ''); // Remove tudo que não é número
                }}
              />
            </FormItem>
          </CardContent>

          {/* Footer com botão */}
          <CardFooter className="px-4 md:px-6 lg:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium text-blue-800 bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </main>
  );
}
