import { Metadata } from 'next';
import { MapProvider } from '@/contexts/MapContext';
import PrivateRoute from '@/contexts/PrivateRoute';

export const metadata: Metadata = {
  title: 'PetroCarga',
  description:
    'O Petrocarga trás aos motoristas uma plataforma eficiente para gerenciamento de cargas e rotas.',
};


export default function internalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PrivateRoute allowedRoles={['GESTOR', "AGENTE", "ADMIN"]}>
          <main className="flex-1 relative">
            <MapProvider>{children}</MapProvider>
          </main>
      </PrivateRoute>
    </div>
  );
}
