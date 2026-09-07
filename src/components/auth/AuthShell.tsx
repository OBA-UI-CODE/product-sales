/*
  Shared shell for Sign In and Sign Up. Figma nodes:
    Sign In  180:10177 (web) / 180:10139 (tablet) / 180:10140 (mobile)
    Sign Up  183:1640  (web) / 183:1535  (tablet) / 183:1568  (mobile)

  The two columns REORDER across breakpoints, they do not merely stack:
    mobile  panel first (full-bleed 393x397), then the form
    tablet  form first (738 wide), then the panel (full width, 356 tall)
    web     form left (546) + 64 gap + panel right (742 x 852)

  Achieved with one DOM order (form, then panel) plus an order swap on mobile,
  so the form stays first in the document for keyboard and screen-reader users
  even where the panel is painted above it.

  The mobile column is max-w-345 rather than a fixed 345: the file draws it in
  a 393 frame, but on a 320 phone a hard 345 pushed the whole page sideways.

  IMPORTANT — panel coordinate origin differs by breakpoint:
    On web, the panel's contents live inside an inset box at left/top 48
    (Sign In 180:10138, Sign Up 183:1638), so every child offset the extractor
    reports is relative to THAT box, not the panel. On tablet and mobile the
    children sit directly on the panel. Applying the web offsets to the panel
    left the illustration ~38px short of the bottom edge instead of running
    past it. The image positions passed in by each page are therefore already
    converted into panel coordinates.

  The tagline gap is per-page (Sign In 408, Sign Up 331), not shared.
*/

type PanelProps = {
  headline: React.ReactNode;
  tagline: React.ReactNode;
  /* Fully positioned illustration block — each page owns its own geometry
     and crop, since the two differ in both. */
  image: React.ReactNode;
  /* Tailwind gap class for the web breakpoint, e.g. "web:gap-[408px]". */
  webTaglineGap: string;
};

export function AuthPanel({
  headline,
  tagline,
  image,
  webTaglineGap,
}: PanelProps) {
  return (
    <div className="relative h-[397px] w-full shrink-0 overflow-hidden bg-primary-subtle tab:h-[356px] tab:rounded-md web:h-[852px] web:w-[742px]">
      {image}

      {/* Copy — left/top 24 on mobile and tablet, 48 on web */}
      <div
        className={`absolute left-6 top-6 flex w-[281px] flex-col items-start gap-[166px] font-heading font-semibold tracking-[-1px] text-text-primary tab:left-[49px] tab:w-[411px] tab:gap-[47px] web:left-12 web:top-12 web:w-[467px] ${webTaglineGap}`}
      >
        {/* No whitespace-pre-wrap: line breaks are explicit <br>s, and some of
            them differ per breakpoint. */}
        <div className="w-full text-[32px] leading-[39px] tab:text-[48px] tab:leading-[58px] web:text-[64px] web:leading-[77px]">
          {headline}
        </div>
        <div className="whitespace-nowrap text-[18px] leading-[22px] tab:text-[24px] tab:leading-[29px] web:text-[32px] web:leading-[39px]">
          {tagline}
        </div>
      </div>
    </div>
  );
}

export default function AuthShell({
  form,
  panel,
}: {
  form: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-bg-canvas">
      <div className="flex flex-col items-center gap-6 tab:items-start tab:gap-12 tab:px-12 tab:pt-6 web:mx-auto web:max-w-[1440px] web:flex-row web:items-center web:gap-16 web:px-11 web:py-6">
        {/* Form — first in the DOM, painted second on mobile */}
        <div className="order-2 flex w-full max-w-[345px] shrink-0 flex-col items-start gap-6 px-4 pb-10 tab:order-1 tab:w-full tab:max-w-none tab:px-0 tab:gap-12 tab:pb-0 web:w-[546px] web:gap-16">
          {form}
        </div>
        <div className="order-1 w-full tab:order-2 web:w-auto">{panel}</div>
      </div>
    </main>
  );
}
