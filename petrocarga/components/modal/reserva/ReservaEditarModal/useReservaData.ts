import { useState, useEffect } from 'react';
import { getVeiculo } from '@/lib/api/veiculoApi';
import { getVagaById } from '@/lib/api/vagaApi';
import { Veiculo } from '@/lib/types/veiculo';
import { Vaga } from '@/lib/types/vaga';

/**
 * @hook useReservaData
 * @version 1.0.0
 *
 * @description Hook customizado para carregar dados relacionados a uma reserva.
 * Busca informações do veículo e da vaga em paralelo.
 *
 * ----------------------------------------------------------------------------
 * 📋 PARÂMETROS:
 * ----------------------------------------------------------------------------
 *
 * @param {string} veiculoId - ID do veículo (opcional)
 * @param {string} vagaId - ID da vaga
 *
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 *
 * @property {Veiculo | null} veiculo - Dados do veículo (ou null se não encontrado)
 * @property {Vaga | null} vaga - Dados da vaga (ou null se não encontrado)
 * @property {boolean} loading - Estado de carregamento
 * @property {string | null} error - Mensagem de erro (se houver)
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. CARREGAMENTO PARALELO:
 *    - Usa Promise.all para buscar veículo e vaga simultaneamente
 *    - Se veiculoId não for fornecido, resolve como null
 *    - Se vagaId não for fornecido, resolve como null
 *
 * 2. TRATAMENTO DE RESPOSTAS:
 *    - Verifica se veiculoRes.error é falso antes de setar
 *    - Vaga não tem estrutura de error (apenas retorna null)
 *
 * 3. CLEANUP:
 *    - Flag mounted para evitar setState em componente desmontado
 *    - Previne memory leaks e warnings
 *
 * 4. TRATAMENTO DE ERRO:
 *    - Em caso de falha, setError com mensagem amigável
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - PARALELISMO: Promise.all para otimizar performance
 * - FLAG MOUNTED: Previne setState após desmontagem
 * - TRATAMENTO OPCIONAL: veiculoId pode ser vazio (quando em edição)
 * - FALLBACK: Resolve null se ID não fornecido
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - getVeiculo: API de busca de veículo
 * - getVagaById: API de busca de vaga
 * - ReservaEditarModal: Modal que utiliza este hook
 *
 * @example
 * ```tsx
 * const { veiculo, vaga, loading, error } = useReservaData(veiculoId, vagaId);
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * return (
 *   <div>
 *     <p>Veículo: {veiculo?.modelo} - {veiculo?.placa}</p>
 *     <p>Vaga: {vaga?.endereco.logradouro}</p>
 *   </div>
 * );
 * ```
 */

export function useReservaData(veiculoId: string, vagaId: string) {
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        // Busca veículo e vaga em paralelo
        const [veiculoRes, vagaRes] = await Promise.all([
          veiculoId ? getVeiculo(veiculoId) : Promise.resolve(null),
          vagaId ? getVagaById(vagaId) : Promise.resolve(null),
        ]);

        if (mounted) {
          // Apenas atualiza veículo se a resposta não tiver erro
          if (veiculoRes && !veiculoRes.error) setVeiculo(veiculoRes.veiculo);
          if (vagaRes) setVaga(vagaRes);
        }
      } catch {
        if (mounted) setError('Falha ao carregar detalhes da reserva.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    // Cleanup: evita setState em componente desmontado
    return () => {
      mounted = false;
    };
  }, [veiculoId, vagaId]);

  return { veiculo, vaga, loading, error };
}
