function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex h-12 w-fit items-center rounded-[10px] border px-6 font-heading text-sm font-semibold md:text-lg lg:text-2xl"
      style={{
        borderColor: "var(--color-primary-hover)",
        color: "var(--color-accent-light)",
      }}
    >
      {children}
    </span>
  );
}

export default function AboutHero() {
  return (
    <section className="mx-auto flex max-w-[1312px] flex-col gap-10 px-6 pt-6 pb-16 lg:flex-row lg:items-center lg:gap-16 lg:pt-11">
      <div className="flex flex-col gap-6 lg:w-[627px] lg:shrink-0">
        <Badge>Track your sale with ease.</Badge>
        <h1 className="font-heading text-[56px] font-semibold leading-tight md:text-[64px] lg:text-[72px]">
          Made for the shop, not the spreadsheet
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] md:text-xl md:font-heading md:font-semibold lg:text-2xl">
          Reko turns your paper notebook into a system your whole team can
          trust, log sales in seconds, track stock automatically, and know
          exactly what stock was sold, how much you made and what remains.
        </p>
      </div>
      <img
        src="/images/about-hero-dashboard.png"
        alt="Reko dashboard"
        className="h-auto w-full rounded-2xl border border-[var(--color-border)] lg:flex-1"
      />
    </section>
  );
}

export { Badge };
