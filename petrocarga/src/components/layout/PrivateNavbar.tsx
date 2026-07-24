'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDrawer } from '@/components/notification/notificatioDrawer';
import Logo from '../../../public/cache-images/logo.webp';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { LogoutButton } from '@/components/logoutButton/logoutButton';
import { getNavGroupsForRole, type NavGroup } from '@/lib/nav-config';

/**
 * @component CardLink
 * @description Componente de link em formato de card para menu mobile
 */
type CardLinkProps = {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
};

function CardLink({
  href,
  icon: Icon,
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
        <Icon className="h-5 w-5" />
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
 * @component DesktopGroup
 * @description Renderiza um grupo desktop: link direto (standalone) ou dropdown
 */
function DesktopGroup({ group }: { group: NavGroup }) {
  if (group.standalone) {
    const link = group.links[0];
    return (
      <li className="hover:text-gray-300">
        <Link href={link.href}>{link.label}</Link>
      </li>
    );
  }

  return (
    <li>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-gray-300 focus:outline-none">
          {group.title}
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
          {group.links.map((link) => {
            const Icon = link.icon;
            return (
              <DropdownMenuItem key={link.key} asChild>
                <Link
                  href={link.href}
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          {/* Perfil é o único grupo que carrega o botão de logout junto */}
          {group.key === 'suporte-perfil' && (
            <DropdownMenuItem className="p-0 m-0 focus:bg-gray-100">
              <LogoutButton />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

/**
 * @component Navbar
 * @version 2.0.0
 *
 * @description Barra de navegação principal, agora data-driven por permissão.
 * Os links exibidos (desktop e mobile) vêm de `getNavGroupsForRole(role)`,
 * definido em `lib/nav-config.ts`. Adicionar/remover/restringir um link
 * é uma mudança na config, não neste componente.
 *
 * Como essa navbar deve viver no layout raiz (fora dos route groups),
 * ela funciona igual em qualquer página, incluindo as de (shared).
 *
 * @example
 * ```tsx
 * <Navbar />
 * ```
 */
export function PrivateNavbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { user } = useAuth();

  const fecharMenu = () => setMenuAberto(false);

  // Assumindo que useAuth() expõe user.role. Ajuste aqui se o campo
  // tiver outro nome (ex: user.tipo, user.perfil, etc).
  const groups = getNavGroupsForRole(user?.permissao);

  return (
    <header className="bg-blue-800 text-white relative">
      <nav className="grid grid-cols-3 items-center p-4 max-w-6xl mx-auto md:flex md:justify-between">
        {/* ==================== SINO - MOBILE ==================== */}
        <div className="md:hidden flex items-center justify-start">
          <NotificationDrawer isMobile={true} />
        </div>

        {/* ==================== LOGO ==================== */}
        <Link
          href={`/${user?.permissao === 'ADMIN' ? 'gestor' : user?.permissao.toLocaleLowerCase()}/dashboard`}
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
          {groups.map((group) => (
            <DesktopGroup key={group.key} group={group} />
          ))}

          {/* Admin não possui grupo "perfil", então adiciona um dropdown apenas com o logout */}
          {user?.permissao === 'ADMIN' && (
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-gray-300 focus:outline-none">
                  Conta
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="bg-white text-gray-800 border border-gray-200">
                  <DropdownMenuItem className="p-0 m-0 focus:bg-gray-100">
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          )}

          {/* Notificações */}
          <li>
            <NotificationDrawer />
          </li>
        </ul>
      </nav>

      {/* ==================== MENU MOBILE  ==================== */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuAberto
            ? 'max-h-[calc(100vh-80px)] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-blue-800 p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col">
              {/* Título da Categoria */}
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-3 px-1">
                {group.title}
              </p>

              {/* GRID DE CARDS COM LÓGICA DE PREENCHIMENTO */}
              <div className="grid grid-cols-2 gap-3">
                {group.links.map((link, index) => {
                  // Lógica: Se o total de links for ímpar E este for o último link da lista,
                  // ele ocupa as 2 colunas para não deixar buraco.
                  const isLastOdd =
                    group.links.length % 2 !== 0 &&
                    index === group.links.length - 1;

                  return (
                    <div
                      key={link.key}
                      className={isLastOdd ? 'col-span-2' : 'col-span-1'}
                    >
                      <CardLink
                        href={link.href}
                        label={link.label}
                        description={link.description}
                        iconBg={link.iconBg}
                        iconColor={link.iconColor}
                        icon={link.icon}
                        onClick={fecharMenu}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout */}
          <div className="border-t border-blue-700 pt-4 flex justify-end">
            <LogoutButton mobile={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
