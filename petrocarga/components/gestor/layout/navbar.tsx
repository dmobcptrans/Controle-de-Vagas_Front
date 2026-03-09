'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logo from '@/public/Logo.png';
import Image from 'next/image';
import { LogoutButton } from '@/components/logoutButton/logoutButton';
import { useAuth } from '@/components/hooks/useAuth';
import { useNotifications } from '@/context/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, Bell, Users, UserCircle, List } from 'lucide-react';

export function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { notifications, isConnected } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.lida).length;

  useEffect(() => {
    setMounted(true);
  }, []);
  const isAdmin = mounted && user?.permissao === 'ADMIN';

  return (
    <header className="bg-blue-800 text-white relative">
      <nav className="p-4 max-w-[1400px] mx-auto flex items-center justify-between">
        {/* --- LADO ESQUERDO: SINO (MOBILE) / LOGO (DESKTOP/MOBILE) --- */}
        <div className="flex items-center justify-start md:w-1/4">
          {/* Sino Mobile */}
          <Link href="/gestor/notificacoes" className="relative p-2 md:hidden">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Logo */}
          <Link href="/gestor/relatorio" className="hidden md:block">
            <Image src={Logo} alt="Logo da Cptrans" className="w-16 h-auto" />
          </Link>
        </div>

        {/* --- CENTRO: LOGO (MOBILE) / LINKS (DESKTOP) --- */}
        <div className="flex items-center justify-center flex-1">
          {/* Logo no Mobile fica no centro */}
          <Link href="/gestor/relatorio" className="md:hidden">
            <Image src={Logo} alt="Logo da Cptrans" className="w-16 h-auto" />
          </Link>

          {/* Links Desktop */}
          <ul className="hidden md:flex gap-4 lg:gap-6 text-base lg:text-lg items-center whitespace-nowrap">
            <li className="hover:text-gray-300">
              <Link href="/gestor/relatorio">Relatório</Link>
            </li>

            <li>
              <DropdownMenu>
                <DropdownMenuTrigger
                  suppressHydrationWarning
                  className="flex items-center gap-1 hover:text-gray-300 focus:outline-none"
                >
                  Vagas <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                  <DropdownMenuItem asChild>
                    <Link href="/gestor/visualizar-vagas">
                      Visualizar Vagas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/gestor/adicionar-vagas">Adicionar Vaga</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>

            <li className="hover:text-gray-300">
              <Link href="/gestor/disponibilidade-vagas">Disponibilidade</Link>
            </li>

            <li className="hover:text-gray-300">
              <Link href="/gestor/reservas">Reservas</Link>
            </li>

            <li>
              <Link href="/gestor/consulta" className="hover:text-gray-300">
                Consultar Reserva
              </Link>
            </li>

            <li className="hover:text-gray-300">
              <Link href="/gestor/motoristas">Motoristas</Link>
            </li>

            <li>
              <DropdownMenu>
                <DropdownMenuTrigger
                  suppressHydrationWarning
                  className="flex items-center gap-1 hover:text-gray-300 focus:outline-none"
                >
                  Agentes <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/gestor/agentes"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" /> Agentes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/gestor/adicionar-agente"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" /> Adicionar
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>

            {isAdmin && (
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    suppressHydrationWarning
                    className="flex items-center gap-1 hover:text-gray-300 focus:outline-none"
                  >
                    Gestores <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/gestor/gestores"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" /> Gestores
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/gestor/adicionar-gestores"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" /> Adicionar
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )}

            <li>
              <DropdownMenu>
                <DropdownMenuTrigger
                  suppressHydrationWarning
                  className="flex items-center gap-1 hover:text-gray-300 focus:outline-none"
                >
                  Notificações <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/gestor/enviar-notificacoes"
                      className="flex items-center gap-2"
                    >
                      <List className="h-4 w-4" /> Enviar Notificações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/gestor/denuncias"
                      className="flex items-center gap-2"
                    >
                      <List className="h-4 w-4" /> Denúncias recebidas
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </div>

        {/* --- LADO DIREITO: SINO/PERFIL (DESKTOP) / HAMBURGUER (MOBILE) --- */}
        <div className="flex items-center justify-end md:w-1/4 gap-4">
          {/* Sino Desktop */}
          <Link
            href="/gestor/notificacoes"
            className="hidden md:flex relative p-2 hover:bg-blue-700 rounded-lg transition-colors items-center"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Perfil/Logout Desktop */}
          <div className="hidden md:block">
            {isAdmin ? (
              <LogoutButton />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  suppressHydrationWarning
                  className="flex items-center gap-1 hover:text-gray-300 focus:outline-none"
                >
                  Perfil <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/gestor/perfil"
                      className="flex items-center gap-2"
                    >
                      <UserCircle className="h-4 w-4" /> Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 m-0 focus:bg-gray-100">
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Hambúrguer Mobile */}
          <button
            className="text-2xl hover:text-gray-300 p-2 md:hidden"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* --- MENU MOBILE EXPANSÍVEL --- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuAberto ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <ul className="flex flex-col gap-4 bg-blue-500 p-4 shadow-md">
          <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
            <span className="font-bold text-sm text-blue-200 uppercase">
              Geral
            </span>
            {/* Relatório */}
            <Link
              href="/gestor/relatorio"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Relatório
            </Link>

            {/* Disponibilidade */}
            <Link
              href="/gestor/disponibilidade-vagas"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Disponibilidade
            </Link>

            {/* Disponibilidade */}
            <Link
              href="/gestor/reservas"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Reservas
            </Link>

            {/* Consultar Reserva por Placa */}
            <Link
              href="/gestor/consulta"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Consultar Reserva
            </Link>
          </li>
          <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
            <span className="font-bold text-sm text-blue-200 uppercase">
              Vagas
            </span>
            <Link
              href="/gestor/visualizar-vagas"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Visualizar Vagas
            </Link>
            <Link
              href="/gestor/adicionar-vagas"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Adicionar Vaga
            </Link>
          </li>
          <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
            <span className="font-bold text-sm text-blue-200 uppercase">
              Motoristas
            </span>
            <Link
              href="/gestor/motoristas"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Ver Motoristas
            </Link>
            <Link
              href="/gestor/denuncias"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Denúncias
            </Link>
            <Link
              href="/gestor/enviar-notificacoes"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Enviar Notificações
            </Link>
          </li>
          <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
            <span className="font-bold text-sm text-blue-200 uppercase">
              Agentes
            </span>
            <Link
              href="/gestor/agentes"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Ver Agentes
            </Link>
            <Link
              href="/gestor/adicionar-agente"
              onClick={() => setMenuAberto(false)}
              className="pl-2"
            >
              Adicionar Agente
            </Link>
          </li>
          {isAdmin && (
            <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
              <span className="font-bold text-sm text-yellow-300 uppercase">
                Admin
              </span>
              <Link
                href="/gestor/gestores"
                onClick={() => setMenuAberto(false)}
                className="pl-2"
              >
                Ver Gestores
              </Link>
              <Link
                href="/gestor/adicionar-gestores"
                onClick={() => setMenuAberto(false)}
                className="pl-2"
              >
                Adicionar Gestor
              </Link>
            </li>
          )}
          {!isAdmin && (
            <li className="flex flex-col gap-2 border-b border-blue-400 pb-2">
              <span className="font-bold text-sm text-blue-200 uppercase">
                Perfil
              </span>
              <Link
                href="/gestor/perfil"
                onClick={() => setMenuAberto(false)}
                className="pl-2"
              >
                Meu Perfil
              </Link>
            </li>
          )}
          <li className="mt-2">
            <LogoutButton mobile={true} />
          </li>
        </ul>
      </div>
    </header>
  );
}
