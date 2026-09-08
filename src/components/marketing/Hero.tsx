import Link from "next/link";

/*
  Hero — Figma nodes:
    web    218:5536 (1312x1026 @ y=181)  inner block w=871
    tablet 218:5538 (738x963   @ y=150)
    mobile 218:5543 (345x831   @ y=87)

  Per-breakpoint values taken directly from the file:
    outer gap        24 / 48 / 64
    headline         64/77 · 64/77 · 72/87   (DM Sans 600, -1px)
    subtext   Inter 400 16/24 · DM Sans 600 18/22 · DM Sans 600 24/29
    badge     Inter 600 14/20 (hug) · Inter 500 18/28 (w=319) · same
    CTA row   stacked · row gap-31 · row gap-31
    frame     h216 r10 · h580 r20 · h580 r28-top-only, image inset to 96.27%
*/

export default function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-6 px-6 pt-6 tab:gap-12 tab:px-12 tab:pt-12 web:items-center web:gap-16 web:px-16 web:pt-16">
      <div className="flex w-full flex-col items-center gap-6 tab:gap-12 web:w-[871px] web:gap-16">
        <div className="flex w-full flex-col items-center gap-6">
          {/* Eyebrow badge */}
          <div className="flex h-12 min-h-12 items-center justify-center rounded-md bg-primary-subtle px-6 tab:w-[319px]">
            <p className="whitespace-nowrap font-body text-[14px] font-semibold leading-[20px] text-text-primary tab:text-[18px] tab:font-medium tab:leading-[28px]">
              For Small Shops, Big Receipts
            </p>
          </div>

          {/* Headline + subtext */}
          <div className="flex w-full flex-col items-start gap-6 text-center tab:text-left">
            <h1 className="w-full font-heading text-[64px] font-semibold tracking-[-1px] text-primary-text web:text-[72px]">
              <span className="leading-[77px] text-green-100 web:leading-[87px]">
                Every Sale,
              </span>
              <span className="leading-[77px] web:leading-[87px]"> Accounted For.</span>
            </h1>

            {/*
              One paragraph that wraps, not three hard-coded lines.

              The design draws this as three lines, and it was built that way —
              but the first line does not actually fit the 871px column at
              24px, so it wrapped and left "sales" stranded on a line of its
              own. That happened at 1440 too, not just on narrower laptops.

              Letting it wrap inside a max-width gives the same three-line
              shape at the design width and degrades gracefully everywhere
              else, instead of breaking at one exact viewport size.
            */}
            <p className="mx-auto w-full max-w-[900px] text-center font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:font-heading tab:text-[18px] tab:font-semibold tab:leading-[22px] tab:tracking-[-1px] web:text-[24px] web:leading-[29px]">
              <span className="text-primary-text">JOHTA</span> turns your paper
              notebook into a system your whole team can trust, log sales in
              seconds, track stock automatically, and know exactly what stock
              was sold, how much you made and what remains
            </p>
          </div>
        </div>

        {/* CTAs — stacked on mobile, row from tablet up */}
        <div className="flex flex-col items-center gap-6 tab:flex-row tab:gap-[31px]">
          <Link
            href="/signup"
            className="press flex h-12 min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-on-primary tab:text-[24px] tab:leading-[29px]"
          >
            Start Free Trial
          </Link>
          <Link
            href="/how-it-works"
            className="press flex h-12 min-h-12 items-center justify-center whitespace-nowrap rounded-md border border-border-default px-6 font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-text-primary hover:border-primary-border tab:text-[24px] tab:leading-[29px]"
          >
            See How It Works
          </Link>
        </div>
      </div>

      {/* Dashboard preview frame */}
      <div className="relative h-[216px] w-full overflow-hidden rounded-[10px] border-[3px] border-border-subtle tab:h-[580px] tab:rounded-[20px] web:rounded-b-none web:rounded-t-[28px]">
        <div className="absolute inset-0 web:inset-auto web:left-1/2 web:top-7 web:w-[96.27%] web:-translate-x-1/2">
          <picture>
            <source
              media="(min-width: 834px) and (max-width: 1199px)"
              srcSet="/figma/hero-dashboard-tablet.webp"
            />
            <img
              src="/figma/hero-dashboard-web.webp"
              alt="The JOHTA dashboard showing today's sales, totals and recent entries"
              className="h-full w-full max-w-none object-cover tab:h-auto"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
