import Footer from '@/components/gestor/layout/footer';
import { Metadata } from 'next';
import { MapProvider } from '@/context/MapContext';
import { Navbar } from '@/components/motorista/layout/navbar';
import PrivateRoute from '@/context/PrivateRoute';
import { PushNotificationBanner } from '@/context/PushProvider/PushNotificationBanner';
import { OnboardingProvider } from '@/context/OnboardingContext';
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
