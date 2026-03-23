'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import Logo from '@/public/Logo.png';
import { useAuth } from '@/components/hooks/useAuth';
import { NAVBAR_LINKS } from './config/navbarLinks';
import { LogoutButton } from '@/components/logoutButton/logoutButton';

/**
 * @component PrivateNavbar
 * @version 1.0.0
 * 
 * @description Barra de navegação para usuários autenticados.
 * Exibe links dinâmicos baseados na permissão do usuário (MOTORISTA, AGENTE, GESTOR, ADMIN).
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. AUTHENTICAÇÃO:
 *    - Se usuário não autenticado, componente não renderiza (return null)
 *    - Obtém permissão do usuário via useAuth
 * 
 * 2. LINKS DINÂMICOS:
 *    - Busca links da configuração NAVBAR_LINKS baseado na permissão
 *    - MOTORISTA, AGENTE, GESTOR, ADMIN têm conjuntos diferentes de links
 * 
 * 3. LAYOUT:
 *    - DESKTOP: Links em linha (flex horizontal) + LogoutButton
 *    - MOBILE: Menu hambúrguer (☰) que expande/contrai
 * 
 * 4. LOGO:
 *    - Link para o primeiro link da permissão (página inicial do perfil)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - CONFIGURAÇÃO EXTERNA: NAVBAR_LINKS importado de arquivo de configuração
 * - RENDERIZAÇÃO CONDICIONAL: Retorna null se usuário não autenticado
 * - LOGOUT: Componente LogoutButton com prop mobile para versão mobile
 * - RESPONSIVIDADE: hidden no desktop, block no mobile para o menu
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useAuth: Hook de autenticação
 * - LogoutButton: Botão de logout
 * - NAVBAR_LINKS: Configuração de links por permissão
 * - Link: Componente de navegação do Next.js
 * 
 * @example
 * ```tsx
 * // Uso no layout privado
 * <PrivateNavbar />
 * ```
 */

export function PrivateNavbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { user } = useAuth();

  // Não renderiza se usuário não estiver autenticado
  if (!user) return null;

  const links = NAVBAR_LINKS[user.permissao] || [];

  return (
    <header className="bg-blue-800 text-white relative">
      <nav className="flex items-center justify-between p-4 max-w-6xl mx-auto">
        
        {/* ==================== LOGO ==================== */}
        <Link
          href={links[0]?.href || '/'}
          className="flex items-center space-x-2 text-xl font-bold hover:text-gray-300"
        >
          <Image src={Logo} alt="Logo" className="w-16 h-auto" />
        </Link>

        {/* ==================== MENU DESKTOP ==================== */}
        <ul className="hidden md:flex gap-6 text-lg items-center">
          {links.map((l) => (
            <li key={l.href} className="hover:text-gray-300">
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
          <LogoutButton />
        </ul>

        {/* ==================== BOTÃO MENU MOBILE ==================== */}
        <button
          className="md:hidden text-2xl hover:text-gray-300"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          ☰
        </button>
      </nav>

      {/* ==================== MENU MOBILE EXPANSÍVEL ==================== */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuAberto ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-4 bg-blue-500 p-4 shadow-md">
          {links.map((l) => (
            <li key={l.href} className="hover:bg-blue-700 rounded px-2">
              <Link href={l.href} onClick={() => setMenuAberto(false)}>
                {l.label}
              </Link>
            </li>
          ))}
          <LogoutButton mobile />
        </ul>
      </div>
    </header>
  );
}