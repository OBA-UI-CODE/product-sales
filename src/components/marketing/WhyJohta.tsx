/*
  About — "Why JOHTA?" — Figma nodes:
    web    123:1892 (1312x711) gap 64 · heading 56/68 · left 574 + right 674 (justify-between)
    tablet 127:2100 (738x568)  gap 48 · heading 48/58 · left 322 + 48 + right 368
    mobile 127:2199 (345x876)  gap 24 · heading 24/29 · stacked

  Left panel (bg primary/subtle): headline over a bordered dashboard crop.
    headline 24/29 -> 40/48 -> 48/58, with "accountability" in green/50
    panel h  336   -> 462   -> 579
    image    aspect 1440/900 border-2 -> h214 border-2 -> h329 border-3

  Right panel: "Why Shop Owners Switch" in primary/text over three icon rows.
    title     24/29 -> 24/29 -> 40/48
    row title 20/24 -> 20/24 -> 24/29
    row body  Inter 16/24 -> 16/24 -> 18/28
    icon tile 43px, r10, bg info/subtle, 24px icon centred

  The web frame positions the three rows absolutely (top 115 / 272 / 429 —
  i.e. 64px apart once each row's 93px height is accounted for), so a flex
  column with a 64px gap reproduces it without the absolute maths.
*/

const ROWS = [
  {
    icon: "/figma/icon-task.svg",
    title: "One honest record",
    body: "Your whole team works from the same book every sale, logged under the person who made it.",
  },
  {
    icon: "/figma/icon-document-like.svg",
    title: "Simple by design",
    body: "Clear enough to hand to any staff member on their first day no training manual required.",
  },
  {
    icon: "/figma/icon-chart.svg",
    title: "Numbers you can trust",
    body: "Accurate totals and live stock, honest enough to trust with every naira.",
  },
];

export default function WhyJohta() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 pt-6 tab:gap-12 tab:px-12 tab:pt-12 web:gap-16 web:px-16 web:pt-16">
      <h2 className="w-full text-center font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] tab:text-[48px] tab:leading-[58px] web:text-[56px] web:leading-[68px]">
        <span className="text-text-primary">Why</span>
        <span className="text-primary-text"> JOHTA?</span>
      </h2>

      <div className="flex w-full flex-col gap-6 tab:flex-row tab:items-center tab:gap-12 web:justify-between web:gap-16">
        {/* Left — headline + dashboard */}
        <div className="relative flex h-[336px] w-full shrink-0 items-center overflow-hidden rounded-md bg-primary-subtle tab:h-[462px] tab:w-[322px] web:h-[579px] web:w-[574px]">
          <div className="flex w-full flex-col items-start gap-4 px-[15px] tab:gap-6 tab:px-4 web:px-6">
            <p className="w-full font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] text-text-primary tab:text-[40px] tab:leading-[48px] web:text-[48px] web:leading-[58px]">
              Your sales <br />
              <span className="text-green-50">accountability</span> <br />
              right in front of you.
            </p>
            <div className="w-full overflow-hidden rounded-md border-2 border-border-strong tab:h-[214px] web:h-[329px] web:border-[3px]">
              <picture>
                <source
                  media="(min-width: 834px) and (max-width: 1439px)"
                  srcSet="/figma/hero-dashboard-tablet.webp"
                />
                <img
                  src="/figma/feat-dash-mob.webp"
                  alt="JOHTA dashboard showing sales totals"
                  className="aspect-[1440/900] w-full max-w-none object-cover object-left-top tab:aspect-auto tab:h-full"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Right — reasons */}
        <div className="flex w-full shrink-0 items-start overflow-hidden rounded-md border border-border-strong bg-bg-surface px-4 py-6 tab:h-[462px] tab:w-[368px] web:h-[579px] web:w-[674px] web:px-[23px] web:py-[29px]">
          <div className="flex w-full flex-col items-start gap-6 web:gap-[38px]">
            <p className="w-full font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] text-primary-text web:text-[40px] web:leading-[48px]">
              Why Shop Owners Switch
            </p>
            <div className="flex w-full flex-col items-start gap-6 web:gap-16">
              {ROWS.map((r) => (
                <div key={r.title} className="flex w-full items-start gap-2.5">
                  <span className="flex size-[43px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-info-subtle">
                    <img src={r.icon} alt="" width={24} height={24} className="size-6" />
                  </span>
                  <div className="flex flex-col items-start gap-2">
                    <p className="font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-primary web:text-[24px] web:leading-[29px]">
                      {r.title}
                    </p>
                    <p className="font-body text-[16px] font-normal leading-[24px] text-text-secondary web:text-[18px] web:leading-[28px]">
                      {r.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
