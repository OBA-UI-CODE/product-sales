import TrustStrip from "../TrustStrip";
import FAQSection from "../FAQSection";
import TestimonialsSection from "../TestimonialsSection";

const FEATURES = [
  "Unlimited sales logging",
  "Automatic stock tracking",
  "Unlimited staff accounts",
  "Sales history & search",
  "WhatsApp receipts",
];

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 6L9 17l-5-5"
        stroke="var(--color-primary-hover)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PricingCard({
  planName,
  subLine,
  price,
  period,
}: {
  planName: string;
  subLine: string;
  price: string;
  period: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-canvas)] p-8">
      <div className="flex flex-col gap-2">
        <span className="font-heading text-lg font-semibold">{planName}</span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {subLine}
        </span>
      </div>

      <div className="flex items-end gap-1">
        <span className="font-heading text-[32px] font-semibold">
          {price}
        </span>
        <span className="pb-1 text-lg text-[var(--color-text-secondary)]">
          {period}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map((f) => (
          <div key={f} className="flex items-center gap-3">
            <CheckIcon />
            <span className="text-sm text-[var(--color-text-secondary)]">
              {f}
            </span>
          </div>
        ))}
      </div>

      <a
        href="/signup"
        className="flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-primary)] font-heading text-lg font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
      >
        Start free trial
      </a>
      <span className="text-center text-sm text-[var(--color-text-secondary)]">
        Cancel anytime, your data stays yours
      </span>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto flex max-w-[1312px] flex-col gap-16 px-6 pt-6 pb-16 lg:pt-11">
        <div className="flex flex-col gap-6">
          <span
            className="inline-flex h-12 w-fit items-center rounded-[10px] border px-6 font-heading text-sm font-semibold md:text-lg lg:text-2xl"
            style={{
              borderColor: "var(--color-primary-hover)",
              color: "var(--color-accent-light)",
            }}
          >
            Simple &amp; Transparent
          </span>
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-[56px] font-semibold leading-tight md:text-[64px] lg:text-[72px]">
              Simple pricing, no surprises
            </h1>
            <p className="text-base text-[var(--color-text-secondary)] md:text-xl md:font-heading md:font-semibold lg:text-2xl">
              Start free. Stay because it works.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <PricingCard
            planName="Reko Starter Plan"
            subLine="14 day free trial, no card required to start"
            price="₦ 1,599"
            period="/monthly"
          />
          <PricingCard
            planName="Reko Starter / Best Value"
            subLine="2 months free."
            price="₦ 15,990"
            period="/yearly"
          />
        </div>
      </section>

      <TrustStrip />
      <FAQSection />
      <TestimonialsSection />
    </>
  );
}
