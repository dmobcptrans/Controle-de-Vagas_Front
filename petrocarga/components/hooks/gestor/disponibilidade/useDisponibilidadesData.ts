import { useMemo } from 'react';
import { useDisponibilidade } from './useDisponibilidade';
import { Disponibilidade } from '@/lib/types/disponibilidadeVagas';

/**
 * @hook useDisponibilidadesData
 * @version 1.0.0
 * 
 * @description Hook customizado para processamento e agrupamento de disponibilidades.
 * Estende o hook useDisponibilidade adicionando dados agrupados por logradouro e intervalo.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {Disponibilidade[]} disponibilidades - Lista original de disponibilidades
 * @property {Record<string, Record<string, Disponibilidade[]>>} disponibilidadesAgrupadas - Disponibilidades agrupadas por logradouro e intervalo
 * @property {React.Dispatch<React.SetStateAction<Disponibilidade[]>>} setDisponibilidades - Função para atualizar manualmente as disponibilidades
 * @property {boolean} loadingDisponibilidades - Estado de carregamento
 * 
 * ----------------------------------------------------------------------------
 * 📋 ESTRUTURA DE AGRUPAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * disponibilidadesAgrupadas = {
 *   "Rua do Imperador": {
 *     "2024-01-01T08:00:00 → 2024-01-01T18:00:00": [disp1, disp2],
 *     "2024-01-02T08:00:00 → 2024-01-02T18:00:00": [disp3]
 *   },
 *   "Av. Brasil": {
 *     "2024-01-01T08:00:00 → 2024-01-01T18:00:00": [disp4]
 *   }
 * }
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useMemo: Recalcula agrupamento apenas quando disponibilidades muda
 * - FALLBACK: Logradouro não identificado → "Logradouro Não Identificado"
 * - AGRUPAMENTO ANINHADO: Primeiro nível por logradouro, segundo por intervalo
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useDisponibilidade: Hook base de disponibilidades
 * - Disponibilidade: Tipo de disponibilidade
 * 
 * @example
 * ```tsx
 * const { disponibilidadesAgrupadas, loadingDisponibilidades } = useDisponibilidadesData();
 * 
 * if (loadingDisponibilidades) return <Spinner />;
 * 
 * return (
 *   <div>
 *     {Object.entries(disponibilidadesAgrupadas).map(([logradouro, intervalos]) => (
 *       <LogradouroSection key={logradouro} title={logradouro}>
 *         {Object.entries(intervalos).map(([intervalo, disps]) => (
 *           <IntervaloCard key={intervalo} intervalo={intervalo} disps={disps} />
 *         ))}
 *       </LogradouroSection>
 *     ))}
 *   </div>
 * );
 * ```
 */

type Props = {
  mes?: number;
  ano?: number;
};
export function useDisponibilidadesData({ mes, ano }: Props) {
  // ==================== HOOK BASE ====================
  const { disponibilidades, setDisponibilidades } =
    useDisponibilidade({ mes, ano });

  // ==================== AGRUPAMENTO POR LOGRADOURO E INTERVALO ====================
  /**
   * Agrupa disponibilidades em uma estrutura aninhada:
   * 
   * {
   *   "Logradouro A": {
   *     "início → fim": [disponibilidade1, disponibilidade2],
   *     "início → fim": [disponibilidade3]
   *   },
   *   "Logradouro B": { ... }
   * }
   */
  const disponibilidadesAgrupadas = useMemo(() => {
    if (!disponibilidades || disponibilidades.length === 0) {
      return {};
    }

    return disponibilidades.reduce(
      (acc, disp) => {
        // Obtém logradouro (fallback para não identificado)
        const log = disp.endereco?.logradouro ?? 'Logradouro Não Identificado';
        
        // Cria chave de intervalo com as datas
        const intervalo = `${disp.inicio} → ${disp.fim}`;

        // Inicializa estruturas se não existirem
        acc[log] ??= {};
        acc[log][intervalo] ??= [];
        
        // Adiciona disponibilidade ao grupo
        acc[log][intervalo].push(disp);

        return acc;
      },
      {} as Record<string, Record<string, Disponibilidade[]>>,
    );
  }, [disponibilidades]);

  return {
    disponibilidades,
    disponibilidadesAgrupadas,
    setDisponibilidades
  };
}