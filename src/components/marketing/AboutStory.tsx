/*
  About — "Our Story" — Figma nodes:
    web    123:1898 (1312x947)  gap 64
    tablet 126:2052 (738x885)   gap 48
    mobile 127:2150 (345x1421)  gap 24

  Layout per breakpoint:
    web     image column (409x673) + 64 + right column (839), where the right
            column is the Our Story panel above a Build / Personas pair
    tablet  image (214x240) + 48 + Our Story panel (476), then Build + Personas
    mobile  everything stacked full width, image 307 tall

  Type — note the headline is LARGER on tablet than on web (48/58 vs 40/48);
  that is what the file says, not a transcription slip:
    headline   24/29 -> 48/58 -> 40/48
    card title 24/29 -> 24/29 -> 40/48
    card body  Inter Medium 16/24 (mobile & tablet) -> DM Sans 600 24/29 (web)

  The "About Us" illustration is the generic stock graphic already flagged in
  this project as off-brand. Used as-is because it is what the file contains.
*/

const CARD_TITLE =
  "font-heading font-semibold tracking-[-1px] text-text-primary text-[24px] leading-[29px] web:text-[40px] web:leading-[48px]";
const CARD_BODY =
  "font-body text-[16px] font-medium leading-[24px] text-text-secondary web:font-heading web:text-[24px] web:font-semibold web:leading-[29px] web:tracking-[-1px]";

export default function AboutStory() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 pt-6 tab:gap-12 tab:px-12 tab:pt-12 web:gap-16 web:px-16 web:pt-16">
      {/* Badge */}
      <div className="flex min-h-12 items-center justify-center rounded-md border border-primary-border px-6">
        <p className="whitespace-nowrap font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-primary-text tab:text-[24px] tab:leading-[29px]">
          About JOHTA
        </p>
      </div>

      <div className="flex w-full flex-col items-start gap-6 tab:gap-12 web:gap-16">
        <h2 className="w-[324px] font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] text-text-primary tab:w-[598px] tab:text-[48px] tab:leading-[58px] web:w-[742px] web:text-[40px] web:leading-[48px]">
          <span className="text-primary-text">JOHTA</span> exists so no shop owner
          has to wonder where the money went.
        </h2>

        {/* mobile: one column · tablet: image+panel then two cards · web: image column + right column */}
        {/* 409 + 839 + 64 gap = 1312, the 1440 frame exactly — so this row was
            cut off below 1440. Same ratio, expressed as fractions. */}
        <div className="flex w-full flex-col gap-6 tab:gap-12 web:grid web:grid-cols-[409fr_839fr] web:items-start web:gap-16">
          {/* Illustration */}
          <div className="h-[307px] w-full shrink-0 overflow-hidden rounded-md border border-border-strong tab:hidden web:block web:h-[673px] web:w-full">
            <img
              src="/figma/about-story.webp"
              alt=""
              className="size-full max-w-none rounded-md object-cover"
            />
          </div>

          <div className="flex w-full flex-col gap-6 tab:gap-12 web:w-full web:gap-16">
            {/* Tablet places the illustration beside the Our Story panel */}
            <div className="flex w-full flex-col gap-6 tab:flex-row tab:items-center tab:gap-12">
              <div className="hidden shrink-0 overflow-hidden rounded-md border border-border-strong tab:block tab:h-[240px] tab:w-[214px] web:hidden">
                <img
                  src="/figma/about-story.webp"
                  alt=""
                  className="size-full max-w-none rounded-md object-cover"
                />
              </div>

              {/* Our Story panel */}
              <div className="flex w-full flex-col items-start overflow-hidden rounded-md bg-primary-subtle px-4 py-6 tab:h-[240px] tab:pb-[11px] tab:pl-4 tab:pr-[11px] tab:pt-4 web:h-auto web:px-[29px] web:py-4">
                <div className="flex w-full flex-col items-start gap-6 tab:gap-4 web:gap-6">
                  <p className={CARD_TITLE}>Our Story</p>
                  <p className={CARD_BODY}>
                    <span className="text-primary-text">JOHTA</span>
                    {` didn’t start as a product. It started as a notebook the kind you’ll find on almost every shop counter in Nigeria, full of dates, item names, and prices written in a hurry between customers. That notebook worked, until it didn’t. Pages went missing. Totals didn’t add up at the end of the day. Nobody could tell, at a glance, who sold what or how much stock was really left.`}
                  </p>
                </div>
              </div>
            </div>

            {/* The Build + Personas */}
            <div className="flex w-full flex-col gap-6 tab:flex-row tab:items-start tab:gap-12 web:gap-16">
              <div className="flex w-full flex-col items-start overflow-hidden rounded-md border border-border-strong bg-bg-surface px-4 py-6 tab:w-[348px] tab:shrink-0 tab:px-[27px] tab:py-[28px] web:w-[387px]">
                <div className="flex w-full flex-col items-start gap-6">
                  <p className={CARD_TITLE}>The Build</p>
                  <p className={CARD_BODY}>
                    {`We built `}
                    <span className="text-primary-text">JOHTA</span>
                    {` to fix that not by replacing the shop owner’s way of working, but by giving it structure. Every sale logged in seconds. Every unit of stock tracked without anyone having to count it by hand. `}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col items-start justify-center overflow-hidden rounded-md border border-border-strong bg-bg-surface px-4 py-6 tab:w-[342px] tab:shrink-0 tab:px-[27px] tab:py-[28px] web:h-[331px] web:w-[388px]">
                <div className="flex w-full flex-col items-start gap-6 web:w-[331px]">
                  <p className={CARD_TITLE}>Personas</p>
                  <p className={CARD_BODY}>
                    {`We started with three real shops, real sales, real staff, real mistakes a notebook could never catch. Everything in `}
                    <span className="text-green-200">JOHTA</span>
                    {` was shaped by what these shops actually needed, not by what a big business sales tool assumes you need.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
