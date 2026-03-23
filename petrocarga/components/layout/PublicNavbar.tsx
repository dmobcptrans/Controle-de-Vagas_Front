'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/public/Logo.png';
import Image from 'next/image';

/**
 * @component PublicNavbar
 * @version 1.0.0
 * 
 * @description Barra de navegação pública para usuários não autenticados.
 * Exibe links para introdução, login e página "Quem Somos".
 * 
 * ----------------------------------------------------------------------------
 * 📋 LINKS DE NAVEGAÇÃO:
 * ----------------------------------------------------------------------------
 * 
 * 1. Introdução: Página inicial (/)
 * 2. Acessar Conta: Página de login (/autorizacao/login)
 * 3. Quem Somos: Página institucional (/quemsomos)
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * - DESKTOP: Links em linha (flex horizontal)
 * - MOBILE: Menu hambúrguer (☰) que expande/contrai
 * - TRANSIÇÃO: Animação suave de altura (max-height)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - MENU MOBILE: Controlado por useState, transição CSS com max-height
 * - RESPONSIVIDADE: hidden no desktop, block no mobile para o menu
 * - LOGO: Componente Image do Next.js com otimização
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Link: Componente de navegação do Next.js
 * - Image: Componente de imagem otimizada do Next.js
 * 
 * @example
 * ```tsx
 * // Uso no layout público
 * <PublicNavbar />
 * ```
 */

export function PublicNavbar() {
  const [menuAberto, setMenuAberto] = useState(false);

  const links = [
    { href: '/', label: 'Introdução' },
    { href: '/autorizacao/login', label: 'Acessar Conta' },
    { href: '/quemsomos', label: 'Quem Somos' },
  ];

  return (
    <header className="bg-blue-800 text-white relative">
      <nav className="flex items-center justify-between p-4 max-w-6xl mx-auto">
        
        {/* ==================== LOGO ==================== */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-xl font-bold hover:text-gray-300"
        >
          <Image src={Logo} alt="Logo da Cptrans" className="w-16 h-auto" />
        </Link>

        {/* ==================== MENU DESKTOP ==================== */}
        <ul className="hidden md:flex gap-6 text-lg">
          {links.map((l) => (
            <li key={l.href} className="hover:text-gray-300">
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
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
        </ul>
      </div>
    </header>
  );
}