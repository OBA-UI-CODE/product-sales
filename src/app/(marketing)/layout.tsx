import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import ScrollReveal from "@/components/marketing/ScrollReveal";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-canvas">
      {/* Sets up the scroll reveal for every [data-reveal] on the page.
          Renders nothing; see ScrollReveal.tsx. */}
      <ScrollReveal />
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
