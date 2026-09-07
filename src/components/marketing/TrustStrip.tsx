/*
  Trust strip / niche pill marquee — Figma nodes:
    web    224:5593 (1440x140) band has top+bottom borders; track 1328x65 @ top 38
    tablet 29:410   (834x88)   no borders;                   track  827x48 @ top 20
    mobile 29:418   (393x49)   no borders;                   track  401x26 @ top 12

  Pill type changes per breakpoint (not just size):
    web    DM Sans 600 32/39 -1px, px-20 py-12
    tablet DM Sans 600 18/22 -1px, px-20 py-12
    mobile Inter   400 12/16,      px-8  py-4

  Figma lays the pills out at absolute offsets that repeat every 1485 / 962 /
  618px. Dividing that period by the measured pill widths gives inter-pill gaps
  of ~51.4 / 33.4 / 24.3 — i.e. the spacing tokens 48 / 32 / 24 (spacing/10, /8,
  /7), with a sub-pixel-per-pill rendering difference that grows with font size.
  Using the tokens rather than the derived decimals.

  Scroll duration is NOT specified anywhere in Figma — 30s is chosen, flagged.
*/

const NICHES = [
  "Salon & spa",
  "Hair & beauty",
  "Everyday trade",
  "Fashion & thrift",
  "Snacks & provision",
];

function PillSet({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-[var(--marquee-gap)]"
      aria-hidden={hidden || undefined}
    >
      {NICHES.map((label) => (
        <span
          key={label}
          className="flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-border-strong px-2 py-1 font-body text-[12px] font-normal leading-[16px] text-text-primary tab:px-5 tab:py-3 tab:font-heading tab:text-[18px] tab:font-semibold tab:leading-[22px] tab:tracking-[-1px] web:text-[32px] web:leading-[39px]"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default function TrustStrip() {
  return (
    <section className="flex h-[49px] w-full items-center overflow-hidden bg-info-subtle tab:h-[88px] web:h-[140px] web:border-y web:border-border-strong">
      <div className="mx-auto h-[26px] w-full overflow-hidden tab:h-[48px] tab:w-[827px] web:h-[65px] web:w-[1328px]">
        <div className="animate-marquee flex w-max items-center gap-[var(--marquee-gap)] [--marquee-gap:24px] tab:[--marquee-gap:32px] web:[--marquee-gap:48px]">
          <PillSet />
          <PillSet hidden />
        </div>
      </div>
    </section>
  );
}
