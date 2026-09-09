import PricingHero from "@/components/marketing/PricingHero";
import PricingPlans from "@/components/marketing/PricingPlans";
import FAQSection from "@/components/marketing/FAQSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";

import type { Metadata } from "next";

/*
  Its own title and description. Every page used to inherit one set from the
  root layout, which tells a search engine these pages are interchangeable and
  gives it no reason to show this one for a relevant search. The canonical url
  states which address is the real one, so query strings and any preview
  domain do not compete with johta.click.
*/
export const metadata: Metadata = {
  title: "Pricing",
  description: "₦1,599 a month or ₦15,990 a year, with the first month free. No card needed to start, cancel any time.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing · JOHTA",
    description: "₦1,599 a month or ₦15,990 a year, with the first month free. No card needed to start, cancel any time.",
    url: "/pricing",
  },
};

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
