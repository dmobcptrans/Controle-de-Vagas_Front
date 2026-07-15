import { Navbar } from '@/components/motorista/layout/navbar';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 relative">{children}</main>
    </div>
  );
}
