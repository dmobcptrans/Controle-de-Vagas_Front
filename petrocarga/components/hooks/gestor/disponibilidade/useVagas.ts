import { useEffect, useState, useMemo } from 'react';
import { getVagas } from '@/lib/api/vagaApi';
import { Vaga } from '@/lib/types/vaga';

/**
 * @hook useVagas
 * @version 1.0.0
 * 
 * @description Hook customizado para gerenciamento de vagas.
 * Gerencia o carregamento de vagas e fornece dados agrupados por logradouro.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {Vaga[]} vagas - Lista de todas as vagas carregadas
 * @property {Record<string, Vaga[]>} vagasPorLogradouro - Vagas agrupadas por logradouro
 * @property {boolean} loadingVagas - Estado de carregamento
 * @property {Error | null} errorVagas - Objeto de erro (se houver)
 * @property {() => Promise<void>} refetchVagas - Função para recarregar as vagas
 * 
 * ----------------------------------------------------------------------------
 * 📋 ESTRUTURA DE AGRUPAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * vagasPorLogradouro = {
 *   "Rua do Imperador": [vaga1, vaga2, vaga3],
 *   "Av. Brasil": [vaga4, vaga5],
 *   "Sem Logradouro": [vaga6]
 * }
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO INICIAL:
 *    - useEffect dispara loadVagas na montagem
 *    - Chama API getVagas
 *    - Atualiza estado vagas
 *    - Trata erros com setErrorVagas
 * 
 * 2. AGRUPAMENTO:
 *    - useMemo recalcula vagasPorLogradouro quando vagas muda
 *    - Agrupa por endereco.logradouro
 *    - Fallback: "Sem Logradouro" para vagas sem endereço
 * 
 * 3. REFETCH:
 *    - refetchVagas permite recarregar dados manualmente
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useMemo: Otimiza agrupamento, recalcula apenas quando vagas muda
 * - FALLBACK: "Sem Logradouro" para vagas sem endereço definido
 * - SEPARAÇÃO DE RESPONSABILIDADES: Hook gerencia estado, API separada
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - getVagas: API de listagem de vagas
 * - Vaga: Tipo de vaga
 * 
 * @example
 * ```tsx
 * const { vagas, vagasPorLogradouro, loadingVagas, refetchVagas } = useVagas();
 * 
 * if (loadingVagas) return <Spinner />;
 * 
 * return (
 *   <div>
 *     {Object.entries(vagasPorLogradouro).map(([logradouro, vagasDoLogradouro]) => (
 *       <LogradouroSection key={logradouro} title={logradouro}>
 *         {vagasDoLogradouro.map(vaga => (
 *           <VagaCard key={vaga.id} vaga={vaga} />
 *         ))}
 *       </LogradouroSection>
 *     ))}
 *     <button onClick={refetchVagas}>Recarregar</button>
 *   </div>
 * );
 * ```
 */

export function useVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);
  const [errorVagas, setErrorVagas] = useState<Error | null>(null);

  // ==================== CARREGAR VAGAS ====================
  const loadVagas = async () => {
    setLoadingVagas(true);
    setErrorVagas(null);
    try {
      const data = await getVagas();
      setVagas(data ?? []);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      setErrorVagas(
        error instanceof Error ? error : new Error('Erro ao carregar vagas.')
      );
    } finally {
      setLoadingVagas(false);
    }
  };

  // Carregamento inicial
  useEffect(() => {
    loadVagas();
  }, []);

  // ==================== AGRUPAR VAGAS POR LOGRADOURO ====================
  /**
   * Agrupa vagas por logradouro para uso no modal de criação de disponibilidade
   * 
   * Estrutura de saída:
   * {
   *   "Rua do Imperador": [vaga1, vaga2],
   *   "Av. Brasil": [vaga3]
   * }
   */
  const vagasPorLogradouro = useMemo(() => {
    return vagas.reduce((acc, vaga) => {
      // Obtém logradouro (fallback para "Sem Logradouro")
      const log = vaga?.endereco?.logradouro ?? 'Sem Logradouro';
      
      // Inicializa array se não existir
      (acc[log] ??= []).push(vaga);
      
      return acc;
    }, {} as Record<string, Vaga[]>);
  }, [vagas]);

  return {
    vagas,
    vagasPorLogradouro,
    loadingVagas,
    errorVagas,
    refetchVagas: loadVagas,
  };
}