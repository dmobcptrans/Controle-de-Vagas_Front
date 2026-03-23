'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationStat } from '@/lib/types/dashboard';
import { ParkingSquare, TrendingUp, Star, MapPin } from 'lucide-react';

interface MostUsedParkingSpacesProps {
  data: LocationStat[];
}

/**
 * @component MostUsedParkingSpaces
 * @version 1.0.0
 * 
 * @description Componente que exibe o ranking das vagas mais utilizadas.
 * Apresenta métricas detalhadas como percentual de uso, demanda e média diária.
 * 
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 * 
 * 1. RANKING:
 *    - Top 5 vagas mais utilizadas
 *    - Medalhas para as 3 primeiras posições (🥇, 🥈, 🥉)
 *    - Nome da vaga com ícone de estacionamento
 * 
 * 2. MÉTRICAS POR VAGA:
 *    - Total de reservas
 *    - Percentual de uso (barra colorida)
 *    - Média de reservas/dia (baseado em 30 dias)
 *    - Classificação de demanda (Alta/Média/Baixa)
 * 
 * 3. ESTATÍSTICAS GLOBAIS:
 *    - Total de reservas
 *    - Percentual do total representado pelo top 5
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - ORDENAÇÃO: Dados ordenados por reservationCount decrescente
 * - LIMITE: Exibe apenas top 5 vagas
 * - MEDALHAS: Top 3 com cores diferenciadas:
 *   - 🥇 Ouro (amarelo)
 *   - 🥈 Prata (cinza)
 *   - 🥉 Bronze (laranja)
 * 
 * - BARRA DE USO: Cores baseadas no percentual:
 *   - > 30%: verde (alta)
 *   - > 15%: azul (média)
 *   - > 5%: amarelo (baixa)
 *   - ≤ 5%: cinza (muito baixa)
 * 
 * - DEMANDA: Classificação baseada no percentual:
 *   - > 10%: Alta
 *   - > 5%: Média
 *   - ≤ 5%: Baixa
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - LocationStat: Tipo de estatística de localização
 * - Card, CardContent, CardHeader, CardTitle: Componentes UI
 * 
 * @example
 * ```tsx
 * <MostUsedParkingSpaces data={dashboard.mostUsedVagas} />
 * ```
 */

export function MostUsedParkingSpaces({ data }: MostUsedParkingSpacesProps) {
  // Ordena vagas por número de reservas (decrescente)
  const sortedData = [...data].sort(
    (a, b) => b.reservationCount - a.reservationCount,
  );

  // ==================== ESTADO VAZIO ====================
  if (sortedData.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full p-6 min-h-[300px]">
          <ParkingSquare className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum dado disponível
          </h3>
          <p className="text-gray-600 text-center">
            Não há dados de vagas mais utilizadas
          </p>
        </CardContent>
      </Card>
    );
  }

  // Total de reservas para cálculo de percentuais
  const totalReservations = sortedData.reduce(
    (sum, item) => sum + item.reservationCount,
    0,
  );

  return (
    <Card className="h-full">
      
      {/* Header com título e contador */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Vagas Mais Utilizadas
          {sortedData.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              Top {Math.min(5, sortedData.length)}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          
          {/* Lista das 5 vagas mais utilizadas */}
          {sortedData.slice(0, 5).map((item, index) => {
            const percentage =
              totalReservations > 0
                ? (item.reservationCount / totalReservations) * 100
                : 0;

            return (
              <div
                key={`${item.type}-${item.name}-${index}`}
                className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:shadow-sm transition-shadow"
              >
                {/* Linha principal: ranking, nome e reservas */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      
                      {/* Medalhas para top 3 */}
                      {index < 3 && (
                        <div
                          className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-800'  // 🥇 Ouro
                              : index === 1
                                ? 'bg-gray-100 text-gray-800'   // 🥈 Prata
                                : 'bg-orange-100 text-orange-800' // 🥉 Bronze
                          }
                        `}
                        >
                          {index + 1}
                        </div>
                      )}

                      {/* Nome da vaga */}
                      <div className="flex items-center gap-1 truncate">
                        <ParkingSquare className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    {/* Endereço (placeholder) */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>Endereço da vaga</span>
                    </div>
                  </div>

                  {/* Total de reservas */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {item.reservationCount}
                    </div>
                    <div className="text-xs text-gray-500">reservas</div>
                  </div>
                </div>

                {/* Barra de percentual de uso */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Uso</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`
                        h-2 rounded-full
                        ${
                          percentage > 30
                            ? 'bg-green-500'   // Alta utilização
                            : percentage > 15
                              ? 'bg-blue-500'  // Média utilização
                              : percentage > 5
                                ? 'bg-yellow-500' // Baixa utilização
                                : 'bg-gray-400'   // Muito baixa
                        }
                      `}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Estatísticas adicionais: média/dia e demanda */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t text-xs">
                  
                  {/* Média de reservas por dia */}
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">
                      {(item.reservationCount / 30).toFixed(1)}
                    </div>
                    <div className="text-gray-500">reservas/dia*</div>
                  </div>

                  {/* Classificação da demanda */}
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {percentage > 10
                        ? 'Alta'
                        : percentage > 5
                          ? 'Média'
                          : 'Baixa'}
                    </div>
                    <div className="text-gray-500">demanda</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com estatísticas consolidadas */}
        {totalReservations > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total de reservas:</span>
              <span className="font-semibold">{totalReservations}</span>
            </div>
            
            {/* Nota explicativa */}
            <p className="text-xs text-gray-500 mt-2">
              *Baseado em média de 30 dias. Top 5 vagas representam{' '}
              {sortedData
                .slice(0, 5)
                .reduce((sum, item) => sum + item.reservationCount, 0)}{' '}
              reservas (
              {(
                (sortedData
                  .slice(0, 5)
                  .reduce((sum, item) => sum + item.reservationCount, 0) /
                  totalReservations) *
                100
              ).toFixed(1)}
              % do total).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}