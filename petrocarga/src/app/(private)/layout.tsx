import { Navbar } from "@/components/motorista/layout/navbar";
import { Toaster } from "react-hot-toast";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
        <Toaster position="top-center" />
      <Navbar />
      <main className="flex-1 relative">{children}</main>
    </div>
  );
}