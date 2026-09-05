import TrustStrip from "./TrustStrip";
import AboutSection from "./AboutSection";
import FeaturesSection from "./FeaturesSection";
import FAQSection from "./FAQSection";
import TestimonialsSection from "./TestimonialsSection";

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto flex max-w-[1312px] flex-col gap-6 px-6 pt-6 pb-16 md:gap-12 lg:gap-16 lg:pt-11">
      <div className="flex flex-col gap-6 lg:gap-16">
        <div className="flex max-w-[871px] flex-col gap-6">
          <span
            className="inline-flex h-12 w-fit items-center rounded-[10px] px-6 text-sm font-semibold text-white md:text-lg md:font-medium"
            style={{ backgroundColor: "var(--color-success-bg)" }}
          >
            For Small Shops, Big Receipts
          </span>

          <div className="flex flex-col gap-6">
            <h1 className="font-heading text-[64px] font-semibold leading-tight lg:text-[72px]">
              <span style={{ color: "var(--color-accent-highlight)" }}>
                Every Sale,
              </span>{" "}
              <span style={{ color: "var(--color-accent-light)" }}>
                Accounted For.
              </span>
            </h1>
            <p className="font-heading text-base font-normal text-[var(--color-text-secondary)] md:text-lg md:font-semibold lg:text-2xl">
              Reko turns your paper notebook into a system your whole team can
              trust, log sales in seconds, track stock automatically, and know
              exactly what stock was sold, how much you made and what
              remains
            </p>
          </div>
        </div>

        {/* Buttons: stacked full-width on mobile, side by side from tablet up */}
        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-[31px]">
          <a
            href="/signup"
            className="flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-primary)] px-6 font-heading text-xl font-semibold text-white transition hover:bg-[var(--color-primary-hover)] md:justify-start md:text-2xl"
          >
            Start Free Trial
          </a>
          <a
            href="/how-it-works"
            className="flex h-12 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-6 font-heading text-lg font-semibold text-white md:justify-start md:text-2xl"
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Dashboard preview mockup — placeholder until the real
          screenshot/mock asset is exported from Figma */}
      <div className="flex items-center justify-center">
        <div className="flex h-[216px] w-full max-w-full items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)] md:h-[400px] lg:h-[580px]">
          Dashboard preview image — pending asset export
        </div>
      </div>
      </section>
      <TrustStrip />
      <AboutSection />
      <FeaturesSection />
      <FAQSection />
      <TestimonialsSection />
    </>
  );
}
