import { PublicNavbar } from "@/components/layout/PublicNavbar";
import Footer from "@/components/gestor/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1 relative">{children}</main>
      <Footer/>
    </div>
  );
}
