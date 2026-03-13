import Footer from '@/components/gestor/layout/footer';
import { Metadata } from 'next';
import { MapProvider } from '@/context/MapContext';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Navbar } from '@/components/gestor/layout/navbar';
import PrivateRoute from '@/context/PrivateRoute';
import { PushNotificationBanner } from '@/context/PushProvider/PushNotificationBanner';

export const metadata: Metadata = {
  title: 'PetroCarga',
  description:
    'O Petrocarga trás aos motoristas uma plataforma eficiente para gerenciamento de cargas e rotas.',
};

export default function GestorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PushNotificationBanner />
      <Navbar />
      <main className="flex-1 relative">
        <PrivateRoute allowedRoles={['GESTOR', 'ADMIN']}>
          <MapProvider>{children}</MapProvider>
        </PrivateRoute>
      </main>
      <Footer />
    </div>
  );
}
