'use client';

import { useAuth } from '@/context/AuthContext';
import { getDenunciasByUsuario } from '@/lib/api/denunciaApi';
import DenunciaLista from '@/components/motorista/cards/denuncia/DenunciaLista';
import { Denuncia } from '@/lib/types/denuncias';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER FIXO ── */}
      <header className="bg-blue-800 px-4 pt-1 pb-3 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Suas Denúncias, {user?.nome?.split(' ')[0] || 'motorista'}
          </h1>
          <p className="text-xs text-white/50">
            Acompanhe Suas Denúncias Registradas
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-4xl mx-auto flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2 text-center">
            <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
            <span className="text-gray-600">Carregando denúncias...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Erro ao carregar denúncias
            </h3>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <Button onClick={fetchDenuncias} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : denuncias.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <p className="text-gray-500 text-lg">
              Você ainda não possui nenhuma denúncia cadastrada.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <DenunciaLista denuncias={denuncias} />
          </div>
        )}

        {/* Tutorial */}
        <Link
          href="/motorista/tutorial#denuncias"
          className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors mt-6"
        >
          <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-[#1351B4]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#071D41]">
              Como registrar denúncias?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Aprenda a registrar e acompanhar suas denúncias
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
