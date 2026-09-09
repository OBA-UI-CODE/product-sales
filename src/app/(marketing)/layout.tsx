import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import IosInstallHint from "@/components/marketing/IosInstallHint";

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
      {/* Renders only on iPhone/iPad Safari, and only once. See the component
          for why the detection has to be this specific. */}
      <IosInstallHint />
    </div>
  );
}
