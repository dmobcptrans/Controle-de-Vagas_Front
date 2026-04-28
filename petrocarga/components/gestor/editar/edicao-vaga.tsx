'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { atualizarVaga } from '@/lib/api/vagaApi';
import { CircleAlert } from 'lucide-react';
import Form from 'next/form';
import { useActionState, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FormItem from '@/components/form/form-item';
import DiaSemana from '@/components/gestor/dia-semana/dia-semana';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
import { Vaga } from '@/lib/types/vaga';
import CardMapEdit from '@/components/map/cardMapEdit';

/**
 * @component EditarVaga
 * @version 1.0.0
 *
 * @description Formulário de edição de vaga para gestores.
 * Permite atualizar todos os dados de uma vaga existente.
 *
 * ----------------------------------------------------------------------------
 * 📋 CAMPOS EDITÁVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. DADOS DE ENDEREÇO:
 *    - Código PMP
 *    - Logradouro (nome da rua)
 *    - Número Referência
 *    - Bairro
 *
 * 2. CARACTERÍSTICAS DA VAGA:
 *    - Status (Disponível/Indisponível)
 *    - Área (Vermelha, Amarela, Azul, Branca)
 *    - Tipo (Paralela, Perpendicular)
 *    - Comprimento (em metros)
 *
 * 3. GEORREFERENCIAMENTO:
 *    - Localização inicial (latitude, longitude)
 *    - Localização final (latitude, longitude)
 *
 * 4. DESCRIÇÃO:
 *    - Descrição/referências
 *
 * 5. OPERAÇÃO:
 *    - Dias da semana com horários (componente DiaSemana)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - useActionState: Gerencia estado da Server Action
 * - Wrapper assíncrono: Para compatibilidade com useActionState
 * - useEffect: Monitora resultado e exibe toast de feedback
 * - Hidden input: Envia ID da vaga sem exibir na UI
 * - Valores padrão: defaultValue preenche campos com dados existentes
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - atualizarVaga: Server Action de atualização
 * - FormItem: Campo com label e descrição
 * - DiaSemana: Seleção de dias e horários
 * - SelecaoCustomizada: Select estilizado
 *
 * @example
 * ```tsx
 * <EditarVaga vaga={vaga} />
 * ```
 *
 * @see /src/lib/api/vagaApi.ts - Função atualizarVaga
 */

export default function EditarVaga({ vaga }: { vaga: Vaga }) {
  // ==================== SERVER ACTION ====================
  const atualizar = async (prevState: unknown, formData: FormData) => {
    return atualizarVaga(formData);
  };

  const [state, atualizarVagaAction, pending] = useActionState(atualizar, null);
  const [useMap, setUseMap] = useState(true);
  const [geoState, setGeoState] = useState({
    latitudeInicio: vaga.latitudeInicio,
    longitudeInicio: vaga.longitudeInicio,
    latitudeFim: vaga.latitudeFim,
    longitudeFim: vaga.longitudeFim,
  });

  // ==================== FEEDBACK (TOAST) ====================
  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast.error(state.message || 'Erro ao atualizar vaga');
    } else {
      toast.success(state.message || 'Vaga atualizada com sucesso!');
    }
  }, [state]);

  const handleGeoChange = useCallback((data: {
  latitudeInicio: number;
  longitudeInicio: number;
  latitudeFim: number;
  longitudeFim: number;
}) => {
  setGeoState(data);
}, []); // sem dependências → referência estável

  return (
    <main className="container mx-auto px-4 py-4 md:py-8">
      <Card className="w-full max-w-5xl mx-auto">
        {/* ==================== FORMULÁRIO ==================== */}
        <Form action={atualizarVagaAction}>
          {/* Campo oculto com ID da vaga */}
          <input type="hidden" name="id" value={vaga.id} />

          <CardContent className="p-4 md:p-6 lg:p-8">
            {/* ==================== MENSAGEM DE ERRO ==================== */}
            {state?.error && (
              <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 mb-6 text-red-900">
                <CircleAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{state.message}</span>
              </div>
            )}

            {/* ==================== CAMPOS DO FORMULÁRIO ==================== */}

            {/* Código PMP */}
            <FormItem
              name="Código"
              description="Ponha o código PMP da rua. Exemplo: Md-1234"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="codigoPmp"
                name="codigoPmp"
                maxLength={30}
                placeholder="Md-1234"
                defaultValue={vaga.endereco.codigoPmp}
              />
            </FormItem>

            {/* Nome da rua */}
            <FormItem
              name="Nome da rua"
              description="Exemplo: Rua do Imperador"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="logradouro"
                name="logradouro"
                placeholder="Rua do Imperador"
                defaultValue={vaga.endereco.logradouro}
              />
            </FormItem>

            {/* Número Referência */}
            <FormItem
              name="Número Referência"
              description="Números de locais por onde passa a área da vaga. Exemplo: 90 ao 130"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="numeroEndereco"
                name="numeroEndereco"
                placeholder="Vaga 03"
                defaultValue={vaga.numeroEndereco}
              />
            </FormItem>

            {/* Status da vaga */}
            <FormItem
              name="Status"
              description="Disponivel ou Indisponível, a vaga"
            >
              <SelecaoCustomizada
                id="status"
                name="status"
                placeholder="Selecione o status"
                defaultValue={vaga.status.toLowerCase()}
                options={[
                  { value: 'disponivel', label: 'Disponivel' },
                  { value: 'indisponivel', label: 'Indisponível' },
                ]}
              />
            </FormItem>

            {/* Área */}
            <FormItem name="Área" description="Selecione a cor da área da vaga">
              <SelecaoCustomizada
                id="area"
                name="area"
                placeholder="Selecione a área"
                defaultValue={vaga.area.toLowerCase()}
                options={[
                  { value: 'vermelha', label: 'Vermelha' },
                  { value: 'amarela', label: 'Amarela' },
                  { value: 'azul', label: 'Azul' },
                  { value: 'branca', label: 'Branca' },
                ]}
              />
            </FormItem>

            {/* Tipo da Vaga */}
            <FormItem name="Tipo" description="Perpendicular ou Paralela à rua">
              <SelecaoCustomizada
                id="tipo"
                name="tipo"
                placeholder="Selecione o tipo"
                defaultValue={vaga.tipoVaga.toLowerCase()}
                options={[
                  { value: 'paralela', label: 'Paralela' },
                  { value: 'perpendicular', label: 'Perpendicular' },
                ]}
              />
            </FormItem>

            {/* Bairro */}
            <FormItem name="Bairro" description="Exemplo: Centro">
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="bairro"
                name="bairro"
                placeholder="Centro"
                defaultValue={vaga.endereco.bairro}
              />
            </FormItem>

            {/* Comprimento */}
            <FormItem
              name="Comprimento"
              description="Comprimento em metros da vaga"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="comprimento"
                name="comprimento"
                type="number"
                placeholder="10"
                step="0.1"
                min="0"
                defaultValue={vaga.comprimento}
              />
            </FormItem>

            {vaga.tipoVaga === 'PERPENDICULAR' && (
              <FormItem
                name="Quantidade"
                description="Número de vagas disponíveis"
              >
                <Input
                  className="rounded-sm border-gray-400 text-sm md:text-base"
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  placeholder="1"
                  step="1"
                  min="1"
                  defaultValue={vaga.quantidade}
                />
              </FormItem>
            )}

            {/* Descrição */}
            <FormItem
              name="Descrição"
              description="Coloque pontos de referência ou outras informações relevantes"
            >
              <Textarea
                id="descricao"
                name="descricao"
                className="min-h-[100px] md:min-h-[120px] rounded-sm border-gray-400 text-sm md:text-base resize-none"
                placeholder="Ex: Em frente à praça, próximo ao mercado..."
                defaultValue={vaga.referenciaEndereco}
              />
            </FormItem>

            {/* Localização da vaga */}
            <FormItem
              name="Localização da vaga"
              description="Defina pelo mapa ou manualmente (lat, lng)"
            >
              {/* 🔁 Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setUseMap(true)}
                  className={`px-3 py-1 rounded ${
                    useMap ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  Mapa
                </button>

                <button
                  type="button"
                  onClick={() => setUseMap(false)}
                  className={`px-3 py-1 rounded ${
                    !useMap ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  Manual
                </button>
              </div>

              {/* 🗺️ MAPA */}
              {useMap && (
                <CardMapEdit
                  defaultValue={{
                    latitudeInicio: vaga.latitudeInicio,
                    longitudeInicio: vaga.longitudeInicio,
                    latitudeFim: vaga.latitudeFim,
                    longitudeFim: vaga.longitudeFim,
                  }}
                  onChange={handleGeoChange}
                />
              )}

              {/* ✍️ MANUAL (2 CAMPOS) */}
              {!useMap && (
                <div className="flex flex-col gap-2">
                  <Input
                    id="geoInicio"
                    placeholder="-23.55052, -46.633308"
                    defaultValue={`${vaga.latitudeInicio}, ${vaga.longitudeInicio}`}
                    onChange={(e) => {
                      const [lat, lng] = e.target.value
                        .split(',')
                        .map((v) => v.trim());
                      setGeoState((prev) => ({
                        ...prev,
                        latitudeInicio: Number(lat) || prev.latitudeInicio,
                        longitudeInicio: Number(lng) || prev.longitudeInicio,
                      }));
                    }}
                  />

                  <Input
                    id="geoFim"
                    placeholder="-23.55052, -46.633308"
                    defaultValue={`${vaga.latitudeFim}, ${vaga.longitudeFim}`}
                    onChange={(e) => {
                      const [lat, lng] = e.target.value
                        .split(',')
                        .map((v) => v.trim());
                      setGeoState((prev) => ({
                        ...prev,
                        latitudeFim: Number(lat) || prev.latitudeFim,
                        longitudeFim: Number(lng) || prev.longitudeFim,
                      }));
                    }}
                  />
                </div>
              )}

              {/* 🔒 Hidden (backend continua igual) */}
              <input
                type="hidden"
                name="latitudeInicio"
                value={geoState.latitudeInicio}
              />
              <input
                type="hidden"
                name="longitudeInicio"
                value={geoState.longitudeInicio}
              />
              <input
                type="hidden"
                name="latitudeFim"
                value={geoState.latitudeFim}
              />
              <input
                type="hidden"
                name="longitudeFim"
                value={geoState.longitudeFim}
              />
            </FormItem>

            {/* Dias da semana (com horários pré-carregados) */}
            <FormItem
              name="Dias da semana"
              description="Selecione os dias em que a vaga estará disponível e defina os horários"
            >
              <DiaSemana name="diaSemana" operacoesVaga={vaga.operacoesVaga} />
            </FormItem>
          </CardContent>

          {/* ==================== FOOTER COM BOTÃO ==================== */}
          <CardFooter className="px-4 md:px-6 lg:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium"
            >
              {pending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </main>
  );
}
