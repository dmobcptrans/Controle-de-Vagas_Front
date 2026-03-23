'use client';

import { useState, useEffect, useCallback } from 'react';
import { Denuncia } from '@/lib/types/denuncias';
import { getDenuncias } from '@/lib/api/denunciaApi';
import toast from 'react-hot-toast';

/**
 * @hook useDenuncias
 * @version 1.0.0
 * 
 * @description Hook customizado para gerenciamento de denúncias.
 * Fornece funções para carregar denúncias, estados de loading e erro.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {Denuncia[]} denuncias - Lista de denúncias carregadas
 * @property {boolean} loading - Estado de carregamento
 * @property {string | null} error - Mensagem de erro (se houver)
 * @property {() => Promise<void>} refetch - Função para recarregar denúncias
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO INICIAL:
 *    - useEffect dispara fetchDenuncias na montagem
 *    - setLoading(true) ativa estado de carregamento
 * 
 * 2. BUSCA NA API:
 *    - Chama getDenuncias()
 *    - Aguarda resposta
 * 
 * 3. TRATAMENTO:
 *    - Sucesso: setDenuncias(data)
 *    - Erro: setError(mensagem), toast.error(mensagem), setDenuncias([])
 * 
 * 4. FINALIZAÇÃO:
 *    - setLoading(false) desativa carregamento
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - useCallback: Memoiza fetchDenuncias para evitar re-renders
 * - FEEDBACK DUPLO: Toast + estado error para UI e notificação
 * - ARRAY VAZIO NO ERRO: Garante que o componente não quebre
 * - REFETCH: Permite recarregar dados manualmente após ações
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - getDenuncias: API de listagem de denúncias
 * - Denuncia: Tipo de denúncia
 * - toast: Feedback visual (react-hot-toast)
 * 
 * @example
 * ```tsx
 * function DenunciasList() {
 *   const { denuncias, loading, error, refetch } = useDenuncias();
 * 
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorMessage message={error} onRetry={refetch} />;
 * 
 *   return (
 *     <div>
 *       {denuncias.map(denuncia => (
 *         <DenunciaCard key={denuncia.id} denuncia={denuncia} />
 *       ))}
 *       <button onClick={refetch}>Atualizar</button>
 *     </div>
 *   );
 * }
 * ```
 */

export function useDenuncias() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== FUNÇÃO DE BUSCA ====================
  const fetchDenuncias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDenuncias();
      setDenuncias(result ?? []);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao carregar denúncias. Por favor, tente novamente.';
      setError(msg);
      toast.error(msg);
      setDenuncias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== CARREGAMENTO INICIAL ====================
  useEffect(() => {
    fetchDenuncias();
  }, [fetchDenuncias]);

  return {
    denuncias,
    loading,
    error,
    refetch: fetchDenuncias,
  };
}