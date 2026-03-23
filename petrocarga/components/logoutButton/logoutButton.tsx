'use client';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { redirect } from 'next/navigation';
import { useState } from 'react';

interface LogoutButtonProps {
  mobile?: boolean;
}

/**
 * @component LogoutButton
 * @version 1.0.0
 * 
 * @description Botão de logout que desloga o usuário e redireciona para a página inicial.
 * Possui duas versões: padrão (dropdown) e mobile (botão destacado).
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {boolean} [mobile=false] - Versão mobile com estilo destacado (fundo vermelho, texto branco)
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. LOGOUT:
 *    - Chama a função logout do hook useAuth
 *    - Redireciona para a página inicial (redirect('/'))
 * 
 * 2. ESTADOS:
 *    - loading: controla desabilitação do botão durante o processo
 *    - Texto alterna entre "Sair" / "Sair da conta" e "Saindo..."
 * 
 * 3. VARIAÇÕES DE ESTILO:
 *    - Versão padrão: usado em dropdowns (texto vermelho, hover com fundo vermelho claro)
 *    - Versão mobile: botão destacado (fundo vermelho, texto branco, bordas arredondadas)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - REDIRECT: Usa redirect do Next.js (navegação server-side)
 * - LOADING: Impede múltiplos cliques durante o logout
 * - ÍCONE: LogOut do Lucide na versão mobile
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useAuth: Hook de autenticação com função logout
 * - redirect: Função do Next.js para navegação
 * 
 * @example
 * ```tsx
 * // Uso padrão (dropdown de perfil)
 * <LogoutButton />
 * 
 * // Uso mobile (menu hambúrguer)
 * <LogoutButton mobile={true} />
 * ```
 */

export function LogoutButton({ mobile = false }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  /**
   * @function handleLogout
   * @description Processa o logout do usuário
   * 
   * Fluxo:
   * 1. Ativa estado de loading
   * 2. Chama função logout do contexto de autenticação
   * 3. Redireciona para página inicial
   */
  async function handleLogout() {
    setLoading(true);
    await logout();
    redirect('/');
  }

  // ==================== VERSÃO MOBILE (BOTÃO DESTACADO) ====================
  if (mobile) {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 ml-auto px-4 py-2 text-sm font-medium text-white bg-red-700 shadow rounded-xl hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          'Saindo...'
        ) : (
          <>
            <LogOut className="h-4 w-4" />
            Sair da conta
          </>
        )}
      </button>
    );
  }

  // ==================== VERSÃO PADRÃO (DROPDOWN) ====================
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 w-full text-left px-2 py-1 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
    >
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  );
}