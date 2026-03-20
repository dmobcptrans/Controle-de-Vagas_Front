'use client';

import { useAuth } from '@/context/AuthContext';
import { getDenunciasByUsuario } from '@/lib/api/denunciaApi';
import DenunciaLista from '@/components/motorista/cards/denuncia/DenunciaLista';
import { Denuncia } from '@/lib/types/denuncias';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

/**
 * @component MinhasDenuncias
 * @version 1.0.0
 *
 * @description Página de visualização de denúncias do motorista.
 * Lista todas as denúncias criadas pelo usuário logado.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Se não houver user.id, não carrega denúncias
 *
 * 2. CARREGAMENTO DE DENÚNCIAS:
 *    - useEffect dispara fetchDenuncias na montagem
 *    - useCallback memoiza função com base no user.id
 *    - Chama API getDenunciasByUsuario com ID do usuário
 *
 * 3. ESTADOS DE UI (4 ESTADOS):
 *
 *    a) LOADING:
 *       - Spinner centralizado
 *       - Mensagem "Carregando denúncias..."
 *
 *    b) ERRO:
 *       - Falha na API
 *       - Toast de erro automático
 *       - Ícone de alerta vermelho
 *       - Botão "Tentar novamente"
 *
 *    c) SEM DENÚNCIAS:
 *       - Mensagem centralizada
 *       - "Você ainda não possui nenhuma denúncia cadastrada."
 *
 *    d) LISTA COM DENÚNCIAS:
 *       - Título "Denúncias"
 *       - Componente DenunciaLista com as denúncias
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - FEEDBACK DUPLO: Toast + UI error
 *   - Toast para notificação imediata
 *   - UI error para contexto visual
 *
 * - useCallback + useEffect: Padrão para busca de dados
 *
 * - LISTA VAZIA: Mensagem amigável em vez de estado de erro
 *
 * - LAYOUT SIMPLES:
 *   - max-w-2xl para legibilidade
 *   - bg-gray-50 para fundo suave
 *   - Centralização consistente
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - DenunciaLista: Lista de denúncias
 * - useAuth: Hook de autenticação
 * - getDenunciasByUsuario: API de busca
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <MinhasDenuncias />
 * ```
 *
 * @see /src/components/motorista/cards/denuncia/DenunciaLista.tsx - Lista de denúncias
 * @see /src/lib/api/denunciaApi.ts - Função getDenunciasByUsuario
 */

export default function MinhasDenuncias() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------------------------------------

  const fetchDenuncias = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getDenunciasByUsuario(user.id);
      setDenuncias(result ?? []);
    } catch {
      setError(
        'Erro ao carregar suas denúncias. Por favor, tente novamente mais tarde.',
      );
      toast.error(
        'Erro ao carregar suas denúncias. Por favor, tente novamente mais tarde.',
      );
      setDenuncias([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --------------------------------------------------------------------------
  // EFEITO INICIAL
  // --------------------------------------------------------------------------

  useEffect(() => {
    fetchDenuncias();
  }, [fetchDenuncias]);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  /**
   * ESTADO 1: LOADING
   * Exibido durante a busca inicial
   */
  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando denúncias...</span>
      </div>
    );
  }

  /**
   * ESTADO 2: ERRO
   * Exibido quando a requisição falha
   * Oferece botão para tentar novamente
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Erro ao carregar denúncias
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">{error}</p>
        <Button onClick={fetchDenuncias} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  /**
   * ESTADO 3: LISTA VAZIA
   * Exibido quando não há denúncias cadastradas
   */
  if (denuncias.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">
          Você ainda não possui nenhuma denúncia cadastrada.
        </p>
      </div>
    );
  }

  /**
   * ESTADO 4: LISTA COM DADOS
   * Renderiza o título e a lista de denúncias
   */
  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Denúncias
        </h1>
        <DenunciaLista denuncias={denuncias} />
      </div>
    </section>
  );
}
