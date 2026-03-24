'use client';

import { useState } from 'react';
import {
  Search,
  Loader2,
  Car,
  AlertCircle,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getReservasPorPlaca } from '@/lib/api/reservaApi';
import { ReservaPlaca } from '@/lib/types/reservaPlaca';
import ReservaPlacaCard from '@/components/agente/cards/reservaPlaca-card';

/**
 * @component ConsultarPlacaPage
 * @version 1.0.0
 *
 * @description Página de consulta de reservas por placa de veículo para agentes.
 * Permite buscar todas as reservas associadas a uma placa específica.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. USUÁRIO DIGITA PLACA:
 *    - Caixa alta automática
 *    - Limite de 7 caracteres
 *
 * 2. VALIDAÇÃO:
 *    - Placa não pode estar vazia
 *    - Mínimo de caracteres
 *
 * 3. BUSCA NA API:
 *    - Chama endpoint de reservas por placa
 *    - Exibe loading state
 *    - Trata erros com mensagens amigáveis
 *
 * 4. EXIBIÇÃO DE RESULTADOS:
 *    - Card de resumo com contagem por status
 *    - Grid de cards individuais de reserva
 *    - Contagem total de resultados
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - FORMATAÇÃO AUTOMÁTICA: função formatarPlaca remove caracteres não
 *   alfanuméricos, aplica caixa alta e limita a 7 caracteres.
 *
 * - ESTADOS DE UI CONTROLADOS:
 *   - searched: controla se busca já foi realizada (exibe mensagens diferentes)
 *   - loading: feedback visual durante requisição
 *   - error: mensagens amigáveis para falhas
 *
 * - RENDERIZAÇÃO CONDICIONAL: função renderResultado centraliza toda
 *   lógica de exibição baseada nos estados (loading, erro, sem busca, sem resultados)
 *
 * - SHORTCUT DE TECLADO: Enter no input dispara busca (acessibilidade)
 *
 * - TIPAGEM FORTE: Usa tipo ReservaPlaca importado para garantir
 *   consistência com a API e outros componentes
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ReservaPlacaCard: Card individual para cada reserva encontrada
 * - /lib/api/reservaApi: Função getReservasPorPlaca
 * - /lib/types/reservaPlaca: Tipagem das reservas
 * - UI Components: Input, Button, Card (shadcn/ui)
 *
 * ----------------------------------------------------------------------------
 * ⚙️ VALIDAÇÕES IMPLEMENTADAS:
 * ----------------------------------------------------------------------------
 *
 * - Placa não vazia
 * - Caixa alta automática
 * - Limite de 7 caracteres
 * - Tratamento de erros da API
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - Feedback visual para todos os estados (loading, erro, vazio, sucesso)
 * - Formatação automática da placa em maiúsculas sem hífen
 * - Cards de informações antes da primeira busca
 * - Contador de reservas por status
 * - Design responsivo (mobile/desktop)
 * - Ícones contextuais para cada tipo de informação
 * - Shorcuts de teclado (Enter para buscar)
 *
 * @example
 * // Uso em rota de agente
 * <ConsultarPlacaPage />
 *
 * @see /src/lib/api/reservaApi.ts - Integração com backend
 * @see /src/components/agente/cards/reservaPlaca-card.tsx - Card de reserva
 * @see /src/lib/types/reservaPlaca.ts - Tipagem das reservas
 */

// ----------------------------------------------------------------------------
// CONSTANTES E CONFIGURAÇÕES
// ----------------------------------------------------------------------------

/**
 * Status possíveis para filtragem visual
 * Mantido como constante para consistência com a API
 */
const STATUS_RESERVA = [
  'ATIVA',
  'RESERVADA',
  'FINALIZADA',
  'CANCELADA',
] as const;

/**
 * Configurações de formatação da placa
 */
const PLACA_CONFIG = {
  MAX_LENGTH: 7,
} as const;

/**
 * Mensagens de erro padronizadas
 */
const ERROR_MESSAGES = {
  PLACA_VAZIA: 'Por favor, digite uma placa válida',
  BUSCA_FALHOU: 'Erro ao buscar reservas por placa',
} as const;

/**
 * Mensagens de informação/hint
 */
const INFO_MESSAGES = {
  TITULO: 'Consultar Reservas por Placa',
  DESCRICAO:
    'Busque todas as reservas ativas ou reservadas de um motorista através da placa do veículo',
  PLACA_HINT: 'Placa no formato AAA0000 ou AAA0A00',
  STATUS_HINT: 'Mostra reservas ativas e reservadas',
  LOCAL_HINT: 'Inclui localização da vaga',
  SEM_RESULTADOS: (placa: string) =>
    `Não foram encontradas reservas para a placa ${placa}. Verifique se a placa está correta e tente novamente.`,
  RESULTADOS_ENCONTRADOS: (count: number, placa: string) =>
    `Encontradas ${count} reserva${count !== 1 ? 's' : ''} para a placa ${placa}`,
  MOSTRANDO_RESULTADOS: (count: number) =>
    `Mostrando ${count} reserva${count !== 1 ? 's' : ''}`,
} as const;

/**
 * @function formatarPlaca
 * @description Formata uma string para o padrão de placa sem hífen
 *
 * Regras:
 * 1. Remove caracteres não alfanuméricos
 * 2. Converte para maiúsculas
 * 3. Limita a 7 caracteres
 *
 * @param value - String a ser formatada
 * @returns String formatada como placa (ex: ABC1234)
 *
 * @example
 * formatarPlaca('abc1234') // 'ABC1234'
 * formatarPlaca('abc-1234') // 'ABC1234'
 * formatarPlaca('abc') // 'ABC'
 */
function formatarPlaca(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, PLACA_CONFIG.MAX_LENGTH);
}

export default function ConsultarPlacaPage() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const [placa, setPlaca] = useState(''); // Placa digitada (formatada)
  const [reservas, setReservas] = useState<ReservaPlaca[]>([]); // Resultados da busca
  const [loading, setLoading] = useState(false); // Estado de loading
  const [error, setError] = useState<string | null>(null); // Mensagem de erro
  const [searched, setSearched] = useState(false); // Se busca já foi realizada

  // --------------------------------------------------------------------------
  // HANDLERS PRINCIPAIS
  // --------------------------------------------------------------------------

  /**
   * @function handleSearch
   * @description Executa a busca de reservas por placa
   *
   * Fluxo:
   * 1. Valida se placa não está vazia
   * 2. Ativa loading e limpa erros anteriores
   * 3. Marca que busca foi realizada (searched = true)
   * 4. Chama API de reservas
   * 5. Em caso de sucesso: atualiza estado com resultados
   * 6. Em caso de erro: exibe mensagem amigável
   * 7. Finalmente, desativa loading
   */
  const handleSearch = async () => {
    if (!placa.trim()) {
      setError(ERROR_MESSAGES.PLACA_VAZIA);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const resultado = await getReservasPorPlaca(placa);
      setReservas(resultado || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : ERROR_MESSAGES.BUSCA_FALHOU,
      );
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @function handleKeyDown
   * @description Permite disparar busca com tecla Enter (acessibilidade)
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleSearch();
  };

  /**
   * @function handlePlacaChange
   * @description Gerencia mudanças no input com formatação automática
   */
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(formatarPlaca(e.target.value));
  };

  // --------------------------------------------------------------------------
  // FUNÇÃO DE RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  /**
   * @function renderResultado
   * @description Renderiza o conteúdo da área de resultados baseado nos estados
   *
   * Estados possíveis:
   * 1. loading: Spinner animado
   * 2. error: Mensagem de erro com botão de tentar novamente
   * 3. !searched: Tela inicial com instruções
   * 4. reservas.length === 0: Mensagem de nenhum resultado
   * 5. reservas.length > 0: Grid com resultados
   */
  const renderResultado = () => {
    // Estado de loading
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 gap-2 text-center">
          <Loader2 className="animate-spin w-8 h-8 md:w-12 md:h-12 text-blue-600" />
          <span className="text-gray-600 text-sm md:text-base">
            Buscando reservas para a placa {placa}...
          </span>
        </div>
      );
    }

    // Estado de erro
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
            Erro na busca
          </h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
            {error}
          </p>
          <Button onClick={handleSearch} variant="outline" className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      );
    }

    // Estado inicial (antes da primeira busca)
    if (!searched) {
      return (
        <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-3">
            {INFO_MESSAGES.TITULO}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base mb-6">
            {INFO_MESSAGES.DESCRICAO}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">
                ✓ Informações incluídas
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detalhes do motorista</li>
                <li>• Informações do veículo</li>
                <li>• Localização da vaga</li>
                <li>• Datas de início e fim</li>
              </ul>
            </div>
            <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">
                ⚡ Busca rápida
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Caixa alta automática</li>
                <li>• Busca com Enter</li>
                <li>• Filtro por status</li>
                <li>• Resultados em tempo real</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Estado sem resultados
    if (reservas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
            Nenhuma reserva encontrada
          </h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
            {INFO_MESSAGES.SEM_RESULTADOS(placa)}
          </p>
        </div>
      );
    }

    // Estado com resultados
    return (
      <div className="space-y-6">
        {/* Card de resumo com contagem por status */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                Resultados da busca
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                {INFO_MESSAGES.RESULTADOS_ENCONTRADOS(reservas.length, placa)}
              </p>
            </div>

            {/* Badges de contagem por status */}
            <div className="flex flex-wrap gap-2">
              {STATUS_RESERVA.map((status) => {
                const count = reservas.filter(
                  (r) => r.status === status,
                ).length;
                if (count === 0) return null;

                return (
                  <div
                    key={status}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {count} {status.toLowerCase()}
                    {count !== 1 ? 's' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid de cards de reserva */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {reservas.map((reserva) => (
            <ReservaPlacaCard key={reserva.id} reserva={reserva} />
          ))}
        </div>

        {/* Contador de resultados */}
        <div className="text-center text-gray-500 text-sm">
          {INFO_MESSAGES.MOSTRANDO_RESULTADOS(reservas.length)}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // --------------------------------------------------------------------------

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {INFO_MESSAGES.TITULO}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {INFO_MESSAGES.DESCRICAO}
          </p>
        </div>

        {/* Card de busca */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            {/* Campo de busca */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label
                  htmlFor="placa"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Placa do Veículo
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="placa"
                    type="text"
                    placeholder="Digite a placa (ex: ABC1234)"
                    value={placa}
                    onChange={handlePlacaChange}
                    onKeyDown={handleKeyDown}
                    className="pl-10 text-lg font-mono uppercase"
                    maxLength={PLACA_CONFIG.MAX_LENGTH}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Botão de busca */}
              <Button
                onClick={handleSearch}
                disabled={loading || !placa.trim()}
                className="w-full sm:w-auto min-w-[140px] mt-2 sm:mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Reservas
                  </>
                )}
              </Button>
            </div>

            {/* Hints/Informações adicionais */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>{INFO_MESSAGES.PLACA_HINT}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{INFO_MESSAGES.STATUS_HINT}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{INFO_MESSAGES.LOCAL_HINT}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Área de resultados (renderização condicional) */}
        {renderResultado()}
      </div>
    </div>
  );
}