import Hero from "@/components/marketing/Hero";
import TrustStrip from "@/components/marketing/TrustStrip";
import AboutSection from "@/components/marketing/AboutSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import FAQSection from "@/components/marketing/FAQSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import FinalCTASection from "@/components/marketing/FinalCTASection";
import { SITE_URL } from "@/lib/site";

/*
  Tells Google, in its own vocabulary, what this site is called and what its
  logo looks like.

  Two things this changes in search results:

  · WebSite.name is what Google uses for the SITE NAME line above a result.
    Without it Google guesses, and for a new domain it tends to fall back to
    the bare address, "johta.click".
  · Organization.logo is the image Google may show for the brand. It has to be
    at least 112px square and crawlable; the 512px app icon is both.

  This is separate from the favicon beside a result, which Google takes from
  the <link rel="icon"> tags and /favicon.ico. Both are now in place, but
  Google caches favicons on its own schedule, so a new site can show a
  generic globe for days after everything is correct.
*/
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "JOHTA",
      alternateName: "johta.click",
      url: SITE_URL,
      inLanguage: "en-NG",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "JOHTA",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      email: "johtahelp@gmail.com",
      areaServed: "NG",
      /* Official profiles, so Google can tie them to the brand. */
      sameAs: [
        "https://x.com/JOHTA_NG",
        "https://www.facebook.com/share/1DimmNNQAn/",
      ],
    },
  ],
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
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
