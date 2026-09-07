import AboutHero from "@/components/marketing/AboutHero";
import TrustStrip from "@/components/marketing/TrustStrip";
import AboutStory from "@/components/marketing/AboutStory";
import WhyJohta from "@/components/marketing/WhyJohta";
import MissionVision from "@/components/marketing/MissionVision";
import FinalCTASection from "@/components/marketing/FinalCTASection";

/*
  About page — Figma 104:478 (web) / 104:716 (tablet) / 104:938 (mobile)

  Order per the file: Nav (layout) -> Hero -> Trust strip -> Our Story ->
  Why JOHTA -> Mission/Vision -> Final CTA -> Footer (layout).

  Trust strip, Final CTA, Nav and Footer are the same components the landing
  page uses — the file reuses them verbatim.
*/
export default function AboutPage() {
  return (
    // Gap to the footer, measured from the file: 120 / 30 / 138
    // (mobile 4801->4921, tablet 3658->3688, web 4420->4558).
    <div className="pb-[120px] tab:pb-[30px] web:pb-[138px]">
      <AboutHero />
      <TrustStrip />
      <AboutStory />
      <WhyJohta />
      <MissionVision />
      <FinalCTASection />
    </div>
  );
}
