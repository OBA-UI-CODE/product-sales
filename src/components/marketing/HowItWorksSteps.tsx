/*
  How it works — the three steps. Figma nodes:
    web    143:8486 (1312x1378) card 1 full width, then cards 2 + 3 side by side
    tablet 143:8529 (738x2252)  all three stacked full width
    mobile 143:8599 (345x1430)  all three stacked full width

  Card chrome matches the landing Features cards: bg surface, 1.5px
  border/strong, r10, clipped.

  Type:
    title  DM Sans 600 48/58 -1 (web & tablet) -> 24/29 -1 (mobile)
    body   DM Sans 600 24/29 -1 (web & tablet) -> Inter 400 16/24 (mobile)
    inset  64,64 (web & tablet) -> 16,40 / 16,52 (mobile)

  Step 3's visual is a dashboard stat block that differs per breakpoint — a 2x2
  grid on web (224:5886) and tablet (224:5998), but a SINGLE card on mobile
  (224:6323). Those are used here as flat exports of the Figma groups rather
  than rebuilt from markup: they are decorative, clipped by the card, and the
  real stat cards will be built properly as components for the actual Dashboard
  page. Flagged rather than passed off as a rebuild.
*/

const CARD =
  "relative overflow-hidden rounded-md border-[1.5px] border-border-strong bg-bg-surface";
const TITLE =
  "font-heading font-semibold tracking-[-1px] text-text-primary text-[24px] leading-[29px] tab:text-[48px] tab:leading-[58px]";
const BODY =
  "font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:font-heading tab:text-[24px] tab:font-semibold tab:leading-[29px] tab:tracking-[-1px]";

function StepText({
  title,
  body,
  top,
}: {
  title: string;
  body: string;
  top: string;
}) {
  return (
    <div
      className={`absolute left-4 ${top} flex flex-col items-start gap-6 tab:left-16 tab:top-16 tab:w-[435px]`}
    >
      <p className={`${TITLE} whitespace-nowrap tab:whitespace-normal`}>{title}</p>
      <p className={`${BODY} w-[293px] tab:w-full`}>{body}</p>
    </div>
  );
}

export default function HowItWorksSteps() {
  return (
    <section data-reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-6 px-6 pt-6 tab:gap-6 tab:px-12 tab:pt-12 web:gap-16 web:px-16 web:pt-16">
      {/* 1 — Set up your shop */}
      <div className={`${CARD} h-[553px] w-full tab:h-[842px] web:h-[657px]`}>
        <StepText
          title="Set up your shop"
          body="Tell us your shop name, what you sell and add your team. takes less than five minutes no tech skills needed."
          top="top-10"
        />
        <div className="absolute left-[34px] top-[217px] h-[336px] w-[311px] overflow-hidden rounded-tl-md border-2 border-border-strong tab:left-16 tab:top-[359px] tab:h-[483px] tab:w-[674px] tab:rounded-md web:left-[585px] web:top-[122px] web:h-[546px] web:w-[874px] web:border-[3px]">
          <picture>
            <source
              media="(min-width: 834px) and (max-width: 1199px)"
              srcSet="/figma/hero-dashboard-tablet.webp"
            />
            <img
              src="/figma/feat-dash-mob.webp"
              alt="Setting up a shop in JOHTA"
              className="h-full w-[537px] max-w-none object-cover object-left-top tab:w-full"
            />
          </picture>
        </div>
      </div>

      {/* 2 + 3 — stacked below tablet, side by side on web */}
      <div className="flex w-full flex-col gap-6 tab:gap-6 web:flex-row web:items-center web:gap-16">
        {/* 2 — Log sales as they happen */}
        <div className={`${CARD} h-[420px] w-full tab:h-[657px] web:h-[657px] web:flex-[632_0_0]`}>
          <StepText
            title="Log sales as they happen"
            body="Tap in the item and price. JOHTA does the math, updates your stock, and keeps a running total for the day automatically."
            top="top-[52px]"
          />
          <div className="absolute -left-1 top-[223px] h-[255px] w-[282px] overflow-hidden rounded-tr-md border-2 border-border-strong tab:-left-[33px] tab:top-[329px] tab:h-[483px] tab:w-[674px] tab:rounded-md web:left-[-97px] web:top-[335px] web:h-[373px] web:w-[596px] web:rounded-md web:border-[3px]">
            <picture>
              <source
                media="(min-width: 834px) and (max-width: 1199px)"
                srcSet="/figma/hero-dashboard-tablet.webp"
              />
              <img
                src="/figma/feat-dash-mob.webp"
                alt="Logging a sale in JOHTA"
                className="h-full w-[316px] max-w-none object-cover object-left-top tab:w-full"
              />
            </picture>
          </div>
        </div>

        {/* 3 — Know your numbers */}
        <div className={`${CARD} h-[409px] w-full tab:h-[657px] web:h-[657px] web:flex-[616_0_0]`}>
          <StepText
            title="Know your numbers"
            body="See today’s total, search past sales, spot low stock before it runs out. no more flipping through pages to find one entry."
            top="top-[52px]"
          />
          {/* Stat block — single card on mobile, 2x2 grid above */}
          <picture>
            <source
              media="(min-width: 1200px)"
              srcSet="/figma/hiw-stats.webp"
            />
            <source
              media="(min-width: 834px)"
              srcSet="/figma/hiw-stats-tab.webp"
            />
            <img
              src="/figma/hiw-stats-mob.webp"
              alt="Dashboard stat cards: today's sales, sales logged, low stock and average sale"
              className="absolute -left-[11px] top-[231px] w-[304px] max-w-none tab:-left-px tab:top-[276px] tab:w-[739px] web:-left-px web:top-[276px] web:w-[617px]"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
