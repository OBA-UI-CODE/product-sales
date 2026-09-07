import PricingHero from "@/components/marketing/PricingHero";
import PricingPlans from "@/components/marketing/PricingPlans";
import FAQSection from "@/components/marketing/FAQSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";

/*
  Pricing page — Figma 130:4604 (web) / 130:4817 (tablet) / 130:5031 (mobile)

  Order per the file: Nav (layout) -> Hero -> Plans -> FAQ -> Testimonials
  -> Footer (layout).

  Note there is NO trust strip on this page. The previous build included one;
  the file's own heights rule it out (web body 3119 = hero+plans 1043 + 64 +
  FAQ 1020 + 64 + testimonials 928).
*/
export default function PricingPage() {
  return (
    // Gap to the footer, measured from the file: 42 / 49 / 75
    // (mobile 4661->4703, tablet 3535->3584, web 3300->3375). Testimonials is
    // the last section here, so without this it butts straight into the footer.
    <div className="pb-[42px] tab:pb-[49px] web:pb-[75px]">
      <PricingHero />
      <PricingPlans />
      <FAQSection />
      <TestimonialsSection />
    </div>
  );
}
