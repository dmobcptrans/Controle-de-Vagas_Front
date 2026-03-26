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
import {
  ChevronDown,
  User,
  Bell,
  TriangleAlert,
  CarIcon,
  Archive,
  CalendarPlus,
} from 'lucide-react';

type CardLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
};

function CardLink({
  href,
  icon,
  label,
  description,
  iconBg,
  iconColor,
  onClick,
}: CardLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:bg-gray-50 hover:border-gray-200 transition-colors"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800 leading-tight">
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

/**
 * @component Navbar
 * @version 1.0.0
 *
 * @description Barra de navegação principal para a área do agente.
 * Responsiva com menu mobile em formato de cards, notificações em tempo real e dropdown de perfil.
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
 * 2. NAVEGAÇÃO MOBILE (CARDS):
 *    - Menu hambúrguer (☰) que expande/contrai
 *    - Seções organizadas em cards:
 *      - Reservas: Reservar vaga, Lista de reservas
 *      - Análise: Consultar reserva, Denúncias
 *      - Mais opções: Meu perfil
 *    - Botão de logout mobile destacado
 *
 * 3. NOTIFICAÇÕES:
 *    - useNotifications: contexto global com WebSocket
 *    - Contador de não lidas (unreadCount)
 *    - Badge vermelho com número (9+ para muitos)
 *    - Indicador de conexão (ponto amarelo piscando se offline)
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES DOS CARDS MOBILE:
 * ----------------------------------------------------------------------------
 *
 * | Seção       | Link               | Ícone       | Cor             |
 * |-------------|--------------------|-------------|-----------------|
 * | Reservas    | Reservar vaga      | CalendarPlus| 🔵 Azul         |
 * | Reservas    | Lista de reservas  | Archive     | 🟡 Amarelo      |
 * | Análise     | Consultar reserva  | CarIcon     | 🟢 Verde        |
 * | Análise     | Denúncias          | TriangleAlert| ⚪ Cinza        |
 * | Mais opções | Meu perfil         | User        | 🟣 Roxo         |
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - MENU MOBILE: Controlado por useState, transição CSS com max-height
 * - NOTIFICAÇÕES: Integração com contexto global para contagem em tempo real
 * - RESPONSIVIDADE: grid-cols-3 no mobile, flex no desktop
 * - ACESSIBILIDADE: aria-label com contador de notificações
 * - ANIMAÇÕES: pulsação no badge de notificações e no indicador de conexão
 * - CARDS: Menu mobile organizado em cards com ícones, títulos e descrições
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

  const fecharMenu = () => setMenuAberto(false);

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
        {/* ==================== SINO - MOBILE ==================== */}
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

        {/* ==================== LOGO ==================== */}
        <Link
          href="/agente/consulta"
          className="flex justify-center md:justify-start"
        >
          <Image src={Logo} alt="Logo da Cptrans" className="w-16 h-auto" />
        </Link>

        {/* ==================== BOTÃO MENU - MOBILE ==================== */}
        <button
          className="md:hidden text-2xl hover:text-gray-300 flex justify-end"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          ☰
        </button>

        {/* ==================== MENU DESKTOP ==================== */}
        <ul className="hidden md:flex gap-6 text-lg items-center">
          {links.map(({ href, label }) => (
            <li key={href} className="hover:text-gray-300">
              <Link href={href}>{label}</Link>
            </li>
          ))}

          {/* Dropdown Perfil */}
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

          {/* Ícone de Notificações (Desktop) */}
          <li>
            <Link
              href="/agente/notificacoes"
              className="relative flex items-center p-2 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label={`Notificações${
                unreadCount > 0 ? `, ${unreadCount} não lidas` : ''
              }`}
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}

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

      {/* ==================== MENU MOBILE (CARDS) ==================== */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuAberto ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-blue-800 p-4 space-y-5">
          {/* Seção: Reservas */}
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-widest mb-2 px-1">
              Reservas
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CardLink
                href="/agente/reserva-rapida"
                label="Reservar vaga"
                description="Nova reserva"
                iconBg="bg-blue-100"
                iconColor="text-blue-700"
                icon={<CalendarPlus className="h-5 w-5" />}
                onClick={fecharMenu}
              />
              <CardLink
                href="/agente/lista-reserva"
                label="Lista de reservas"
                description="Histórico"
                iconBg="bg-amber-100"
                iconColor="text-amber-700"
                icon={<Archive className="h-5 w-5" />}
                onClick={fecharMenu}
              />
            </div>
          </div>

          {/* Seção: Análise */}
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-widest mb-2 px-1">
              Análise
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CardLink
                href="/agente/consulta"
                label="Consultar reserva"
                description="Verificação"
                iconBg="bg-green-100"
                iconColor="text-green-700"
                icon={<CarIcon className="h-5 w-5" />}
                onClick={fecharMenu}
              />
              <CardLink
                href="/agente/denuncias"
                label="Denuncias"
                description="Ver denuncias"
                iconBg="bg-gray-100"
                iconColor="text-gray-500"
                icon={<TriangleAlert className="h-5 w-5" />}
                onClick={fecharMenu}
              />
            </div>
          </div>

          {/* Seção: Mais Opções */}
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-widest mb-2 px-1">
              Mais opções
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CardLink
                href="/agente/perfil"
                label="Meu perfil"
                description="Dados pessoais"
                iconBg="bg-purple-100"
                iconColor="text-purple-700"
                icon={<User className="h-5 w-5" />}
                onClick={fecharMenu}
              />
            </div>
          </div>

          {/* Logout */}
          <div className="border-gray-200 pt-3 flex justify-end">
            <LogoutButton mobile={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
