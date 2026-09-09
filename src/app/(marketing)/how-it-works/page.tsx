import HowItWorksHero from "@/components/marketing/HowItWorksHero";
import HowItWorksSteps from "@/components/marketing/HowItWorksSteps";
import FinalCTASection from "@/components/marketing/FinalCTASection";

import type { Metadata } from "next";

/*
  Its own title and description. Every page used to inherit one set from the
  root layout, which tells a search engine these pages are interchangeable and
  gives it no reason to show this one for a relevant search. The canonical url
  states which address is the real one, so query strings and any preview
  domain do not compete with johta.click.
*/
export const metadata: Metadata = {
  title: "How It Works",
  description: "Set up your shop in five minutes, log a sale in under ten seconds, and see exactly what sold and what is left.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How It Works · JOHTA",
    description: "Set up your shop in five minutes, log a sale in under ten seconds, and see exactly what sold and what is left.",
    url: "/how-it-works",
  },
};

/*
  How it works — Figma 127:2245 (web) / 127:2395 (tablet) / 127:2533 (mobile)

  Order per the file: Nav (layout) -> Hero -> 3 steps -> Final CTA
  -> Footer (layout).

  Gap to the footer, measured from the file: 73 / 60 / 170
  (mobile 2261->2334, tablet 3187->3247, web 2512->2682).
*/
export default function HowItWorksPage() {
  return (
    <div className="pb-[73px] tab:pb-[60px] web:pb-[170px]">
      <HowItWorksHero />
      <HowItWorksSteps />
      <FinalCTASection />
    </div>
  );
}
