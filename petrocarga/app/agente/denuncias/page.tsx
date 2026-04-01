'use client';

import { useDenuncias } from '@/components/hooks/useDenuncias';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import DenunciaLista from '@/components/gestor/denuncia/DenunciaLista';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * @component DenunciasAgente
 * @version 1.0.0
 *
 * @description Página de visualização de denúncias para agentes/gestores.
 * Gerencia os estados de carregamento, erro e lista vazia do hook useDenuncias.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. HOOK DE DADOS:
 *    - useDenuncias() gerencia toda a lógica de busca
 *    - Retorna denúncias, loading, error e função refetch
 *
 * 2. RENDERIZAÇÃO CONDICIONAL (4 ESTADOS):
 *
 *    a) LOADING:
 *       - Exibe spinner centralizado
 *       - Mensagem "Carregando denúncias..."
 *       - Atributo aria-busy para acessibilidade
 *
 *    b) ERRO:
 *       - Ícone de alerta vermelho
 *       - Mensagem de erro específica
 *       - Botão "Tentar novamente" (chama refetch)
 *
 *    c) LISTA VAZIA (sem denúncias):
 *       - Ícone de alerta cinza
 *       - Mensagem "Nenhuma denúncia encontrada"
 *       - Sem botão de ação (não há o que recarregar)
 *
 *    d) LISTA COM DADOS:
 *       - Título "Denúncias"
 *       - Componente DenunciaLista com as denúncias
 *       - Passa função onRefresh para atualizações manuais
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Usa 'use client' porque:
 *   - Utiliza hooks React (useDenuncias)
 *   - Tem interatividade (botão de tentar novamente)
 *   - Estados de UI condicionais
 *
 * - HOOK CUSTOMIZADO: useDenuncias encapsula:
 *   - Lógica de busca de dados
 *   - Estados de loading/error
 *   - Função de refetch para recarregar
 *   - Isolamento de responsabilidades
 *
 * - RENDERIZAÇÃO CONDICIONAL: 4 estados distintos
 *   tratados separadamente para melhor UX e manutenibilidade
 *
 * - ACESSIBILIDADE:
 *   - aria-busy="true" durante loading para leitores de tela
 *   - Estrutura semântica (section, h1)
 *   - Contraste adequado nas cores
 *
 * - LAYOUT RESPONSIVO:
 *   - max-w-2xl para legibilidade em desktop
 *   - Padding responsivo (px-4 md:px-6 lg:px-8)
 *   - min-h-screen para footer sempre no final
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - useDenuncias: Hook customizado que gerencia busca de denúncias
 * - DenunciaLista: Componente que renderiza a lista de denúncias
 * - Button: Componente UI reutilizável
 *
 * ----------------------------------------------------------------------------
 * 🎨 UX/UI:
 * ----------------------------------------------------------------------------
 *
 * - Loading: Spinner animado com mensagem clara
 * - Erro: Feedback visual vermelho com opção de retry
 * - Lista vazia: Mensagem amigável sem frustração
 * - Lista com dados: Título claro e scroll suave
 * - Todas as telas ocupam altura total (min-h-screen)
 * - Design consistente com o sistema de design
 *
 * @example
 * // Uso em rota de gestor/agente
 * <DenunciasAgente />
 *
 * @see /src/components/hooks/useDenuncias.ts - Hook de dados
 * @see /src/components/gestor/denuncia/DenunciaLista.tsx - Lista de denúncias
 */

export default function DenunciasAgente() {
  // --------------------------------------------------------------------------
  // HOOK DE DADOS
  // --------------------------------------------------------------------------

  /**
   * useDenuncias gerencia:
   * - denuncias: Array de denúncias do backend
   * - loading: Booleano indicando busca em andamento
   * - error: Mensagem de erro ou null
   * - refetch: Função para recarregar dados manualmente
   */
  const { denuncias, loading, error, refetch } = useDenuncias();

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL - 4 ESTADOS
  // --------------------------------------------------------------------------

  /**
   * ESTADO 1: LOADING
   * Exibido enquanto os dados estão sendo buscados
   * Inclui atributo de acessibilidade para leitores de tela
   */
  if (loading) {
    return (
      <div
        className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3"
        aria-busy="true"
        role="status"
        aria-label="Carregando denúncias"
      >
        <Loader2 className="animate-spin w-6 h-6 md:w-8 md:h-8 text-blue-600" />
        <p className="text-gray-600 text-sm md:text-base">
          Carregando denúncias...
        </p>
      </div>
    );
  }

  /**
   * ESTADO 2: ERRO
   * Exibido quando a requisição falha
   * Oferece botão para tentar novamente (refetch)
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-6 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
          Erro ao carregar denúncias
        </h3>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-6">
          {error}
        </p>
        <Button
          onClick={refetch}
          variant="outline"
          aria-label="Tentar carregar denúncias novamente"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  /**
   * ESTADO 3: LISTA VAZIA
   * Exibido quando a requisição foi bem-sucedida mas não há dados
   * Não oferece botão de retry pois não há o que recarregar
   */
  if (!denuncias.length) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center py-12 md:py-16 text-center min-h-[60vh]">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
          Nenhuma denúncia encontrada
        </h3>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
          Nenhuma denúncia encontrada no momento.
        </p>
      </div>
    );
  }

  /**
   * ESTADO 4: LISTA COM DADOS
   * Renderiza o título e o componente de lista
   * Passa função onRefresh para permitir atualizações manuais
   */
  return (
    <section
      className="min-h-screen bg-gray-50 py-8"
      aria-label="Lista de denúncias"
    >
      <div className="w-full max-w-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 text-center">
          Denúncias
        </h1>
        <DenunciaLista denuncias={denuncias} onRefresh={refetch} />

        {/* Tutorial Link */}
        <div className="mt-6">
          <Link
            href="/agente/tutorial#denuncias"
            className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors group w-full"
          >
            <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <Info className="h-5 w-5 text-[#1351B4]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                Novo por aqui?
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Aprenda a acompanhar e responder às denúncias dos motoristas
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}