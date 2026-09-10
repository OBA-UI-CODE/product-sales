import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import InstallApp from "@/components/InstallApp";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-canvas">
      <Nav />
      <main>{children}</main>
      <Footer />
      {/* A real "Install JOHTA" button: installs in one tap on Android, opens
          a step-by-step guide on iPhone. Hidden once installed. */}
      <InstallApp variant="floating" />
    </div>
  );
}
