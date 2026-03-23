/**
 * @module utils/gestor/calendario/utils
 * @description Funções utilitárias para manipulação de datas e cores no calendário do gestor.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 * 
 * 1. toDateKey - Extrai apenas a data (YYYY-MM-DD) de uma string ISO
 * 2. dayStartISO - Cria timestamp ISO para o início do dia
 * 3. formatTime - Formata horário no formato HH:MM
 * 4. areaColors - Mapeamento de cores por área
 * 5. getColorByArea - Retorna cor baseada na área da vaga
 */

/**
 * @function toDateKey
 * @description Extrai a parte da data (YYYY-MM-DD) de uma string ISO.
 * 
 * @param iso - String ISO (ex: "2024-01-15T08:00:00.000Z")
 * @returns Data no formato YYYY-MM-DD
 * 
 * @example
 * ```ts
 * toDateKey("2024-01-15T08:00:00.000Z") // "2024-01-15"
 * ```
 */
export const toDateKey = (iso: string) => {
  return iso.split('T')[0];
};

/**
 * @function dayStartISO
 * @description Cria um timestamp ISO para o início do dia (00:00:00).
 * 
 * @param dateKey - Data no formato YYYY-MM-DD
 * @returns String ISO com horário 00:00:00
 * 
 * @example
 * ```ts
 * dayStartISO("2024-01-15") // "2024-01-15T00:00:00"
 * ```
 */
export const dayStartISO = (dateKey: string) => {
  return `${dateKey}T00:00:00`;
};

/**
 * @function formatTime
 * @description Formata uma data ISO para exibição de horário no formato HH:MM.
 * 
 * @param iso - String ISO (opcional)
 * @returns Horário formatado (ex: "08:30") ou string vazia se não fornecido
 * 
 * @example
 * ```ts
 * formatTime("2024-01-15T08:30:00.000Z") // "08:30"
 * formatTime() // ""
 * ```
 */
export const formatTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

/**
 * @constant areaColors
 * @description Mapeamento de cores para as diferentes áreas de vagas.
 * 
 * - VERMELHA: #ef4444 (vermelho)
 * - AMARELA: #facc15 (amarelo)
 * - AZUL: #3b82f6 (azul)
 * - BRANCA: #e5e7eb (cinza claro)
 * - DEFAULT: #6b7280 (cinza)
 */
export const areaColors: Record<string, string> = {
  VERMELHA: '#ef4444',
  AMARELA: '#facc15',
  AZUL: '#3b82f6',
  BRANCA: '#e5e7eb',
  DEFAULT: '#6b7280',
};

/**
 * @function getColorByArea
 * @description Retorna a cor correspondente à área da vaga.
 * 
 * @param area - Nome da área (ex: "VERMELHA", "AMARELA")
 * @returns Código hexadecimal da cor
 * 
 * @example
 * ```ts
 * getColorByArea("VERMELHA") // "#ef4444"
 * getColorByArea("ROXA") // "#6b7280" (fallback)
 * getColorByArea() // "#6b7280"
 * ```
 */
export function getColorByArea(area?: string) {
  if (!area) return areaColors.DEFAULT;
  return areaColors[area.toUpperCase()] ?? areaColors.DEFAULT;
}