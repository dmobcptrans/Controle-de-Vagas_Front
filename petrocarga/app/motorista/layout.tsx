import Footer from '../../components/motorista/layout/footer';
import { Navbar } from '../../components/motorista/layout/navbar';
import { Metadata } from 'next';
import PrivateRoute from '@/context/PrivateRoute';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { MapProvider } from '@/context/MapContext';
import { PushNotificationBanner } from '@/context/PushProvider/PushNotificationBanner';

export const metadata: Metadata = {
  title: 'PetroCarga',
  description:
    'O Petrocarga trás aos motoristas uma plataforma eficiente para gerenciamento de cargas e rotas',
};

export default function MotoristaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col motorista-layout">
      <PrivateRoute allowedRoles={['MOTORISTA']}>
        <PushNotificationBanner />
          <Navbar />

          <main className="flex-1 relative">
            <MapProvider>{children}</MapProvider>
          </main>

          <Footer />
      </PrivateRoute>
    </div>
  );
}
