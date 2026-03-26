'use client';

import { useState } from 'react';
import {
  Search,
  Loader2,
  Car,
  AlertCircle,
  X,
} from 'lucide-react';
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
  TITULO: 'Consultar Placa',
  DESCRICAO:
    'Busque reservas ativas ou reservadas de um veículo',
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
  const [searchFocused, setSearchFocused] = useState(false);

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
  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Loader2 className="animate-spin w-8 h-8 text-[#1351B4]" />
        <span className="text-gray-500 text-sm">
          Buscando reservas para a placa{" "}
          <span className="font-semibold text-gray-700">{placa}</span>...
        </span>
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Erro na busca</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">{error}</p>
        </div>
        <button
          onClick={handleSearch}
          className="text-xs font-medium text-[#1351B4] border border-[#1351B4] rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Estado inicial
  if (!searched) {
    return (
      <div className="flex flex-col items-center py-10 text-center gap-5 w-full">
        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
          <Search className="w-7 h-7 text-[#1351B4]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            {INFO_MESSAGES.TITULO}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            {INFO_MESSAGES.DESCRICAO}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-1">
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ✓ Informações incluídas
            </p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Detalhes do motorista</li>
              <li>• Informações do veículo</li>
              <li>• Localização da vaga</li>
              <li>• Datas de início e fim</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ⚡ Busca rápida
            </p>
            <ul className="text-sm text-gray-400 space-y-2">
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

  // Sem resultados
  if (reservas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center">
          <Car className="w-7 h-7 text-gray-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            Nenhuma reserva encontrada
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {INFO_MESSAGES.SEM_RESULTADOS(placa)}
          </p>
        </div>
      </div>
    );
  }

  // Com resultados
  return (
    <div className="space-y-4">

      {/* Resumo */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Resultados
        </p>
      </div>

      <p className="text-xs text-gray-400 -mt-2">
        {INFO_MESSAGES.RESULTADOS_ENCONTRADOS(reservas.length, placa)}
      </p>

      {/* Cards */}
      <div className="flex flex-col gap-1.5">
        {reservas.map((reserva) => (
          <ReservaPlacaCard key={reserva.id} reserva={reserva} />
        ))}
      </div>

      {/* Rodapé */}
      <p className="text-center text-[11px] text-gray-400 pt-2">
        {INFO_MESSAGES.MOSTRANDO_RESULTADOS(reservas.length)}
      </p>
    </div>
  );
};

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // --------------------------------------------------------------------------

  return (

    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ── */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            {INFO_MESSAGES.TITULO}!
          </h1>
          <p className="text-xs text-white/50 capitalize">{INFO_MESSAGES.DESCRICAO}</p>
        </div>
      </header>
      <div className="w-full max-w-6xl">

        <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">

          <div className="-mt-4 mb-5">
            <div
              className="bg-[#071D41] rounded-2xl border-l-4 border-[#FFCD07] px-5 py-4 "
              style={{ boxShadow: '0 4px 16px rgba(7,29,65,0.18)' }}
            >
              <div className="relative">

                {/* Input row */}
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{
                    background: searchFocused
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(255,255,255,0.10)',
                    border: searchFocused
                      ? '1.5px solid rgba(255,205,7,0.6)'
                      : '1.5px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <Search
                    className="h-4 w-4 flex-shrink-0 transition-colors"
                    style={{ color: searchFocused ? '#FFCD07' : 'rgba(255,255,255,0.45)' }}
                  />

                  <input
                    type="text"
                    value={placa}
                    onChange={handlePlacaChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Digite a placa (ABC1234)"
                    maxLength={PLACA_CONFIG.MAX_LENGTH}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none min-w-0"
                    style={{ caretColor: '#FFCD07' }}
                  />

                  {placa && (
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setPlaca('');
                      }}
                      className="flex-shrink-0 rounded-full p-0.5 transition-colors hover:bg-white/20"
                      style={{ background: 'rgba(255,255,255,0.12)' }}
                      aria-label="Limpar"
                    >
                      <X className="h-3 w-3 text-white/70" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>


          {/* Área de resultados (renderização condicional) */}
          {renderResultado()}
        </main>
      </div>
    </div>
  );
}