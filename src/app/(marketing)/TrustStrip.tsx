const NICHES = [
  "Salon & spa",
  "Hair & beauty",
  "Everyday trade",
  "Fashion & thrift",
  "Snacks & provision",
];

function Pill({ label }: { label: string }) {
  return (
    <span className="flex shrink-0 items-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-3 py-1.5 font-heading text-xs font-semibold text-white md:gap-2 md:px-4 md:py-2 md:text-lg lg:px-5 lg:py-3 lg:text-[32px]">
      {label}
    </span>
  );
}

export default function TrustStrip() {
  return (
    <section
      className="flex items-center overflow-hidden py-3 md:py-5 lg:py-9"
      style={{ backgroundColor: "#00161c" }}
    >
      <div className="flex w-max shrink-0 animate-marquee gap-2 md:gap-3 lg:gap-2.5">
        {[...NICHES, ...NICHES].map((label, i) => (
          <Pill key={i} label={label} />
        ))}
      </div>
      {/* Duplicate track for a seamless loop */}
      <div
        className="flex w-max shrink-0 animate-marquee gap-2 md:gap-3 lg:gap-2.5"
        aria-hidden="true"
      >
        {[...NICHES, ...NICHES].map((label, i) => (
          <Pill key={i} label={label} />
        ))}
      </div>
    </section>
  );
}
