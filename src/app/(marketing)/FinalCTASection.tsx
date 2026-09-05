export default function FinalCTASection() {
  return (
    <section className="relative mx-auto flex max-w-[1312px] flex-col items-center gap-8 overflow-hidden px-6 py-16 text-center md:py-20 lg:py-24">
      {/* Decorative hollow-outline "Reko" background wordmark, repeated.
          The wave/ripple vector shapes behind it in Figma are a
          simplified omission here — not practical to recreate exactly
          from vector paths via the available tools; flagged in the plan. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-8 overflow-hidden opacity-40"
      >
        <span
          className="font-heading text-[120px] font-semibold md:text-[180px] lg:text-[250px]"
          style={{
            color: "transparent",
            WebkitTextStroke: "3px var(--color-primary-hover)",
          }}
        >
          Reko
        </span>
        <span
          className="hidden font-heading text-[250px] font-semibold md:inline"
          style={{
            color: "transparent",
            WebkitTextStroke: "6px var(--color-primary-hover)",
          }}
        >
          Reko
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="max-w-[836px] font-heading text-[32px] font-semibold leading-tight md:text-[48px] lg:text-[72px]">
            Stop losing track. Start with
            <br />
            Reko
          </h2>
          <p className="text-base font-semibold md:font-heading md:text-2xl">
            Set up your shop in five minutes. Free for 14 days.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <a
            href="/signup"
            className="flex h-12 items-center rounded-[10px] bg-[var(--color-primary)] px-8 font-heading text-xl font-semibold text-white transition hover:bg-[var(--color-primary-hover)] md:h-[62px] md:text-[32px]"
          >
            Start Free Trial
          </a>
          <p className="text-sm text-[var(--color-text-secondary)] md:text-2xl">
            No card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
