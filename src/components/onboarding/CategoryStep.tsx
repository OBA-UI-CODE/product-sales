"use client";

import CategoryPill from "./CategoryPill";
import OnboardingButton from "./OnboardingButton";
import OnboardingProgress from "./OnboardingProgress";
import OnboardingBack from "./OnboardingBack";

/*
  Onboarding step 2 — "Tell us about your shop" / "What are you into?"
  Multiple answers: a shop that sells provisions usually sells drinks and
  snacks too, so this is a multi-select rather than a single choice.
  Figma 196:2177 (web) / 196:2185 (tablet) / 196:2193 (mobile)

  Columns reorder rather than merely stack, as on the auth screens:
    mobile  full-bleed banner (393x311, square corners) first, then the form
    tablet  form first (633 wide at 48,48), banner below (786x353, centred)
    web     form left (633 at x55, vertically centred) + panel right (647x852)

  Form kept first in the DOM with a CSS order swap, so it stays first for
  keyboard and screen-reader users even where the banner paints above it.

  Type scale:
    JOHTA      mobile 40/48   tab+ 56/68        primary/text
    heading   mobile 32/39   tab+ 40/48        text/primary
    body      mobile Inter 16/24  tab+ Inter 18/28   text/secondary
    question  mobile 24/29   tab+ 32/39        text/primary
  Section gaps step 32 on mobile to 64 on tablet and web; the heading-to-body
  gap is 8 and the body-to-progress gap 24 at every size.

  NOTE FOR THE DESIGN FILE: on the tablet frame the illustration is placed at
  y351 inside a 353-tall panel, so the file itself renders the tablet banner as
  headline-only. Reproduced as drawn rather than repositioned by guesswork.
*/

export const CATEGORIES = [
  "Hairs & Cosmetics",
  "Provisions",
  "Foodstuff",
  "Beverages & Wine",
  "Snacks & Catering",
  "Children wears",
  "Adult wears",
  "Shoes",
  "Others",
];

/*
  The illustration is one 922x1152 source. Every cropped instance in the file
  uses the same rule: the image fills the box width and is pulled up 45.17% of
  the box height, which keeps its natural aspect ratio (box width / 0.8).
*/
const CROP = "absolute left-0 top-[-45.17%] h-[161.27%] w-full max-w-none";

function Illustration({ className }: { className: string }) {
  return (
    <div className={`${className} overflow-hidden`}>
      <img
        src="/figma/onboarding-crew.webp"
        alt=""
        aria-hidden
        className={CROP}
      />
    </div>
  );
}

function Panel() {
  return (
    <div className="relative h-[311px] w-full shrink-0 overflow-hidden bg-primary-subtle tab:h-[353px] tab:w-[786px] tab:rounded-md web:h-[852px] web:w-[647px]">
      {/*
        Mobile: ONE crop, 259x201 at x134 — frame 197:2288, rectangle 436:6529.

        This used to render three copies of the same illustration side by side,
        because the earlier version of the frame stacked three instances and I
        reproduced them literally. On a phone that read as the same woman
        printed three times. The design file now carries a single rectangle,
        which is what this matches.
      */}
      <Illustration className="absolute left-[134px] top-[110px] h-[201px] w-[259px] tab:hidden" />

      {/* Web: the full square, bled off the top-left corner. */}
      <div className="absolute left-[-188px] top-[-86px] hidden size-[1024px] web:block">
        <img
          src="/figma/onboarding-crew.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 size-full max-w-none object-cover"
        />
      </div>

      <p className="absolute left-6 top-6 font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:left-12 tab:top-12 tab:w-[343px] tab:text-[48px] tab:leading-[58px] web:w-auto web:whitespace-nowrap web:text-[64px] web:leading-[77px]">
        Set up takes just
        <br />
        three <span className="text-green-100">steps</span>
      </p>
    </div>
  );
}

export default function CategoryStep({
  categories,
  onToggle,
  onNext,
  onBack,
}: {
  categories: string[];
  onToggle?: (c: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="min-h-screen w-full bg-bg-canvas">
      <div className="flex flex-col items-center gap-6 pb-[79px] tab:items-start tab:gap-12 tab:pt-12 tab:pb-6 web:mx-auto web:max-w-[1440px] web:flex-row web:items-center web:gap-[61px] web:py-6 web:pl-[55px]">
        {/* Form — first in the DOM, painted second on mobile */}
        <div className="order-2 flex w-[345px] shrink-0 flex-col items-start gap-8 tab:order-1 tab:ml-12 tab:w-[633px] tab:gap-16 web:ml-0">
          <div className="flex w-full flex-col items-start gap-8 tab:gap-16">
            <div className="flex w-full flex-col items-start gap-6 tab:w-[515px] tab:gap-16">
              <OnboardingBack onBack={onBack} />
              <p className="w-full font-brand text-[40px] leading-[48px] tracking-[-1px] text-primary-text tab:text-[64px] tab:leading-[68px]">
                JOHTA
              </p>

              <div className="flex w-full flex-col items-start gap-6">
                <div className="flex w-full flex-col items-start gap-2">
                  <p className="w-full font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:text-[40px] tab:leading-[48px]">
                    Tell us about your shop
                  </p>
                  <p className="w-[316px] font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:w-full tab:text-[18px] tab:leading-[28px]">
                    Let&apos;s set up your shop. This are basic questions you
                    need to answers to get your shop dashboard set.
                  </p>
                </div>
                <OnboardingProgress current={1} />
              </div>
            </div>

            <div className="flex w-full flex-col items-start gap-6 tab:gap-7">
              <div className="flex w-full flex-col items-start gap-1">
                <p className="w-full font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] text-text-primary tab:text-[32px] tab:leading-[39px]">
                  What are you into?
                </p>
                {/* Said plainly, because a row of pills does not otherwise
                    look like it takes more than one answer. */}
                <p className="font-body text-[14px] leading-[20px] text-text-secondary tab:text-[16px] tab:leading-[24px]">
                  Pick as many as you sell.
                </p>
              </div>
              {/* Pills wrap naturally at 345 and 633; the resulting rows match
                  the file's hand-placed rows at both widths. */}
              <div className="flex w-full flex-wrap items-start gap-6">
                {CATEGORIES.map((c) => (
                  <CategoryPill
                    key={c}
                    label={c}
                    selected={categories.includes(c)}
                    onSelect={() => onToggle?.(c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <OnboardingButton onClick={onNext} disabled={categories.length === 0}>
            Next
          </OnboardingButton>
        </div>

        <div className="order-1 w-full tab:order-2 tab:mx-auto tab:w-auto web:mx-0">
          <Panel />
        </div>
      </div>
    </div>
  );
}
