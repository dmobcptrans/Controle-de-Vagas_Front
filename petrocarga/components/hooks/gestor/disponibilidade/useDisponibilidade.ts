import { useEffect, useState } from 'react';
import { Disponibilidade } from '@/lib/types/disponibilidadeVagas';
import { fetchDisponibilidades } from '@/components/services/gestor/disponibilidade/disponibilidadeService';

/**
 * @hook useDisponibilidade
 * @version 1.0.0
 * 
 * @description Hook customizado para gerenciamento de disponibilidades de vagas.
 * Gerencia o estado de carregamento, dados e erros das disponibilidades.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {Disponibilidade[]} disponibilidades - Lista de disponibilidades carregadas
 * @property {(disponibilidades: Disponibilidade[]) => void} setDisponibilidades - Função para atualizar manualmente as disponibilidades
 * @property {boolean} loading - Estado de carregamento
 * @property {Error | null} error - Objeto de erro (se houver)
 * @property {() => Promise<void>} refetchDisponibilidades - Função para recarregar os dados
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO INICIAL:
 *    - useEffect dispara loadDisponibilidades na montagem
 *    - Chama service fetchDisponibilidades
 *    - Atualiza estado disponibilidades
 *    - Trata erros com setError
 * 
 * 2. REFETCH:
 *    - refetchDisponibilidades permite recarregar dados manualmente
 *    - Útil após criação, edição ou exclusão de disponibilidade
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - SEPARAÇÃO DE RESPONSABILIDADES: Hook gerencia estado, service faz chamada API
 * - EXPOSIÇÃO DE setDisponibilidades: Permite atualização otimista no componente
 * - TRATAMENTO DE ERRO: Armazena objeto Error para feedback detalhado
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - fetchDisponibilidades: Service de busca de disponibilidades
 * - Disponibilidade: Tipo de disponibilidade
 * 
 * @example
 * ```tsx
 * const { disponibilidades, loading, error, refetchDisponibilidades } = useDisponibilidade();
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * 
 * return (
 *   <div>
 *     {disponibilidades.map(disp => (
 *       <DisponibilidadeCard key={disp.id} disponibilidade={disp} />
 *     ))}
 *     <button onClick={refetchDisponibilidades}>Recarregar</button>
 *   </div>
 * );
 * ```
 */

export function useDisponibilidade() {
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ==================== FUNÇÃO INTERNA DE CARREGAMENTO ====================
  const loadDisponibilidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDisponibilidades();
      setDisponibilidades(data);
    } catch (err) {
      console.error('Erro ao carregar disponibilidades:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  // ==================== CARREGAMENTO INICIAL ====================
  useEffect(() => {
    loadDisponibilidades();
  }, []);

  return {
    disponibilidades,
    setDisponibilidades,
    loading,
    error,
    refetchDisponibilidades: loadDisponibilidades,
  };
}