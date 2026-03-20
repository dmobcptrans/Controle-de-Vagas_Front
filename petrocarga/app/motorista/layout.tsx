import Footer from '../../components/motorista/layout/footer';
import { Navbar } from '../../components/motorista/layout/navbar';
import { Metadata } from 'next';
import PrivateRoute from '@/context/PrivateRoute';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { MapProvider } from '@/context/MapContext';
import { PushNotificationBanner } from '@/context/PushProvider/PushNotificationBanner';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingModal from '@/components/modal/autorizacao/completar-cadastro/OnboardingModal';

/**
 * @module MotoristaLayout
 * @version 1.0.0
 *
 * @description Layout principal para a área de motoristas.
 * Fornece a estrutura base com navbar específica do motorista, footer, proteção de rotas e contextos.
 *
 * ----------------------------------------------------------------------------
 * 📋 METADADOS:
 * ----------------------------------------------------------------------------
 */
export const metadata: Metadata = {
  title: 'PetroCarga',
  description:
    'O Petrocarga trás aos motoristas uma plataforma eficiente para gerenciamento de cargas e rotas',
};

/**
 * @component MotoristaLayout
 * @description Componente de layout que envolve todas as páginas da área do motorista.
 *
 * ----------------------------------------------------------------------------
 * 🏗️ ESTRUTURA DO LAYOUT:
 * ----------------------------------------------------------------------------
 *
 * 1. PrivateRoute (proteção de rota)
 *    - Envolve todo o conteúdo
 *    - Verifica se usuário tem permissão 'MOTORISTA'
 *    - Redireciona para login se não autorizado
 *
 *    a) PushNotificationBanner
 *       - Banner para solicitar permissão de notificações push
 *       - Gerencia o estado de permissão do usuário
 *
 *    b) Navbar (versão motorista)
 *       - Barra de navegação superior específica para motoristas
 *       - Links: Perfil, Veículos, Reservas, Denúncias
 *       - Informações do motorista logado
 *
 *    c) Main (conteúdo principal)
 *       - Envolto por MapProvider (contexto do mapa)
 *       - Renderiza o conteúdo da página atual (children)
 *
 *    d) Footer
 *       - Rodapé com informações institucionais
 *       - Links úteis e copyright
 *
 * ----------------------------------------------------------------------------
 * 🛡️ PROTEÇÃO DE ROTAS:
 * ----------------------------------------------------------------------------
 *
 * - PrivateRoute: Verifica se o usuário está autenticado
 * - allowedRoles: ['MOTORISTA'] - apenas motoristas podem acessar
 * - Redireciona automaticamente para login se não autorizado
 * - Gestores e agentes não têm acesso a esta área
 *
 * ----------------------------------------------------------------------------
 * 🌍 CONTEXTOS:
 * ----------------------------------------------------------------------------
 *
 * - MapProvider: Contexto para compartilhamento de estado do mapa
 *   - Coordenadas selecionadas
 *   - Vagas disponíveis
 *   - Interações com o mapa (usado na reserva de vagas)
 *
 * ----------------------------------------------------------------------------
 * 📦 ESTILOS GLOBAIS:
 * ----------------------------------------------------------------------------
 *
 * - Importa CSS do Mapbox Geocoder para funcionalidade de busca de endereços
 * - Classe `motorista-layout` para estilização específica (se necessário)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Navbar (motorista): Barra de navegação específica do motorista
 * - Footer: Rodapé da aplicação
 * - PrivateRoute: Componente de proteção de rotas
 * - MapProvider: Contexto do mapa
 * - PushNotificationBanner: Banner de permissão de notificações
 *
 * @example
 * ```tsx
 * // Uso no arquivo de layout do Next.js
 * // app/motorista/layout.tsx
 * export default function Layout({ children }) {
 *   return <MotoristaLayout>{children}</MotoristaLayout>;
 * }
 * ```
 *
 * @see /src/components/motorista/layout/navbar.tsx - Navbar específica do motorista
 * @see /src/context/PrivateRoute.tsx - Proteção de rotas
 * @see /src/context/MapContext.tsx - Contexto do mapa
 */

export default function MotoristaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col motorista-layout">
      {/* Proteção de rota - apenas MOTORISTA pode acessar */}
      <PrivateRoute allowedRoles={['MOTORISTA']}>
        {/* Banner de notificações push */}
        <PushNotificationBanner />
        <OnboardingProvider>
          <Navbar />

        {/* Conteúdo principal com contexto do mapa */}
        <main className="flex-1 relative">
          <MapProvider>{children}</MapProvider>
        </main>

          <Footer />
          <OnboardingModal />
          </OnboardingProvider>
      </PrivateRoute>
    </div>
  );
}
