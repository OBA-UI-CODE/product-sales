/*
  Shared layout for the two long-form legal pages.

  Figma nodes:
    Terms   187:1667 (web) / 187:1732 (tablet) / 187:1797 (mobile)
    Privacy 238:7432 (web) / 238:7531 (tablet) / 238:7629 (mobile)

  Both use the identical template: a centred heading with a lead paragraph,
  then numbered sections, each followed by a full-width 1px rule (#3D3D3D,
  border/strong). Rules are drawn with a border rather than the exported 1px
  line SVGs.

  Per-breakpoint values:
                mobile              tablet / web
    column      345                 734 / 909
    block gap   24                  48 / 64
    h1          48/58 -1            72/87 -1
    h2          32/39 -1            40/48 -1
    body        Inter Medium 18/28  DM Sans 600 24/29 -1

  The tablet scale is the same as web (only the gap differs). Confirmed by the
  frame's own height: at 734 wide, that type with a 48px gap predicts 2489px
  against the file's actual 2471 — within 1% — whereas the mobile scale would
  predict ~1498.
*/

export type LegalSection = {
  heading: string;
  body: string;
};

export default function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <section className="w-full px-6 pt-12 tab:px-12 web:pt-16">
      <div className="mx-auto flex w-full max-w-[345px] flex-col items-start gap-6 tab:max-w-[734px] tab:gap-12 web:max-w-[909px] web:gap-16">
        {/* Title + lead */}
        <div className="flex w-full flex-col items-center gap-6 tab:gap-12 web:gap-16">
          <div className="flex w-full flex-col items-center gap-6 text-center">
            <h1 className="w-full font-heading text-[48px] font-semibold leading-[58px] tracking-[-1px] text-text-primary tab:text-[72px] tab:leading-[87px]">
              {title}
            </h1>
            <p className="w-full font-body text-[18px] font-medium leading-[28px] text-text-secondary tab:font-heading tab:text-[24px] tab:font-semibold tab:leading-[29px] tab:tracking-[-1px]">
              {intro}
            </p>
          </div>
          <div className="w-full border-t border-border-strong" />
        </div>

        {/* Numbered sections */}
        {sections.map((s) => (
          <div
            key={s.heading}
            className="flex w-full flex-col items-center gap-6 tab:gap-12 web:gap-16"
          >
            <div className="flex w-full flex-col items-start gap-6">
              <h2 className="w-full font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:text-[40px] tab:leading-[48px]">
                {s.heading}
              </h2>
              <p className="w-full font-body text-[18px] font-medium leading-[28px] text-text-secondary tab:font-heading tab:text-[24px] tab:font-semibold tab:leading-[29px] tab:tracking-[-1px]">
                {s.body}
              </p>
            </div>
            <div className="w-full border-t border-border-strong" />
          </div>
        ))}
      </div>
    </section>
  );
}
