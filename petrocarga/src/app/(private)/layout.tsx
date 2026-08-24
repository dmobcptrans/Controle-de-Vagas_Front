import Footer from "@/components/layout/Footer";
import { PrivateNavbar } from "@/components/layout/PrivateNavbar";
import { PushNotificationBanner } from "@/contexts/PushProvider/PushNotificationBanner";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PrivateNavbar />
      <PushNotificationBanner/>
      <main className="flex-1 relative">{children}</main>
      <Footer/>
    </div>
  );
}
