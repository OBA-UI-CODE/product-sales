import HowItWorksHero from "@/components/marketing/HowItWorksHero";
import HowItWorksSteps from "@/components/marketing/HowItWorksSteps";
import FinalCTASection from "@/components/marketing/FinalCTASection";

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
