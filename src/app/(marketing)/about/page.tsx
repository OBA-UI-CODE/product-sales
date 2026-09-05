import TrustStrip from "../TrustStrip";
import FinalCTASection from "../FinalCTASection";
import AboutHero from "./AboutHero";
import OurStory from "./OurStory";
import WhyReko from "./WhyReko";
import MissionVision from "./MissionVision";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <TrustStrip />
      <OurStory />
      <WhyReko />
      <MissionVision />
      <FinalCTASection />
    </>
  );
}
