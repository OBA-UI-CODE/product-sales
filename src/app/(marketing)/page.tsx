export default function LandingPage() {
  return (
    <section className="mx-auto flex max-w-[1312px] flex-col gap-16 px-6 pt-11 pb-16">
      <div className="flex flex-col gap-16">
        <div className="flex max-w-[871px] flex-col gap-6">
          <span
            className="inline-flex h-12 w-fit items-center rounded-[10px] px-6 text-lg font-medium text-white"
            style={{ backgroundColor: "var(--color-success-bg)" }}
          >
            For Small Shops, Big Receipts
          </span>

          <div className="flex flex-col gap-6">
            <h1 className="font-heading text-[72px] font-semibold leading-tight">
              <span style={{ color: "var(--color-accent-highlight)" }}>
                Every Sale,
              </span>{" "}
              <span style={{ color: "var(--color-accent-light)" }}>
                Accounted For.
              </span>
            </h1>
            <p className="font-heading text-2xl font-semibold text-[var(--color-text-secondary)]">
              Reko turns your paper notebook into a system your whole team can
              trust, log sales in seconds, track stock automatically, and know
              exactly what stock was sold, how much you made and what
              remains
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[31px]">
          <a
            href="/signup"
            className="flex h-12 items-center rounded-[10px] bg-[var(--color-primary)] px-6 font-heading text-2xl font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Start Free Trial
          </a>
          <a
            href="/how-it-works"
            className="flex h-12 items-center rounded-[10px] border border-[var(--color-border)] px-6 font-heading text-2xl font-semibold text-white"
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Dashboard preview mockup — placeholder until the real
          screenshot/mock asset is exported from Figma */}
      <div className="flex h-[580px] items-center justify-center">
        <div className="flex h-[790px] w-[1263px] max-w-full items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)]">
          Dashboard preview image — pending asset export
        </div>
      </div>
    </section>
  );
}
