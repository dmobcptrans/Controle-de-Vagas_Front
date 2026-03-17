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
import { Textarea } from '@/components/ui/textarea';
import { addVaga } from '@/lib/api/vagaApi';
import { ArrowLeft, ParkingSquare } from 'lucide-react';
import Form from 'next/form';
import { useActionState, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FormItem from '../../../components/form/form-item';
import DiaSemana from '../../../components/gestor/dia-semana/dia-semana';
import SelecaoCustomizada from '../../../components/selecaoItem/selecao-customizada';
import Link from 'next/link';

/**
 * @component Cadastro
 * @version 1.0.0
 *
 * @description Página de cadastro de novas vagas de estacionamento para gestores.
 * Formulário completo com validações, seleção de área, tipo e dias da semana.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ACESSO:
 *    - Acesso restrito a gestores (rota protegida)
 *    - Link de retorno para lista de vagas (/gestor/visualizar-vagas)
 *
 * 2. PREENCHIMENTO DO FORMULÁRIO (12 CAMPOS):
 *    a) Código PMP (ex: Md-1234)
 *    b) Logradouro (nome da rua)
 *    c) Número referência (ex: 90 ao 130)
 *    d) Área (seleção: vermelha, amarela, azul, branca)
 *    e) Tipo (seleção: paralela, perpendicular)
 *    f) Bairro
 *    g) Comprimento (metros, número decimal)
 *    h) Descrição (textarea com pontos de referência)
 *    i) Localização inicial (latitude, longitude)
 *    j) Localização final (latitude, longitude)
 *    k) Dias da semana (componente DiaSemana com horários)
 *
 * 3. VALIDAÇÕES:
 *    - Código: máximo 30 caracteres
 *    - Comprimento: número positivo (step="0.1", min="0")
 *    - Campos obrigatórios via HTML required (quando aplicável)
 *    - Seleções obrigatórias (área, tipo, dias)
 *
 * 4. ENVIO:
 *    - Server Action addVaga via useActionState
 *    - Feedback com toast (sucesso/erro)
 *    - Loading state durante envio
 *    - Botão desabilitado durante processamento
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - useState (controle de selects área/tipo)
 *   - useActionState (Server Actions)
 *   - useEffect (feedback com toast)
 *   - Interatividade (seleções, textarea)
 *
 * - SEPARAÇÃO DE COMPONENTES:
 *   - FormItem: Wrapper reutilizável com label e tooltip
 *   - SelecaoCustomizada: Select estilizado
 *   - DiaSemana: Componente complexo de seleção de dias/horários
 *
 * - FEEDBACK COM TOAST:
 *   - useEffect monitora state da Server Action
 *   - Toast de sucesso com mensagem da API
 *   - Toast de erro com mensagem específica
 *
 * - LAYOUT ORGANIZADO:
 *   - Grid implícito (empilhamento vertical)
 *   - Espaçamento consistente (space-y-4)
 *   - Padding responsivo
 *
 * - TIPOS DE INPUT:
 *   - text: campos comuns
 *   - number: comprimento (com step e min)
 *   - textarea: descrição longa
 *   - select: área e tipo (via componente)
 *   - custom: dias da semana (DiaSemana)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - addVaga: Server Action de cadastro (lib/api/vagaApi)
 * - FormItem: Componente de campo com label e tooltip
 * - DiaSemana: Componente de seleção de dias/horários
 * - SelecaoCustomizada: Select estilizado
 * - /gestor/visualizar-vagas: Página de listagem (retorno)
 *
 * ----------------------------------------------------------------------------
 * ⚙️ CAMPOS DO FORMULÁRIO:
 * ----------------------------------------------------------------------------
 *
 * 1. CÓDIGO (codigo)
 *    - Identificador PMP da rua
 *    - Exemplo: "Md-1234"
 *    - Máx: 30 caracteres
 *
 * 2. LOGRADOURO (logradouro)
 *    - Nome da rua/avenida
 *    - Exemplo: "Rua do Imperador"
 *
 * 3. NÚMERO REFERÊNCIA (numeroEndereco)
 *    - Faixa de números da vaga
 *    - Exemplo: "90 ao 130"
 *
 * 4. ÁREA (area)
 *    - Cor da área (vermelha, amarela, azul, branca)
 *    - Seleção obrigatória
 *
 * 5. TIPO (tipo)
 *    - Orientação da vaga (paralela, perpendicular)
 *    - Seleção obrigatória
 *
 * 6. BAIRRO (bairro)
 *    - Exemplo: "Centro"
 *
 * 7. COMPRIMENTO (comprimento)
 *    - Em metros, decimal
 *    - Exemplo: "10" (para 10 metros)
 *
 * 8. DESCRIÇÃO (descricao)
 *    - Pontos de referência, informações adicionais
 *    - Textarea com altura mínima
 *
 * 9. LOCALIZAÇÃO INICIAL (localizacao-inicio)
 *    - Latitude e longitude do início
 *    - Formato: "-23.55052, -46.633308"
 *
 * 10. LOCALIZAÇÃO FINAL (localizacao-fim)
 *     - Latitude e longitude do fim
 *     - Formato: "-23.55052, -46.633308"
 *
 * 11. DIAS DA SEMANA (diaSemana)
 *     - Seleção de dias e horários
 *     - Componente complexo com múltiplos campos
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - HEADER:
 *   - Ícone ParkingSquare gradiente
 *   - Título com gradiente "Cadastro de Vaga"
 *   - Descrição clara
 *   - Link "Voltar" com ArrowLeft
 *
 * - CARD PRINCIPAL:
 *   - Sombra suave (shadow-lg)
 *   - Bordas arredondadas
 *   - Fundo branco
 *
 * - CAMPOS:
 *   - Todos com FormItem (label + descrição)
 *   - Ícone de informação no hover
 *   - Border-radius consistente (rounded-sm)
 *   - Padding responsivo
 *
 * - FORMULÁRIO:
 *   - Espaçamento vertical consistente
 *   - Scroll suave em mobile
 *   - Botão de submit alinhado à direita (md:ml-auto)
 *
 * - RESPONSIVIDADE:
 *   - Mobile: padding 4, botão full width
 *   - Tablet/Desktop: padding maior, botão automático
 *   - Textarea com altura adaptativa
 *
 * @example
 * // Uso em rota de gestor
 * <Cadastro />
 *
 * @see /src/lib/api/vagaApi.ts - Server Action addVaga
 * @see /src/components/gestor/dia-semana/dia-semana.tsx - Seleção de dias
 * @see /src/components/selecaoItem/selecao-customizada.tsx - Select customizado
 */

export default function Cadastro() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  /**
   * useActionState gerencia:
   * - state: Resultado da Server Action { error?: boolean, message?: string }
   * - addVagaAction: Função de submit (wrapper assíncrono que chama addVaga)
   * - pending: Estado de carregamento durante envio
   *
   * O wrapper assíncrono permite:
   * - Acesso ao estado anterior (_prevState) para lógicas futuras
   * - Pré-processamento dos dados antes do envio
   * - Tipagem explícita dos parâmetros
   */
  const [state, addVagaAction, pending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      return await addVaga(formData);
    },
    null,
  );

  /**
   * Estados locais para selects controlados
   * - area: Cor da área selecionada (vermelha, amarela, azul, branca)
   * - tipo: Orientação da vaga (paralela, perpendicular)
   *
   * Necessários para o componente SelecaoCustomizada
   * que é controlado (value/onChange)
   */
  const [area, setArea] = useState('');
  const [tipo, setTipo] = useState('');

  // --------------------------------------------------------------------------
  // EFEITO DE FEEDBACK (TOAST)
  // --------------------------------------------------------------------------

  /**
   * @effect Monitora o resultado da Server Action
   *
   * Dispara toast notifications baseado no estado:
   * - state.error true → toast.error com mensagem
   * - state.error false → toast.success com mensagem
   *
   * Executa sempre que 'state' muda (após submit)
   */
  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast.error(state.message || 'Erro ao cadastrar vaga');
    } else {
      toast.success(state.message || 'Vaga cadastrada com sucesso!');
    }
  }, [state]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <main className="container mx-auto px-4 py-4 md:py-8">
      {/* Card principal do formulário */}
      <Card className="w-full max-w-5xl mx-auto">
        {/* --------------------------------------------------------------------
          HEADER DO CARD
        -------------------------------------------------------------------- */}
        <CardHeader className="space-y-3 text-center pb-6">
          {/* Ícone principal */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ParkingSquare className="w-8 h-8 text-white" />
          </div>

          {/* Título com gradiente */}
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Cadastro de Vaga
          </CardTitle>

          {/* Descrição */}
          <CardDescription className="text-base">
            Forneça os dados para adicionar uma nova vaga.
          </CardDescription>

          {/* Link de retorno para lista de vagas */}
          <div className="flex justify-start pt-2">
            <Link
              href="/gestor/visualizar-vagas"
              className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para visualizar vagas
            </Link>
          </div>
        </CardHeader>

        {/* --------------------------------------------------------------------
          FORMULÁRIO (Server Action)
        -------------------------------------------------------------------- */}
        <Form action={addVagaAction}>
          <CardContent className="p-4 md:p-6 lg:p-8 space-y-4">
            {/* Campo 1: Código PMP */}
            <FormItem
              name="Código"
              description="Ponha o código PMP da rua. Exemplo: Md-1234"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="codigo"
                name="codigo"
                maxLength={30}
                placeholder="Md-1234"
              />
            </FormItem>

            {/* Campo 2: Logradouro (nome da rua) */}
            <FormItem
              name="Nome da rua"
              description="Exemplo: Rua do Imperador"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="logradouro"
                name="logradouro"
                placeholder="Rua do Imperador"
              />
            </FormItem>

            {/* Campo 3: Número referência (faixa) */}
            <FormItem
              name="Número Referência"
              description="Números de locais por onde passa a área da vaga. Exemplo: 90 ao 130"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="numeroEndereco"
                name="numeroEndereco"
                placeholder="90 ao 130"
              />
            </FormItem>

            {/* Campo 4: Área (select customizado) */}
            <FormItem name="Área" description="Selecione a cor da área da vaga">
              <SelecaoCustomizada
                id="area"
                name="area"
                placeholder="Selecione a área"
                value={area}
                onChange={(val) => setArea(val)}
                options={[
                  { value: 'vermelha', label: 'Vermelha' },
                  { value: 'amarela', label: 'Amarela' },
                  { value: 'azul', label: 'Azul' },
                  { value: 'branca', label: 'Branca' },
                ]}
              />
            </FormItem>

            {/* Campo 5: Tipo (orientação) */}
            <FormItem name="Tipo" description="Perpendicular ou Paralela à rua">
              <SelecaoCustomizada
                id="tipo"
                name="tipo"
                placeholder="Selecione o tipo"
                value={tipo}
                onChange={(val) => setTipo(val)}
                options={[
                  { value: 'paralela', label: 'Paralela' },
                  { value: 'perpendicular', label: 'Perpendicular' },
                ]}
              />
            </FormItem>

            {/* Campo 6: Bairro */}
            <FormItem name="Bairro" description="Exemplo: Centro">
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="bairro"
                name="bairro"
                placeholder="Centro"
              />
            </FormItem>

            {/* Campo 7: Comprimento (em metros) */}
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
              />
            </FormItem>

            {/* Campo 8: Descrição (textarea) */}
            <FormItem
              name="Descrição"
              description="Coloque pontos de referência ou outras informações relevantes"
            >
              <Textarea
                id="descricao"
                name="descricao"
                className="min-h-[100px] md:min-h-[120px] rounded-sm border-gray-400 text-sm md:text-base resize-none"
                placeholder="Ex: Em frente à praça, próximo ao mercado..."
              />
            </FormItem>

            {/* Campo 9: Localização inicial (lat/long) */}
            <FormItem
              name="Localização inicial"
              description="Latitude e Longitude do início da vaga. Exemplo: -23.55052, -46.633308"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="localizacao-inicio"
                name="localizacao-inicio"
                placeholder="-23.55052, -46.633308"
              />
            </FormItem>

            {/* Campo 10: Localização final (lat/long) */}
            <FormItem
              name="Localização final"
              description="Latitude e Longitude do fim da vaga. Exemplo: -23.55052, -46.633308"
            >
              <Input
                className="rounded-sm border-gray-400 text-sm md:text-base"
                id="localizacao-fim"
                name="localizacao-fim"
                placeholder="-23.55052, -46.633308"
              />
            </FormItem>

            {/* Campo 11: Dias da semana (componente complexo) */}
            <FormItem
              name="Dias da semana"
              description="Selecione os dias em que a vaga estará disponível e defina os horários"
            >
              <DiaSemana name="diaSemana" />
            </FormItem>
          </CardContent>

          {/* Footer com botão de submit */}
          <CardFooter className="px-4 md:px-6 lg:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium"
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </main>
  );
}
