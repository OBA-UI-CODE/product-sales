/*
  Features — Figma nodes:
    web    43:594 (1312x2356) heading 34:444 + rows 33:428 / 37:472 / 37:473
    tablet 43:541 (738x4044)  heading 37:466 + 5 stacked cards
    mobile 43:593 (345x2755)  heading 43:502 + 5 stacked cards

  Layout: on web the first card is full width, then two rows of two (632 + 64
  gap + 616 = 1312). On tablet and mobile all five stack full width.
  Card heights are fixed in the file: 657 (web/tablet), 420 (mobile); the first
  card is 657 / 842 / 733.

  Type per breakpoint:
    title  DM Sans 600  48/58 -1  ->  mobile 24/29 -1
    body   DM Sans 600  24/29 -1  ->  mobile Inter 400 16/24
    text block inset     64,64    ->  mobile 16,52

  Images: each illustration is the SAME source asset at every breakpoint with
  the same inner crop; only the box geometry changes, so lefts/widths are
  percentages of the card and tops/heights are the file's pixel values.
  The iPhone mockup is a masked, mirrored 4-asset composite in Figma; it is
  used here as a single flattened export of that group (feat-phone.webp) — a
  deliberate simplification, flagged rather than silently done. Its natural
  height always exceeds the visible area, so the card's overflow clip
  reproduces the design's crop at all three breakpoints.
*/

const CARD =
  "relative overflow-hidden rounded-md border-[1.5px] border-border-strong bg-bg-surface";
const TITLE =
  "font-heading font-semibold tracking-[-1px] text-text-primary text-[24px] leading-[29px] tab:text-[48px] tab:leading-[58px]";
const BODY =
  "font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:font-heading tab:text-[24px] tab:font-semibold tab:leading-[29px] tab:tracking-[-1px]";
const TEXT_BLOCK =
  "absolute left-4 top-[52px] flex flex-col items-start gap-6 tab:left-16 tab:top-16 tab:w-[435px]";

export default function FeaturesSection() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 pt-6 tab:gap-12 tab:px-12 tab:pt-12 web:gap-16 web:px-16 web:pt-16">
      {/* Heading */}
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex min-h-12 items-center justify-center rounded-md border border-primary-border px-6">
          <p className="whitespace-nowrap font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-primary-text tab:text-[24px] tab:leading-[29px]">
            Features
          </p>
        </div>
        <div className="mx-auto flex w-full max-w-[327px] flex-col items-center gap-6 text-center tab:max-w-[530px] web:max-w-[889px]">
          <h2 className="w-full font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:text-[48px] tab:leading-[58px] web:text-[56px] web:leading-[68px]">
            Everything your notebook couldn’t do
          </h2>
          <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:font-heading tab:text-[24px] tab:font-semibold tab:leading-[29px] tab:tracking-[-1px]">
            Six reasons shop owners stop carrying the black book everywhere.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex w-full flex-col gap-6 tab:gap-16">
        {/* 1 — Fast sale entry + Automatic stock tracking (shared dashboard) */}
        <div className={`${CARD} h-[733px] w-full tab:h-[842px] web:h-[657px]`}>
          <div className="absolute left-4 top-10 flex flex-col items-start gap-6 tab:left-16 tab:top-16 tab:gap-12 web:w-[470px] web:gap-[220px]">
            <div className="flex flex-col items-start gap-6">
              <p className={`${TITLE} whitespace-nowrap`}>Fast sale entry</p>
              <div className={BODY}>
                <p>Log a sale in under ten seconds.</p>
                <p>Built for busy counters, not spreadsheets</p>
              </div>
            </div>
            <div className="flex w-[312px] flex-col items-start gap-6 tab:w-auto">
              <p className={`${TITLE} whitespace-nowrap`}>
                Automatic stock tracking
              </p>
              <div className={`${BODY} w-[303px] tab:w-auto`}>
                <p className="tab:hidden">
                  Every sale updates your stock in real time. Every restock does
                  too. No manual counting.
                </p>
                <p className="hidden tab:block">
                  Every sale updates your stock in real time.
                </p>
                <p className="hidden tab:block">
                  Every restock does too. No manual counting.
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard screenshot — different crop per breakpoint */}
          <div className="absolute left-[9.86%] top-[397px] h-[336px] w-[90.14%] overflow-hidden rounded-tl-md border-2 border-border-strong tab:left-[22.76%] tab:top-[488px] tab:h-[354px] tab:w-[77.24%] web:left-[44.59%] web:top-[122px] web:h-[546px] web:w-[66.62%] web:rounded-md web:border-[3px]">
            <picture>
              <source
                media="(min-width: 834px) and (max-width: 1439px)"
                srcSet="/figma/feat-dash-tab.webp"
              />
              <source media="(max-width: 833px)" srcSet="/figma/feat-dash-mob.webp" />
              <img
                src="/figma/hero-dashboard-web.webp"
                alt="JOHTA dashboard listing today's sales"
                className="absolute left-0 top-0 h-full w-[172.67%] max-w-none object-cover object-left-top tab:h-[200.28%] tab:w-full web:h-full web:w-full"
              />
            </picture>
          </div>
        </div>

        {/* 2 + 3 — web row */}
        <div className="flex flex-col gap-6 tab:gap-16 web:flex-row web:gap-16">
          {/* Multiple staff, one record */}
          <div className={`${CARD} h-[420px] w-full tab:h-[657px] web:flex-[632_0_0]`}>
            <div className={TEXT_BLOCK}>
              <p className={`${TITLE} whitespace-nowrap tab:whitespace-normal`}>
                Multiple staff, one record
              </p>
              <p className={`${BODY} w-[293px] tab:w-full`}>
                Everyone on your team logs sales under their own name, so you
                know who sold what.
              </p>
            </div>
            <div className="absolute left-[4.06%] top-[204px] h-[216px] w-[91.88%] overflow-hidden tab:left-[5.56%] tab:top-[296px] tab:h-[418px] tab:w-[83.33%] web:left-[6.49%] web:top-[333px] web:h-[344px] web:w-[80.06%]">
              <img
                src="/figma/feat-team.webp"
                alt="Shop staff working together"
                className="absolute left-0 top-[-47.09%] h-[147.09%] w-full max-w-none"
              />
            </div>
          </div>

          {/* Fix mistakes easily */}
          <div className={`${CARD} h-[420px] w-full tab:h-[657px] web:flex-[616_0_0]`}>
            <div className={TEXT_BLOCK}>
              <p className={`${TITLE} whitespace-nowrap tab:whitespace-normal`}>
                Fix mistakes easily
              </p>
              <p className={`${BODY} w-[293px] tab:w-full`}>
                Entered the wrong price? Edits or delete a sale after the fact,
                your stock and totals adjust automatically.
              </p>
            </div>
            <div className="absolute left-[33.62%] top-[221px] h-[210px] w-[61.45%] overflow-hidden tab:left-[36.99%] tab:top-[265px] tab:h-[446px] tab:w-[61.11%] web:left-[26.79%] web:top-[281px] web:h-[446px] web:w-[73.21%]">
              <img
                src="/figma/feat-edit-icon.webp"
                alt=""
                className="absolute left-[-13.04%] top-[-9.22%] h-[122.63%] w-[121.4%] max-w-none"
              />
            </div>
          </div>
        </div>

        {/* 4 + 5 — web row */}
        <div className="flex flex-col gap-6 tab:gap-16 web:flex-row web:gap-16">
          {/* Works on any phone */}
          <div className={`${CARD} h-[420px] w-full tab:h-[657px] web:flex-[632_0_0]`}>
            <div className={TEXT_BLOCK}>
              <p className={`${TITLE} whitespace-nowrap tab:whitespace-normal`}>
                Works on any phone
              </p>
              {/*
                NOTE: this body text is identical to "Multiple staff, one
                record" in the Figma file at all three breakpoints — an
                un-updated copy/paste in the design, not a transcription error
                here. Reproduced as-is because the intended copy is unknown.
              */}
              <p className={`${BODY} w-[293px] tab:w-full`}>
                Everyone on your team logs sales under their own name, so you
                know who sold what.
              </p>
            </div>
            {/*
              Centred, not right-aligned. Figma specifies this one with
              left/right percentages (left 20.99% / right 21.04% on web) rather
              than an explicit left, i.e. symmetric. Widths are the file's:
              210.1/345, 409.1/738, 366.3/632.
            */}
            <div className="absolute left-1/2 top-[210px] w-[60.91%] -translate-x-1/2 tab:top-[263px] tab:w-[55.43%] web:top-[257px] web:w-[57.96%]">
              <img
                src="/figma/feat-phone.webp"
                alt="JOHTA running on a phone"
                className="h-auto w-full max-w-none"
              />
            </div>
          </div>

          {/* Search your history */}
          <div className={`${CARD} h-[420px] w-full tab:h-[657px] web:flex-[616_0_0]`}>
            <div className={TEXT_BLOCK}>
              <p className={`${TITLE} whitespace-nowrap tab:whitespace-normal`}>
                Search your history
              </p>
              <p className={`${BODY} w-[293px] tab:w-full`}>
                Find any sale by date in seconds. Your whole sales history,
                always at your finger tips.
              </p>
            </div>
            <div className="absolute left-[35.07%] top-[220px] h-[237px] w-[82.9%] overflow-hidden tab:left-[41.6%] tab:top-[278px] tab:h-[439px] tab:w-[71.82%] web:left-[30.52%] web:top-[300px] web:h-[439px] web:w-[86.04%]">
              <img
                src="/figma/feat-globe.webp"
                alt=""
                className="absolute left-[-26.19%] top-0 h-full w-[148.28%] max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
