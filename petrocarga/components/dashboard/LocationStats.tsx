'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationStat, LocationStatType } from '@/lib/types/dashboard';
import { MapPin, Building, DoorOpen, Star, ParkingSquare } from 'lucide-react';

interface LocationStatsProps {
  title: string;
  data: LocationStat[];
  icon: LocationStatType;
}

/**
 * @component LocationStats
 * @version 1.0.0
 * 
 * @description Componente de estatísticas de localização para o dashboard.
 * Exibe rankings de bairros, origens, entradas da cidade e vagas mais utilizadas.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {string} title - Título do card (ex: "Bairros", "Locais de Origem")
 * @property {LocationStat[]} data - Array de estatísticas de localização
 * @property {LocationStatType} icon - Tipo de ícone (district, origin, entry-origin, most-used)
 * 
 * ----------------------------------------------------------------------------
 * 🎨 COMPORTAMENTO POR TIPO:
 * ----------------------------------------------------------------------------
 * 
 * | Tipo          | Ícone     | Cor      | Descrição                          |
 * |---------------|-----------|----------|------------------------------------|
 * | district      | Building  | Azul     | Bairros com mais reservas          |
 * | origin        | MapPin    | Verde    | Cidades de origem dos veículos     |
 * | entry-origin  | DoorOpen  | Roxo     | Cidades de entrada no sistema      |
 * | most-used     | Star      | Amarelo  | Vagas com maior utilização         |
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - ORDENAÇÃO: Dados ordenados por reservationCount decrescente
 * - RANKING: Para vagas mais usadas, exibe medalhas (🥇, 🥈, 🥉) para top 3
 * - CARD VAZIO: Exibe ícone e mensagem "Nenhum dado disponível"
 * - ESTATÍSTICA RESUMIDA: Mostra item mais popular e contagem do topo
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - LocationStat, LocationStatType: Tipos de estatísticas
 * - Lucide icons: MapPin, Building, DoorOpen, Star, ParkingSquare
 * 
 * @example
 * ```tsx
 * // Bairros
 * <LocationStats
 *   title="Bairros"
 *   data={dashboard.districts}
 *   icon="district"
 * />
 * 
 * // Vagas mais utilizadas
 * <LocationStats
 *   title="Vagas Mais Utilizadas"
 *   data={dashboard.mostUsedVagas}
 *   icon="most-used"
 * />
 * ```
 */

export function LocationStats({ title, data, icon }: LocationStatsProps) {
  
  /**
   * @function getIconComponent
   * @description Retorna o ícone correspondente ao tipo
   */
  const getIconComponent = () => {
    switch (icon) {
      case 'district':
        return Building;
      case 'origin':
        return MapPin;
      case 'entry-origin':
        return DoorOpen;
      case 'most-used':
        return Star;
      default:
        return MapPin;
    }
  };

  /**
   * @function getIconColor
   * @description Retorna a cor do ícone baseada no tipo
   */
  const getIconColor = () => {
    switch (icon) {
      case 'district':
        return 'text-blue-500';
      case 'origin':
        return 'text-green-500';
      case 'entry-origin':
        return 'text-purple-500';
      case 'most-used':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  /**
   * @function getDescription
   * @description Retorna a descrição do card baseada no tipo
   */
  const getDescription = () => {
    switch (icon) {
      case 'district':
        return 'Bairros com mais reservas';
      case 'origin':
        return 'Cidades de origem dos veículos';
      case 'entry-origin':
        return 'Cidades de entrada no sistema';
      case 'most-used':
        return 'Vagas com maior utilização';
      default:
        return '';
    }
  };

  const IconComponent = getIconComponent();
  const sortedData = [...data].sort(
    (a, b) => b.reservationCount - a.reservationCount,
  );

  return (
    <Card className="h-full">
      {/* Header do Card */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${getIconColor()}`} />
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          {data.length > 0 && (
            <span className="text-sm text-gray-500">{data.length} itens</span>
          )}
        </div>
        {getDescription() && (
          <p className="text-sm text-gray-500 mt-1">{getDescription()}</p>
        )}
      </CardHeader>

      {/* Conteúdo do Card */}
      <CardContent>
        <div className="space-y-3">
          {sortedData.length === 0 ? (
            // Estado vazio
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum dado disponível</p>
            </div>
          ) : (
            // Lista de itens ordenados
            sortedData.map((item, index) => (
              <div
                key={`${item.type}-${item.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  
                  {/* Ranking para vagas mais usadas (top 3) */}
                  {icon === 'most-used' && index < 3 && (
                    <div
                      className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
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

                  {/* Ícone específico para vagas mais usadas */}
                  {icon === 'most-used' ? (
                    <ParkingSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <IconComponent className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    {icon === 'most-used' && (
                      <p className="text-xs text-gray-500 truncate">
                        Vaga mais utilizada
                      </p>
                    )}
                  </div>
                </div>

                {/* Contagem de reservas */}
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                    {item.reservationCount}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    reservas
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Estatísticas resumidas (apenas se houver dados) */}
        {sortedData.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-700">
                  {sortedData[0].name}
                </div>
                <div className="text-xs text-blue-600">Mais popular</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold">
                  {sortedData[0].reservationCount}
                </div>
                <div className="text-xs text-gray-600">Reservas no top 1</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}