import { Metadata } from 'next';
import { MapProvider } from '@/contexts/MapContext';
import PrivateRoute from '@/contexts/PrivateRoute';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingCadastroModal from '@/components/modal/autorizacao/completar-cadastro/Onboardingcadastromodal';


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
        <OnboardingProvider>
          <OnboardingCadastroModal/>
          <main className="flex-1 relative">
            <MapProvider>{children}</MapProvider>
          </main>
        </OnboardingProvider>
      </PrivateRoute>
    </div>
  );
}
