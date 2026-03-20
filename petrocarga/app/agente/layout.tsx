import Footer from '@/components/gestor/layout/footer';
import { Metadata } from 'next';
import { MapProvider } from '@/context/MapContext';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Navbar } from '@/components/agente/layout/navbar';
import PrivateRoute from '@/context/PrivateRoute';
import { PushNotificationBanner } from '@/context/PushProvider/PushNotificationBanner';

/**
 * @module AgenteLayout
 * @version 1.0.0
 *
 * @description Layout principal para a área de agentes.
 * Fornece a estrutura base com navbar específica do agente, footer, proteção de rotas e contextos.
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
 * @component AgenteLayout
 * @description Componente de layout que envolve todas as páginas da área do agente.
 *
 * ----------------------------------------------------------------------------
 * 🏗️ ESTRUTURA DO LAYOUT:
 * ----------------------------------------------------------------------------
 *
 * 1. PushNotificationBanner
 *    - Banner para solicitar permissão de notificações push
 *    - Gerencia o estado de permissão do usuário
 *
 * 2. Navbar (versão agente)
 *    - Barra de navegação superior específica para agentes
 *    - Links: Consultar Placa, Reservas Rápidas, Perfil, Notificações
 *    - Informações do agente logado
 *
 * 3. Main (conteúdo principal)
 *    - Envolto por PrivateRoute (proteção de rota)
 *    - Envolto por MapProvider (contexto do mapa)
 *    - Renderiza o conteúdo da página atual (children)
 *
 * 4. Footer (reutilizado do gestor)
 *    - Rodapé com informações institucionais
 *    - Links úteis e copyright
 *
 * ----------------------------------------------------------------------------
 * 🛡️ PROTEÇÃO DE ROTAS:
 * ----------------------------------------------------------------------------
 *
 * - PrivateRoute: Verifica se o usuário está autenticado
 * - allowedRoles: ['AGENTE'] - apenas agentes podem acessar
 * - Redireciona automaticamente para login se não autorizado
 * - Gestores e admins não têm acesso a esta área
 *
 * ----------------------------------------------------------------------------
 * 🌍 CONTEXTOS:
 * ----------------------------------------------------------------------------
 *
 * - MapProvider: Contexto para compartilhamento de estado do mapa
 *   - Coordenadas selecionadas
 *   - Vagas disponíveis
 *   - Interações com o mapa (usado na reserva rápida)
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
 * - Navbar (agente): Barra de navegação específica do agente
 * - Footer: Rodapé da aplicação (reutilizado)
 * - PrivateRoute: Componente de proteção de rotas
 * - MapProvider: Contexto do mapa
 * - PushNotificationBanner: Banner de permissão de notificações
 *
 * @example
 * ```tsx
 * // Uso no arquivo de layout do Next.js
 * // app/agente/layout.tsx
 * export default function Layout({ children }) {
 *   return <AgenteLayout>{children}</AgenteLayout>;
 * }
 * ```
 *
 * @see /src/components/agente/layout/navbar.tsx - Navbar específica do agente
 * @see /src/context/PrivateRoute.tsx - Proteção de rotas
 * @see /src/context/MapContext.tsx - Contexto do mapa
 */

export default function AgenteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Banner de notificações push */}
      <PushNotificationBanner />

      {/* Barra de navegação superior (versão agente) */}
      <Navbar />

      {/* Conteúdo principal com proteção de rota e contexto do mapa */}
      <main className="flex-1 relative">
        <PrivateRoute allowedRoles={['AGENTE']}>
          <MapProvider>{children}</MapProvider>
        </PrivateRoute>
      </main>

      {/* Rodapé (reutilizado do gestor) */}
      <Footer />
    </div>
  );
}
