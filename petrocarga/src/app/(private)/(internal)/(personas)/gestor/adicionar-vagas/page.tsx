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
import { useVagaMutation } from '@/features/vaga/vagas/hooks/useVagaMutation';
import { ArrowLeft, ParkingSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import FormItem from '@/components/form/form-item';
import DiaSemana from '@/features/usuarios/(personas)/gestores/components/dia-semana/dia-semana';
import SelecaoCustomizada from '@/components/selecaoItem/selecao-customizada';
import CardMapEdit from '@/features/map/components/cardMapEdit';
import Link from 'next/link';
import {
  AreaVaga,
  OperacoesVaga,
  TipoVaga,
  VagaPayload,
} from '@/features/vaga/vagas/types/vaga2';

/**
 * @component Cadastro
 * @version 2.0.0
 *
 * @description Página de cadastro de novas vagas de estacionamento para gestores.
 * Formulário completo com validações, seleção de área, tipo e dias da semana.
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS (v2):
 * ----------------------------------------------------------------------------
 *
 * - useVagaMutation: Substitui useActionState + Server Action addVaga.
 *   O submit vira um handler client-side comum (onSubmit) que monta o
 *   VagaPayload a partir do FormData e chama "criar(payload)".
 * - loading / error: Vêm do hook useApi (via useVagaMutation) e substituem
 *   o "pending" e o "state" do useActionState.
 * - useEffect: Observa "error" para exibir toast de falha, já que o valor
 *   de erro é atualizado de forma assíncrona pelo hook.
 * - Sucesso: Tratado direto no handleSubmit, pois "criar" retorna a vaga
 *   criada (ou null em caso de erro). Em caso de sucesso, exibimos toast
 *   e redirecionamos para a listagem de vagas.
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - useVagaMutation: Hook de mutação (criar/atualizar/deletar)
 * - FormItem: Componente de campo com label e tooltip
 * - DiaSemana: Componente de seleção de dias/horários
 * - SelecaoCustomizada: Select estilizado
 * - /gestor/visualizar-vagas: Página de listagem (retorno)
 *
 * @example
 * // Uso em rota de gestor
 * <Cadastro />
 */

export default function Cadastro() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const router = useRouter();
  const { loading, error, criar, limparError } = useVagaMutation();

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
  const [useMap, setUseMap] = useState(true);

  const [geoState, setGeoState] = useState({
    latitudeInicio: -22.505,
    longitudeInicio: -43.178,
    latitudeFim: -22.505,
    longitudeFim: -43.178,
  });

  const handleGeoChange = (data: {
    latitudeInicio: number;
    longitudeInicio: number;
    latitudeFim: number;
    longitudeFim: number;
  }) => {
    setGeoState(data);
  };

  // ==================== FEEDBACK (TOAST) DE ERRO ====================
  useEffect(() => {
    if (error) {
      toast.error(error || 'Erro ao cadastrar vaga');
    }
  }, [error]);

  // --------------------------------------------------------------------------
  // SUBMIT
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    limparError();

    const formData = new FormData(e.currentTarget);

    const payload: VagaPayload = {
      endereco: {
        codigoPmp: formData.get('codigo') as string,
        logradouro: formData.get('logradouro') as string,
        bairro: formData.get('bairro') as string,
      },
      area: (formData.get('area') as string).toUpperCase() as AreaVaga,
      numeroEndereco: formData.get('numeroEndereco') as string,
      referenciaEndereco: formData.get('descricao') as string,
      latitudeInicio: Number(formData.get('latitudeInicio')),
      latitudeFim: Number(formData.get('latitudeFim')),
      longitudeInicio: Number(formData.get('longitudeInicio')),
      longitudeFim: Number(formData.get('longitudeFim')),
      TipoVaga: (formData.get('tipo') as string).toUpperCase() as TipoVaga,
      comprimento: Number(formData.get('comprimento')),
      operacoesVaga: JSON.parse(
        (formData.get('diaSemana') as string) ?? '[]',
      ) as OperacoesVaga[],
    };

    const vagaCriada = await criar(payload);

    if (vagaCriada) {
      toast.success('Vaga cadastrada com sucesso!');
      router.push('/gestor/visualizar-vagas');
    }
    // erro é tratado pelo useEffect acima, via estado "error" do hook
  };

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
          FORMULÁRIO (client-side, via useVagaMutation)
        -------------------------------------------------------------------- */}
        <form onSubmit={handleSubmit}>
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

            {tipo === 'perpendicular' && (
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
                />
              </FormItem>
            )}

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
                <CardMapEdit mode="create" onChange={handleGeoChange} />
              )}

              {/* ✍️ MANUAL (2 CAMPOS) */}
              {!useMap && (
                <div className="flex flex-col gap-2">
                  <Input
                    id="geoInicio"
                    placeholder="-23.55052, -46.633308"
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
              disabled={loading}
              className="w-full md:w-auto md:ml-auto rounded-sm px-6 md:px-10 py-2 md:py-2.5 text-sm md:text-base font-medium"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
