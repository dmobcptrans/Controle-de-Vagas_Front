import Footer from '@/components/gestor/layout/footer';
import { Metadata } from 'next';
import { MapProvider } from '@/contexts/MapContext';
import { Navbar } from '@/components/motorista/layout/navbar';
import PrivateRoute from '@/contexts/PrivateRoute';
import { PushNotificationBanner } from '@/contexts/PushProvider/PushNotificationBanner';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingModal from '@/components/modal/autorizacao/completar-cadastro/OnboardingModal';


export const metadata: Metadata = {
  title: 'PetroCarga',
  description:
    'O Petrocarga trás aos motoristas uma plataforma eficiente para gerenciamento de cargas e rotas.',
};


export default function externalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PrivateRoute allowedRoles={['EMPRESA', "MOTORISTA"]}>
        <PushNotificationBanner />
        <OnboardingProvider>
          <OnboardingModal />
          <Navbar />

          <main className="flex-1 relative">
            <MapProvider>{children}</MapProvider>
          </main>

          <Footer />
        </OnboardingProvider>
      </PrivateRoute>
    </div>
  );
}
