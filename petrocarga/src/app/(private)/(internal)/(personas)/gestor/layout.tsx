import Footer from '@/components/gestor/layout/footer';
import { Metadata } from 'next';
import { MapProvider } from '@/contexts/MapContext';
import PrivateRoute from '@/contexts/PrivateRoute';
import { PushNotificationBanner } from '@/contexts/PushProvider/PushNotificationBanner';

/**
 * @module GestorLayout
 * @version 1.0.0
 *
 * @description Layout principal para a área de gestores.
 * Fornece a estrutura base com navbar, footer, proteção de rotas e contextos.
 *
 * ----------------------------------------------------------------------------
 * 📋 METADADOS:
 * ----------------------------------------------------------------------------
 */
export const metadata: Metadata = {
  title: 'PetroCarga',
  description:
    'O Petrocarga trás aos motoristas uma plataforma eficiente para gerenciamento de cargas e rotas.',
};

/**
 * @component GestorLayout
 * @description Componente de layout que envolve todas as páginas da área do gestor.
 *
 * ----------------------------------------------------------------------------
 * 🏗️ ESTRUTURA DO LAYOUT:
 * ----------------------------------------------------------------------------
 *
 * 1. PushNotificationBanner
 *    - Banner para solicitar permissão de notificações push
 *    - Gerencia o estado de permissão do usuário
 *
 * 2. Navbar
 *    - Barra de navegação superior com menu
 *    - Links para as principais funcionalidades do gestor
 *    - Informações do usuário logado
 *
 * 3. Main (conteúdo principal)
 *    - Envolto por PrivateRoute (proteção de rota)
 *    - Envolto por MapProvider (contexto do mapa)
 *    - Renderiza o conteúdo da página atual (children)
 *
 * 4. Footer
 *    - Rodapé com informações institucionais
 *    - Links úteis e copyright
 *
 * ----------------------------------------------------------------------------
 * 🛡️ PROTEÇÃO DE ROTAS:
 * ----------------------------------------------------------------------------
 *
 * - PrivateRoute: Verifica se o usuário está autenticado
 * - allowedRoles: ['GESTOR', 'ADMIN'] - apenas gestores e admins podem acessar
 * - Redireciona automaticamente para login se não autorizado
 *
 * ----------------------------------------------------------------------------
 * 🌍 CONTEXTOS:
 * ----------------------------------------------------------------------------
 *
 * - MapProvider: Contexto para compartilhamento de estado do mapa
 *   - Coordenadas selecionadas
 *   - Vagas no mapa
 *   - Interações com o mapa
 *
 * ----------------------------------------------------------------------------
 * 📦 ESTILOS GLOBAIS:
 * ----------------------------------------------------------------------------
 *
 * - Importa CSS do Mapbox Geocoder para funcionalidade de busca de endereços
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Navbar: Barra de navegação superior
 * - Footer: Rodapé da aplicação
 * - PrivateRoute: Componente de proteção de rotas
 * - MapProvider: Contexto do mapa
 * - PushNotificationBanner: Banner de permissão de notificações
 *
 * @example
 * ```tsx
 * // Uso no arquivo de layout do Next.js
 * // app/gestor/layout.tsx
 * export default function Layout({ children }) {
 *   return <GestorLayout>{children}</GestorLayout>;
 * }
 * ```
 *
 * @see /context/PrivateRoute.tsx - Proteção de rotas
 * @see /context/MapContext.tsx - Contexto do mapa
 * @see /context/PushProvider/PushNotificationBanner.tsx - Banner de notificações
 */

export default function GestorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Banner de notificações push */}
      <PushNotificationBanner />

      {/* Conteúdo principal com proteção de rota e contexto do mapa */}
      <main className="flex-1 relative">
        <PrivateRoute allowedRoles={['GESTOR', 'ADMIN']}>
          <MapProvider>{children}</MapProvider>
        </PrivateRoute>
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}
