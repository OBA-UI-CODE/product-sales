/*
  About JOHTA — Figma nodes:
    web    65:606 (1312x506) gap 64 · block h394 · heading 56/68 · body 32/39 @ left 685 top 160 (w 627)
    tablet 66:615 (738x410)  gap 48 · block h314 · heading 48/58 · body 24/29 @ left 260 top 140
    mobile 66:627 (345x318)  gap 24 · block h246 · heading 32/39 (w 324) · body Inter 16/24 @ left 16 top 102

  Figma positions the heading and the paragraph absolutely inside the block, so
  the paragraph is offset right AND down from the heading — a deliberate
  stagger, not a plain two-column grid. Left offsets are expressed as
  percentages of the block (685/1312 = 52.21%, 260/738 = 35.23%, 16/345 = 4.64%)
  so the stagger holds at widths between the three fixed frames. In every case
  the paragraph runs to the right edge, so `right-0` covers its width.

  Heights are min-heights, not fixed, so nothing clips if text wraps differently
  than the design's exact metrics.

  The hard line breaks are the ones in the file (identical at web and tablet);
  they're dropped on mobile, where Figma lets the text flow.
*/

export default function AboutSection() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 pt-6 tab:gap-12 tab:px-12 tab:pt-12 web:gap-16 web:px-16 web:pt-16">
      {/* "About JOHTA" outline badge */}
      <div className="flex min-h-12 items-center justify-center rounded-md border border-primary-border px-6">
        <p className="whitespace-nowrap font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-primary-text tab:text-[24px] tab:leading-[29px]">
          About JOHTA
        </p>
      </div>

      {/* Staggered heading + paragraph */}
      <div className="relative min-h-[246px] w-full tab:min-h-[314px] web:min-h-[394px]">
        <h2 className="absolute left-0 top-0 w-[324px] font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:w-auto tab:text-[48px] tab:leading-[58px] web:text-[56px] web:leading-[68px]">
          Made for the shop, not the
          <br className="hidden tab:inline" />{" "}
          <span className="text-green-100">spreadsheet</span>
        </h2>

        <div className="absolute right-0 top-[102px] left-[4.64%] font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:left-[35.23%] tab:top-[140px] tab:font-heading tab:text-[24px] tab:font-semibold tab:leading-[29px] tab:tracking-[-1px] web:left-[52.21%] web:top-[160px] web:text-[32px] web:leading-[39px]">
          <p>
            We started with one real shop, real sales, and
            <br className="hidden tab:inline" /> real mistakes a notebook or a
            shop owner
            <br className="hidden tab:inline" /> makes and can’t catch.
          </p>
          {/* Figma uses a zero-width-space line to create the blank row */}
          <p>&#8203;</p>
          <p>
            <span className="text-primary-text">JOHTA</span> is what came out of
            it. simple enough to
            <br className="hidden tab:inline" /> use or hand to any staff member.
          </p>
        </div>
      </div>
    </section>
  );
}
