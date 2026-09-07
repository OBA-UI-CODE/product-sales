/*
  About hero — Figma nodes:
    web    125:1901 (1376x727 @ x=64)  text 627 + gap 64 + image 685
    tablet 104:718 text (358x471 @ 48,150) + 104:727 image (380x516 @ 454,148)
    mobile 218:5578 (375x677 @ x=24)  text 345 stacked above a 375x233 image

  The hero deliberately bleeds off the RIGHT edge at every breakpoint — the
  image runs to the frame edge with no right margin (web 64+1376=1440,
  tablet 454+380=834, mobile 24+375=399 against a 393 frame). So this section
  carries left padding only, and the image is rounded on its left corners only.

  Type per breakpoint:
    badge    Inter Regular 14/20 -> Inter Medium 18/28 (same at web)
    heading  DM Sans 600  56/68  ->  64/77  ->  72/87   (-1px)
    body     Inter 400 16/24     ->  DM Sans 600 20/24  ->  DM Sans 600 24/29

  Heading colour is green/50 (#e1f5ee) with "spreadsheet" in primary/text.
  Line breaks: web and tablet break after "Made for the"; mobile lets that
  first line flow and only breaks before "spreadsheet".

  The images are the same dashboard screenshots already used elsewhere on the
  site (verified byte-identical), just cropped differently — so they are reused
  rather than shipped again under new names.
*/

export default function AboutHero() {
  return (
    // Full-bleed right: the section is NOT capped at 1440 and centred, because
    // that stops the screenshot at the container edge and leaves a gap on any
    // screen wider than 1440 (87px at 1600, 247px at 1920). Instead the section
    // is full width, the left padding reproduces where the centred 1440 content
    // column would start — calc((100% - 1440px)/2 + 64px) — and the image takes
    // the remaining space with flex-1, so it always runs to the screen edge.
    // At exactly 1440 this still yields the file's 64 / 627 / 64 / 685.
    // Uses 100% of the section rather than 100vw so a scrollbar cannot cause
    // horizontal overflow.
    <section className="w-full pt-6 tab:pt-12 web:pt-16">
      <div className="flex flex-col gap-6 pl-6 tab:flex-row tab:items-start tab:gap-12 tab:pl-12 web:items-center web:gap-16 web:pl-[max(64px,calc((100%-1440px)/2+64px))]">
        {/* Text column */}
        <div className="flex shrink-0 flex-col items-start gap-6 tab:w-[358px] web:w-[627px]">
          <div className="flex h-12 min-h-12 items-center justify-center rounded-md bg-primary-subtle px-6">
            <p className="whitespace-nowrap font-body text-[14px] font-normal leading-[20px] text-text-primary tab:text-[18px] tab:font-medium tab:leading-[28px]">
              Track your sale with ease.
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-6">
            <h1 className="w-full font-heading text-[56px] font-semibold leading-[68px] tracking-[-1px] tab:text-[64px] tab:leading-[77px] web:text-[72px] web:leading-[87px]">
              <span className="text-green-50">
                Made for the
                <br className="hidden tab:inline" /> shop, not the{" "}
              </span>
              <br />
              <span className="text-primary-text">spreadsheet</span>
            </h1>

            <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:w-[364px] tab:font-heading tab:text-[20px] tab:font-semibold tab:leading-[24px] tab:tracking-[-1px] web:w-full web:text-[24px] web:leading-[29px]">
              <span className="text-primary-text">JOHTA</span>
              {` turns your paper notebook into a system your whole team can trust,  log sales in seconds, track stock automatically, and know exactly what stock was sold,`}
              <br className="hidden web:inline" />
              {` how much you made and what remains. `}
            </p>
          </div>
        </div>

        {/* Screenshot — bleeds to the right edge, left corners rounded only */}
        {/* flex-1 rather than a fixed 685/380 so it always reaches the edge */}
        <div className="h-[233px] w-full overflow-hidden rounded-l-md border-[3px] border-border-subtle tab:h-[516px] tab:min-w-0 tab:flex-1 tab:border-2 tab:border-border-strong web:h-[727px] web:border-[3px]">
          <picture>
            <source
              media="(min-width: 834px) and (max-width: 1439px)"
              srcSet="/figma/hero-dashboard-tablet.webp"
            />
            <source media="(max-width: 833px)" srcSet="/figma/feat-dash-mob.webp" />
            <img
              src="/figma/hero-dashboard-web.webp"
              alt="The JOHTA dashboard showing today's sales and recent entries"
              className="h-full w-full max-w-none object-cover object-left-top"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
