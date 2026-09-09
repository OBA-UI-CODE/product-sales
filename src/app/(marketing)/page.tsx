import Hero from "@/components/marketing/Hero";
import TrustStrip from "@/components/marketing/TrustStrip";
import AboutSection from "@/components/marketing/AboutSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import FAQSection from "@/components/marketing/FAQSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import FinalCTASection from "@/components/marketing/FinalCTASection";

/*
  Landing Page — Figma 19:4 (web) / 19:6 (tablet) / 19:7 (mobile)

  Section order per the file:
    Nav (in layout) -> Hero -> Trust strip -> About -> Features -> Testimonials ->
    FAQ -> Final CTA -> Footer (in layout)
*/
export default function LandingPage() {
  return (
    // Gap to the footer, measured from the file: 156 / 79 / 105
    // (mobile 7305->7461, tablet 8565->8644, web 6988->7093).
    <div className="pb-[156px] tab:pb-[79px] web:pb-[105px]">
      <Hero />
      <TrustStrip />
      <AboutSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
}
