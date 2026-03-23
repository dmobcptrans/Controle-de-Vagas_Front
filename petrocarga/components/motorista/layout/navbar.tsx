'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/public/Logo.png';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CarIcon,
  ChevronDown,
  User,
  Bell,
  TriangleAlert,
  Archive,
  CalendarPlus,
  PlusCircle,
} from 'lucide-react';
import { LogoutButton } from '@/components/logoutButton/logoutButton';
import { useNotifications } from '@/context/NotificationContext';

/**
 * @component CardLink
 * @description Componente de link em formato de card para menu mobile
 */
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
        <p className="text-sm font-medium text-gray-800 leading-tight">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

/**
 * @component Navbar
 * @version 1.0.0
 * 
 * @description Barra de navegação principal para a área do motorista.
 * Responsiva com menu mobile em formato de cards, notificações em tempo real e dropdowns.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. NAVEGAÇÃO DESKTOP:
 *    - Link principal: "Reservar Vaga"
 *    - Dropdown "Reservas": Minhas Reservas, Minhas Denúncias
 *    - Dropdown "Veículo": Meu Veículo, Adicionar Veículo
 *    - Dropdown "Perfil": Meu Perfil, Sair
 *    - Ícone de notificações com contador
 * 
 * 2. NAVEGAÇÃO MOBILE (CARDS):
 *    - Seções: Reservas, Veículos, Mais Opções
 *    - Cada link em formato de card com ícone, título e descrição
 *    - Cores diferenciadas por seção (azul, âmbar, verde, vermelho, roxo)
 * 
 * 3. NOTIFICAÇÕES:
 *    - Contador de não lidas (unreadCount)
 *    - Badge vermelho com número (9+)
 *    - Indicador de conexão (ponto amarelo)
 * 
 * ----------------------------------------------------------------------------
 * 🎨 CORES DOS CARDS MOBILE:
 * ----------------------------------------------------------------------------
 * 
 * | Seção       | Link               | Ícone       | Cor             |
 * |-------------|--------------------|-------------|-----------------|
 * | Reservas    | Reservar vaga      | CalendarPlus| 🔵 Azul         |
 * | Reservas    | Minhas reservas    | Archive     | 🟡 Amarelo      |
 * | Veículos    | Meu veículo        | CarIcon     | 🟢 Verde        |
 * | Veículos    | Adicionar veículo  | PlusCircle  | ⚪ Cinza        |
 * | Mais Opções | Minhas denúncias   | TriangleAlert| 🔴 Vermelho     |
 * | Mais Opções | Meu perfil         | User        | 🟣 Roxo         |
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - LogoutButton: Botão de logout
 * - useNotifications: Contexto de notificações
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

  const unreadCount = notifications.filter(
    (notification) => !notification.lida,
  ).length;

  const fecharMenu = () => setMenuAberto(false);

  return (
    <header className="bg-blue-800 text-white relative">
      <nav className="grid grid-cols-3 items-center p-4 max-w-6xl mx-auto md:flex md:justify-between">
        
        {/* ==================== SINO - MOBILE ==================== */}
        <Link
          href="/motorista/notificacoes"
          className="md:hidden flex items-center justify-start"
          onClick={fecharMenu}
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
          href="/motorista/dashboard"
          className="flex justify-center md:justify-start"
          onClick={fecharMenu}
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
          <li className="hover:text-gray-300">
            <Link href="/motorista/dashboard">Dashboard</Link>
          </li>
          <li className="hover:text-gray-300">
            <Link href="/motorista/reservar-vaga">Reservar Vaga</Link>
          </li>

          {/* Dropdown Reservas */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-gray-300 focus:outline-none">
                Reservas
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                <DropdownMenuItem asChild>
                  <Link href="/motorista/reservas" className="flex items-center gap-2 cursor-pointer w-full">
                    <Archive className="h-4 w-4" />
                    Minhas Reservas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/motorista/reservas/minhas-denuncias" className="flex items-center gap-2 cursor-pointer w-full">
                    <TriangleAlert className="h-4 w-4" />
                    Minhas Denúncias
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {/* Dropdown Veículo */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-gray-300 focus:outline-none">
                Veículo
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                <DropdownMenuItem asChild>
                  <Link href="/motorista/veiculos/meus-veiculos" className="flex items-center gap-2 cursor-pointer w-full">
                    <CarIcon className="h-4 w-4" />
                    Meu Veículo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/motorista/veiculos/cadastrar-veiculos" className="flex items-center gap-2 cursor-pointer w-full">
                    <CarIcon className="h-4 w-4" />
                    Adicionar Veículo
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {/* Dropdown Perfil */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-gray-300 focus:outline-none">
                Perfil
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                <DropdownMenuItem asChild>
                  <Link href="/motorista/perfil" className="flex items-center gap-2 cursor-pointer w-full">
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

          {/* Notificações Desktop */}
          <li>
            <Link
              href="/motorista/notificacoes"
              className="relative flex items-center gap-1 hover:text-gray-300 p-2 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {!isConnected && (
                <span className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full h-2 w-2 animate-pulse" title="Reconectando..." />
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
        <div className="bg-blue-800 p-4  space-y-5">

          {/* Seção: Reservas */}
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-widest mb-2 px-1">
              Reservas
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CardLink
                href="/motorista/reservar-vaga"
                label="Reservar vaga"
                description="Nova reserva"
                iconBg="bg-blue-100"
                iconColor="text-blue-700"
                icon={<CalendarPlus className="h-5 w-5" />}
                onClick={fecharMenu}
              />
              <CardLink
                href="/motorista/reservas"
                label="Minhas reservas"
                description="Histórico"
                iconBg="bg-amber-100"
                iconColor="text-amber-700"
                icon={<Archive className="h-5 w-5" />}
                onClick={fecharMenu}
              />
            </div>
          </div>

          {/* Seção: Veículos */}
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-widest mb-2 px-1">
              Veículos
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CardLink
                href="/motorista/veiculos/meus-veiculos"
                label="Meu veículo"
                description="Ver cadastro"
                iconBg="bg-green-100"
                iconColor="text-green-700"
                icon={<CarIcon className="h-5 w-5" />}
                onClick={fecharMenu}
              />
              <CardLink
                href="/motorista/veiculos/cadastrar-veiculos"
                label="Adicionar veículo"
                description="Novo cadastro"
                iconBg="bg-gray-100"
                iconColor="text-gray-500"
                icon={<PlusCircle className="h-5 w-5" />}
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
                href="/motorista/reservas/minhas-denuncias"
                label="Minhas denúncias"
                description="Ver ocorrências"
                iconBg="bg-red-100"
                iconColor="text-red-700"
                icon={<TriangleAlert className="h-5 w-5" />}
                onClick={fecharMenu}
              />
              <CardLink
                href="/motorista/perfil"
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
          <div className=" border-gray-200 pt-3 flex justify-end">
            <LogoutButton mobile={true} />
          </div>
        </div>
      </div>
    </header>
  );
}