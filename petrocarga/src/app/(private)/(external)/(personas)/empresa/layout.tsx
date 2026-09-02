import PrivateRoute from '@/contexts/PrivateRoute';

export default function EmpresaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Conteúdo principal com proteção de rota e contexto do mapa */}
      <main className="flex-1 relative">
        <PrivateRoute allowedRoles={['EMPRESA']}>
          {children}
        </PrivateRoute>
      </main>
    </div>
  );
}
