'use client';

import { useEffect, useState } from 'react';
import { Vaga } from '@/lib/types/vaga';
import * as vagaApi from '@/lib/api/vagaApi';

/**
 * @hook useVagas
 * @version 1.0.0
 * 
 * @description Hook customizado para carregar todas as vagas do sistema.
 * Gerencia estados de carregamento, dados e erro.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {Vaga[]} vagas - Lista de todas as vagas carregadas (array vazio em caso de erro)
 * @property {boolean} loading - Estado de carregamento
 * @property {string | null} error - Mensagem de erro (se houver)
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO INICIAL:
 *    - useEffect dispara fetchVagas na montagem
 *    - setLoading(true) ativa estado de carregamento
 * 
 * 2. BUSCA NA API:
 *    - Chama vagaApi.getVagas()
 *    - Aguarda resposta
 * 
 * 3. TRATAMENTO:
 *    - Sucesso: setVagas(data), setError(null)
 *    - Erro: setError(mensagem), setVagas([])
 * 
 * 4. FINALIZAÇÃO:
 *    - setLoading(false) desativa carregamento
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - ARRAY VAZIO NO ERRO: Garante que o componente não quebre com undefined
 * - MENSAGEM DE ERRO AMIGÁVEL: Extrai message do erro ou fallback
 * - FETCH ÚNICO: Executado apenas na montagem do componente
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
 * const { vagas, loading, error } = useVagas();
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 * 
 * return (
 *   <div>
 *     {vagas.map(vaga => (
 *       <VagaCard key={vaga.id} vaga={vaga} />
 *     ))}
 *   </div>
 * );
 * ```
 */

export function useVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVagas = async () => {
      setLoading(true);
      try {
        const data: Vaga[] = await vagaApi.getVagas();
        setVagas(data);
      } catch (err) {
        console.error('Erro ao carregar vagas:', err);
        const message =
          (err as { message?: string }).message || 'Erro desconhecido';
        setError(message);
        setVagas([]); // garante array vazio
      } finally {
        setLoading(false);
      }
    };

    fetchVagas();
  }, []);

  return { vagas, loading, error };
}