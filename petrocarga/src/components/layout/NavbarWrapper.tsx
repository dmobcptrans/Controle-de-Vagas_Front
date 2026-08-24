'use client';

import { useAuth } from '@/components/hooks/useAuth';
import { PrivateNavbar } from '@/components/layout/PrivateNavbar';
import { PublicNavbar } from '@/components/layout/PublicNavbar';

/**
 * @component NavbarWrapper
 * @version 1.0.0
 * 
 * @description Componente wrapper que renderiza a navbar apropriada baseada no estado de autenticação.
 * Exibe navbar privada para usuários logados e navbar pública para visitantes.
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. CARREGAMENTO:
 *    - Durante o carregamento da autenticação, não renderiza nada (return null)
 *    - Evita flash de conteúdo incorreto
 * 
 * 2. USUÁRIO AUTENTICADO:
 *    - Renderiza <PrivateNavbar /> com links dinâmicos baseados na permissão
 * 
 * 3. USUÁRIO NÃO AUTENTICADO:
 *    - Renderiza <PublicNavbar /> com links públicos (Introdução, Login, Quem Somos)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - CLIENT COMPONENT: Necessário para usar useAuth
 * - LOADING STATE: Retorna null enquanto carrega, evitando conteúdo inconsistente
 * - SEPARAÇÃO DE RESPONSABILIDADES: Wrapper decide qual navbar renderizar
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useAuth: Hook de autenticação
 * - PrivateNavbar: Navbar para usuários autenticados
 * - PublicNavbar: Navbar para visitantes
 * 
 * @example
 * ```tsx
 * // Uso no layout principal
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <NavbarWrapper />
 *         <main>{children}</main>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

export function NavbarWrapper() {
  const { user, loading } = useAuth();

  // Durante o carregamento, não renderiza nada para evitar flash
  if (loading) return null;

  // Renderiza navbar apropriada baseada na autenticação
  return user ? <PrivateNavbar /> : <PublicNavbar />;
}