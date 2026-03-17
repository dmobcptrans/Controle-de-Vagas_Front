'use client';

import { clientApi } from '../clientApi';
import { DashboardKPIs, DashboardSummary } from '../types/dashboard';

/**
 * @module dashboardApi
 * @description Módulo de API para relatórios e métricas do dashboard.
 * Fornece funções para buscar dados resumidos e KPIs do sistema.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. RelatorioSumario - Dados resumidos do dashboard
 * 2. RelatorioKpis - Indicadores-chave de performance
 *
 * ----------------------------------------------------------------------------
 * 🔗 TIPOS RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - DashboardSummary: Dados resumidos (tipos de veículo, bairros, rotas, etc.)
 * - DashboardKPIs: Indicadores (vagas, reservas, taxas, etc.)
 *
 * ----------------------------------------------------------------------------
 * 📊 FILTRO POR DATA:
 * ----------------------------------------------------------------------------
 *
 * Ambas as funções aceitam parâmetros opcionais de data:
 * - startDate: Data inicial no formato ISO (YYYY-MM-DD)
 * - endDate: Data final no formato ISO (YYYY-MM-DD)
 *
 * Se não informados, retornam dados de todo o período disponível.
 */

/**
 * @function RelatorioSumario
 * @description Busca dados resumidos do dashboard.
 *
 * Retorna informações consolidadas incluindo:
 * - Tipos de veículos mais utilizados
 * - Estatísticas por bairro
 * - Rotas mais frequentes
 * - Vagas mais utilizadas
 * - Estatísticas de tempo de permanência
 *
 * @param startDate - Data inicial (opcional, formato ISO)
 * @param endDate - Data final (opcional, formato ISO)
 * @returns Promise<DashboardSummary>
 *
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * // Buscar dados sem filtro de data
 * const summary = await RelatorioSumario();
 *
 * // Buscar dados de um período específico
 * const summaryFiltrado = await RelatorioSumario(
 *   '2024-01-01',
 *   '2024-01-31'
 * );
 *
 * console.log(summary.vehicleTypes); // Tipos de veículo
 * console.log(summary.districts); // Estatísticas por bairro
 * console.log(summary.stayDurationStats); // Tempo de permanência
 * ```
 */
export async function RelatorioSumario(
  startDate?: string,
  endDate?: string,
): Promise<DashboardSummary> {
  // Construir query string com filtros de data
  const params = new URLSearchParams();

  if (startDate) {
    params.append('startDate', startDate);
  }

  if (endDate) {
    params.append('endDate', endDate);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';

  // Requisição à API
  const res = await clientApi(
    `/petrocarga/api/v1/dashboard/summary${queryString}`,
    {
      method: 'GET',
    },
  );

  if (!res.ok) {
    throw new Error('Erro ao buscar resumo do dashboard');
  }
  const data = await res.json();
  return data;
}

/**
 * @function RelatorioKpis
 * @description Busca indicadores-chave de performance do dashboard.
 *
 * Retorna métricas quantitativas incluindo:
 * - Total de vagas disponíveis
 * - Taxa de ocupação atual
 * - Contagem de reservas (ativas, pendentes, concluídas, canceladas, removidas)
 * - Total de reservas
 * - Reservas com múltiplas vagas
 * - Datas do período analisado
 *
 * @param startDate - Data inicial (opcional, formato ISO)
 * @param endDate - Data final (opcional, formato ISO)
 * @returns Promise<DashboardKPIs>
 *
 * @throws {Error} Dispara erro se a requisição falhar
 *
 * @example
 * ```ts
 * // Buscar KPIs sem filtro de data
 * const kpis = await RelatorioKpis();
 *
 * // Buscar KPIs de um período específico
 * const kpisFiltrado = await RelatorioKpis(
 *   '2024-01-01',
 *   '2024-01-31'
 * );
 *
 * console.log(`Total de vagas: ${kpis.totalSlots}`);
 * console.log(`Taxa de ocupação: ${kpis.occupancyRate}%`);
 * console.log(`Reservas ativas: ${kpis.activeReservations}`);
 * console.log(`Período: ${kpis.startDate} até ${kpis.endDate}`);
 * ```
 */
export async function RelatorioKpis(
  startDate?: string,
  endDate?: string,
): Promise<DashboardKPIs> {
  // Construir query string com filtros de data
  const params = new URLSearchParams();

  if (startDate) {
    params.append('startDate', startDate);
  }

  if (endDate) {
    params.append('endDate', endDate);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';

  // Requisição à API
  const res = await clientApi(
    `/petrocarga/api/v1/dashboard/kpis${queryString}`,
    {
      method: 'GET',
    },
  );

  if (!res.ok) {
    throw new Error('Erro ao buscar KPIs do dashboard');
  }
  const data = await res.json();
  return data;
}
