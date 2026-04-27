'use client';

import { useEffect, useState } from 'react';
import { Vaga } from '@/lib/types/vaga';
import * as vagaApi from '@/lib/api/vagaApi';

/**
 * @hook useVagasReserva
 * @version 1.0.0
 * 
 * @description Hook customizado para carregar apenas vagas disponíveis para reserva.
 * Filtra vagas com status 'DISPONIVEL' para uso no mapa de reserva.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {Vaga[]} vagas - Lista de vagas disponíveis (status 'DISPONIVEL')
 * @property {boolean} loading - Estado de carregamento
 * @property {string | null} error - Mensagem de erro (se houver)
 * 
 * ----------------------------------------------------------------------------
 * 📋 DIFERENÇA DO useVagas:
 * ----------------------------------------------------------------------------
 * 
 * | Hook | Filtro | Uso |
 * |------|--------|-----|
 * | useVagas | Nenhum (todas vagas) | Listagem geral, gestão |
 * | useVagasReserva | Apenas 'DISPONIVEL' | Mapa de reserva, seleção de vagas |
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
 *    - Chama vagaApi.getVagas('DISPONIVEL')
 *    - API retorna apenas vagas com status disponível
 * 
 * 3. TRATAMENTO:
 *    - Sucesso: setVagas(data)
 *    - Erro: setError(mensagem), setVagas([])
 * 
 * 4. FINALIZAÇÃO:
 *    - setLoading(false) desativa carregamento
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - FILTRO NO BACKEND: Passa parâmetro 'DISPONIVEL' para API
 * - ARRAY VAZIO NO ERRO: Garante que o componente não quebre com undefined
 * - FETCH ÚNICO: Executado apenas na montagem do componente
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - getVagas: API de listagem de vagas com filtro por status
 * - Vaga: Tipo de vaga
 * - MapReserva: Componente que utiliza este hook
 * 
 * @example
 * ```tsx
 * const { vagas, loading, error } = useVagasReserva();
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 * 
 * return (
 *   <MapaVagas>
 *     {vagas.map(vaga => (
 *       <MarcadorVaga key={vaga.id} vaga={vaga} />
 *     ))}
 *   </MapaVagas>
 * );
 * ```
 */

export function useVagasReserva() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarVagas = async (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    setLoading(true);

    try {
      const data: Vaga[] = await vagaApi.getVagasPorMapa({
        ...bounds,
        status: 'DISPONIVEL',
      });

      setVagas(data);
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
      setError('Erro ao buscar vagas');
      setVagas([]);
    } finally {
      setLoading(false);
    }
  };

  return { vagas, loading, error, buscarVagas };
}