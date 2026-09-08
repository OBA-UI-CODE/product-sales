"use client";

import ColourSwatch, { THEME_COLORS } from "./ColourSwatch";
import { themeVars } from "@/lib/theme";
import OnboardingButton from "./OnboardingButton";
import OnboardingProgress from "./OnboardingProgress";
import OnboardingBack from "./OnboardingBack";

/*
  Onboarding step 4 — "Make it yours"
  Figma 197:2617 (web) / 197:2636 (tablet) / 197:2655 (mobile)

  Frame heights differ on this step: 1440x900 web, 834x974 tablet, 393x754
  mobile — it is a shorter screen than steps 2 and 3.

  Unlike step 3, the web form is NOT vertically centred: it is pinned at y77
  with a height of 508, which would centre at 196. Pinned here to match.

  Section gaps 32 mobile / 48 tablet / 64 web. Column widths 345 mobile,
  515 tablet, 489 web — the web column is the narrow one.

  "vibes" is #eb6767, which happens to equal the danger token; written as a
  literal because the designer picked a raw colour, not the semantic token, and
  mapping it to text-danger would imply a meaning the design does not carry.
*/

function Panel() {
  return (
    <div className="relative h-[311px] w-full shrink-0 overflow-hidden bg-primary-subtle tab:h-[378px] tab:w-[786px] tab:rounded-md web:h-[852px] web:w-[647px]">
      {/* Dashboard mock: 3px border/strong, radius/md, clipped. The inner image
          keeps its own 1.6 aspect at every breakpoint and is wider than its
          frame on tablet, so it runs past the right edge exactly as drawn. */}
      <div className="absolute left-[72px] top-[112px] h-[223px] w-[328px] overflow-hidden rounded-md border-[3px] border-border-strong tab:left-[410px] tab:top-[93px] tab:h-[269px] tab:w-[396px] web:left-6 web:top-[384px] web:h-[407px] web:w-[650px]">
        <img
          src="/figma/onboarding-dashboard-mock.webp"
          alt=""
          aria-hidden
          className="absolute left-0 top-[-1px] h-[205px] w-[328px] max-w-none tab:h-[270px] tab:w-[432px] web:top-0 web:h-[406px] web:w-[650px]"
        />
      </div>

      <p className="absolute left-6 top-6 w-[268px] font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:left-12 tab:top-12 tab:w-[342px] tab:text-[48px] tab:leading-[58px] web:w-[527px] web:text-[64px] web:leading-[77px]">
        Choose a theme that <span className="text-[#eb6767]">vibes</span>{" "}
        {/* The file hard-breaks before "with you!" on the web frame; tablet and
            mobile wrap naturally inside their narrower text boxes. */}
        <br className="hidden web:inline" />
        with you!
      </p>
    </div>
  );
}

export default function ThemeStep({
  themeColor,
  onSelect,
  onDone,
  onBack,
  pending,
}: {
  themeColor: string;
  onSelect?: (c: string) => void;
  onDone?: () => void;
  onBack?: () => void;
  pending?: boolean;
}) {
  return (
    /*
      The accent is applied here too, so the step previews the choice as it is
      made: the Done button and the selected swatch take the new colour
      immediately rather than only showing up after onboarding finishes.
    */
    <div className="min-h-screen w-full bg-bg-canvas" style={themeVars(themeColor)}>
      <div className="flex flex-col items-center gap-6 pb-14 tab:items-start tab:gap-12 tab:pt-12 tab:pb-6 web:mx-auto web:max-w-[1440px] web:flex-row web:items-start web:gap-[201px] web:py-6 web:pl-[59px]">
        {/* Form — first in the DOM, painted second on mobile */}
        <div className="order-2 flex w-[345px] shrink-0 flex-col items-start gap-8 tab:order-1 tab:ml-12 tab:w-[515px] tab:gap-12 web:ml-0 web:mt-[53px] web:w-[489px] web:gap-16">
          <div className="flex w-[316px] flex-col items-start gap-6 tab:w-full tab:gap-16">
            <OnboardingBack onBack={onBack} />
            <p className="w-full font-brand text-[40px] leading-[48px] tracking-[-1px] text-primary-text tab:text-[64px] tab:leading-[68px]">
              JOHTA
            </p>

            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex w-full flex-col items-start gap-2">
                <p className="w-full font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:text-[40px] tab:leading-[48px]">
                  Make it yours
                </p>
                <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:text-[18px] tab:leading-[28px]">
                  Pick an accent color for your dashboard. You can change this
                  anytime.
                </p>
              </div>
              <OnboardingProgress current={3} />
            </div>
          </div>

          <div className="flex items-start gap-4">
            {THEME_COLORS.map((c) => (
              <ColourSwatch
                key={c}
                color={c}
                selected={c === themeColor}
                onSelect={() => onSelect?.(c)}
              />
            ))}
          </div>

          <OnboardingButton onClick={onDone} disabled={pending}>
            {pending ? "Setting up..." : "Done"}
          </OnboardingButton>
        </div>

        <div className="order-1 w-full tab:order-2 tab:mx-auto tab:w-auto web:mx-0">
          <Panel />
        </div>
      </div>
    </div>
  );
}
