'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/public/Logo.png';
import Image from 'next/image';
import { LogoutButton } from '@/components/logoutButton/logoutButton';
import { useNotifications } from '@/context/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, Bell } from 'lucide-react';

/**
 * @component Navbar
 * @version 1.0.0
 * 
 * @description Barra de navegação principal para a área do agente.
 * Responsiva com menu mobile, notificações em tempo real e dropdown de perfil.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. NAVEGAÇÃO DESKTOP:
 *    - Links principais: Reserva Rápida, Lista de Reservas, Denúncias, Consultar Placa
 *    - Dropdown de perfil: "Meu Perfil" e "Sair"
 *    - Ícone de notificações com contador em tempo real
 * 
 * 2. NAVEGAÇÃO MOBILE:
 *    - Menu hambúrguer (☰) que expande/contrai
 *    - Seções organizadas: Reservas, Consultas, Notificações, Perfil
 *    - Botão de logout mobile
 * 
 * 3. NOTIFICAÇÕES:
 *    - useNotifications: contexto global com WebSocket
 *    - Contador de não lidas (unreadCount)
 *    - Badge vermelho com número (9+ para muitos)
 *    - Indicador de conexão (ponto amarelo piscando se offline)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - MENU MOBILE: Controle com useState e transições CSS (max-height)
 * - NOTIFICAÇÕES: Integração com contexto global para contagem em tempo real
 * - RESPONSIVIDADE: grid-cols-3 no mobile, flex no desktop
 * - ACESSIBILIDADE: aria-label com contador de notificações
 * - ANIMAÇÕES: pulsação no badge de notificações e no indicador de conexão
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useNotifications: Contexto de notificações (WebSocket)
 * - LogoutButton: Botão de logout (aceita prop mobile)
 * - DropdownMenu: Menu dropdown do shadcn/ui
 * 
 * @example
 * ```tsx
 * <Navbar />
 * ```
 */

export function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { notifications, isConnected } = useNotifications();

  /**
   * Contador de notificações não lidas
   * Usado para exibir o badge vermelho no ícone do sino
   */
  const unreadCount = notifications.filter(
    (notification) => !notification.lida,
  ).length;

  /**
   * Links principais da navegação desktop
   */
  const links = [
    { href: '/agente/reserva-rapida', label: 'Reserva Rápida' },
    { href: '/agente/lista-reserva', label: 'Lista de Reservas' },
    { href: '/agente/denuncias', label: 'Denúncias' },
    { href: '/agente/consulta', label: 'Consultar Placa' },
  ];

  return (
    <header className="bg-blue-800 text-white relative">
      <nav className="grid grid-cols-3 items-center p-4 max-w-6xl mx-auto md:flex md:justify-between">
        
        {/* 🔔 SINO - MOBILE */}
        <Link
          href="/agente/notificacoes"
          className="md:hidden flex items-center justify-start"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Bell className="h-6 w-6" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </Link>

        {/* LOGO */}
        <Link
          href="/agente/dashboard"
          className="flex justify-center md:justify-start"
        >
          <Image src={Logo} alt="Logo da Cptrans" className="w-16 h-auto" />
        </Link>

        {/* BOTÃO MENU - MOBILE */}
        <button
          className="md:hidden text-2xl hover:text-gray-300 flex justify-end"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          ☰
        </button>

        {/* MENU DESKTOP */}
        <ul className="hidden md:flex gap-6 text-lg items-center">
          {links.map(({ href, label }) => (
            <li key={href} className="hover:text-gray-300">
              <Link href={href}>{label}</Link>
            </li>
          ))}

          {/* PERFIL (Dropdown) */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-gray-300 focus:outline-none">
                Perfil
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                <DropdownMenuItem asChild>
                  <Link
                    href="/agente/perfil"
                    className="flex items-center gap-2 cursor-pointer w-full"
                  >
                    <User className="h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0 m-0 focus:bg-gray-100">
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {/* 🔔 SINO - DESKTOP */}
          <li>
            <Link
              href="/agente/notificacoes"
              className="relative flex items-center p-2 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label={`Notificações${
                unreadCount > 0 ? `, ${unreadCount} não lidas` : ''
              }`}
            >
              <Bell className="h-5 w-5" />

              {/* Badge de contador de não lidas */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}

              {/* Indicador de conexão offline */}
              {!isConnected && (
                <span
                  className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full h-2 w-2 animate-pulse"
                  title="Reconectando..."
                />
              )}
            </Link>
          </li>
        </ul>
      </nav>

      {/* MENU MOBILE (expansível) */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuAberto ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-4 bg-blue-500 p-4 shadow-md">
          
          {/* Seção: Reservas */}
          <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
            <span className="font-bold text-sm text-blue-200 uppercase">
              Reservas
            </span>
            <Link
              href="/agente/reserva-rapida"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Reservar Vaga
            </Link>
            <Link
              href="/agente/lista-reserva"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Lista de Reservas
            </Link>
          </li>

          {/* Seção: Consultas */}
          <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
            <span className="font-bold text-sm text-blue-200 uppercase">
              Consultas
            </span>
            <Link
              href="/agente/consulta"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Consultar Placa
            </Link>
          </li>

          {/* Seção: Notificações */}
          <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
            <span className="font-bold text-sm text-blue-200 uppercase">
              Notificações
            </span>
            <Link
              href="/agente/denuncias"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Ver Denúncias
            </Link>
          </li>

          {/* Seção: Perfil */}
          <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
            <span className="font-bold text-sm text-blue-200 uppercase">
              Perfil
            </span>
            <Link
              href="/agente/perfil"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Meu Perfil
            </Link>
            <div className="pl-2">
              <LogoutButton mobile={true} />
            </div>
          </li>
        </ul>
      </div>
    </header>
  );
}