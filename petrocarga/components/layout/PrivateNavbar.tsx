'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import Logo from '@/public/Logo.png';
import { useAuth } from '@/components/hooks/useAuth';
import { NAVBAR_LINKS } from './config/navbarLinks';
import { LogoutButton } from '@/components/logoutButton/logoutButton';

export function PrivateNavbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  const links = NAVBAR_LINKS[user.permissao] || [];

  return (
    <header className="bg-blue-800 text-white relative">
      <nav className="flex items-center justify-between p-4 max-w-6xl mx-auto">
        <Link
          href={links[0]?.href || '/'}
          className="flex items-center space-x-2 text-xl font-bold hover:text-gray-300"
        >
          <Image src={Logo} alt="Logo" className="w-16 h-auto" />
        </Link>

        <ul className="hidden md:flex gap-6 text-lg items-center">
          {links.map((l) => (
            <li key={l.href} className="hover:text-gray-300">
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
          <LogoutButton />
        </ul>

        <button
          className="md:hidden text-2xl hover:text-gray-300"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          ☰
        </button>
      </nav>

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
