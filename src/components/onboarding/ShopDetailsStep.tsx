"use client";

import OnboardingButton from "./OnboardingButton";
import OnboardingField from "./OnboardingField";
import OnboardingProgress from "./OnboardingProgress";
import OnboardingBack from "./OnboardingBack";
import { HomeLink } from "@/components/Brand";

/*
  Onboarding step 3 — "What's the name of your shop?"
  Figma 197:2329 (web) / 197:2366 (tablet) / 197:2403 (mobile)

  Same reordering shell as step 2:
    mobile  full-bleed banner (393x311) first, then the form (345 wide)
    tablet  form first (633 at 48,48), banner below (786x353 at 24,817)
    web     form left (625 at x59, vertically centred) + panel right (647x852)

  Section gaps: 32 on mobile, 48 on tablet, 64 on web — tablet is NOT the web
  rhythm here, unlike step 2 where both are 64. The tablet form-to-banner gap
  is 55 on this step and 48 on step 2, so it stays a per-step value.

  TWO THINGS TO SETTLE IN THE FILE (reproduced as drawn, not silently fixed):
    1. The button reads "Almost Done" on the web frame and "Next" on tablet and
       mobile. Rendered per breakpoint to match, but the copy should agree.
    2. "biz!" is #ebba33, a yellow that is not in the palette — warning/default
       is #e6a900. Written as a literal here rather than mapped to a token that
       would change the colour.
*/

/*
  One 1254x1254 source. Every instance fills its box width and lifts 3.35% of
  the box height, which keeps the square aspect ratio.
*/
const CROP = "absolute left-0 top-[-3.35%] h-[103.35%] w-full max-w-none";

function Panel() {
  return (
    <div className="relative h-[311px] w-full shrink-0 overflow-hidden bg-primary-subtle tab:h-[353px] tab:w-[786px] tab:rounded-md web:h-[852px] web:w-[647px]">
      <div className="absolute left-[169px] top-[94px] h-[217px] w-[224px] overflow-hidden tab:left-[381px] tab:top-0 tab:h-[392px] tab:w-[405px] web:left-0 web:top-[295px] web:h-[626px] web:w-[647px]">
        <img
          src="/figma/onboarding-shopfront.webp"
          alt=""
          aria-hidden
          className={CROP}
        />
      </div>

      <p className="absolute left-6 top-6 w-[214px] font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:left-12 tab:top-12 tab:w-[343px] tab:text-[48px] tab:leading-[58px] web:w-[527px] web:text-[64px] web:leading-[77px]">
        Just some fun facts about your{" "}
        <span className="text-[#ebba33]">biz!</span>
      </p>
    </div>
  );
}

export default function ShopDetailsStep({
  ownerName,
  shopName,
  staffCount,
  onChange,
  onNext,
  onBack,
}: {
  ownerName: string;
  shopName: string;
  staffCount: string;
  onChange?: (field: "ownerName" | "shopName" | "staffCount", v: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="min-h-screen w-full bg-bg-canvas">
      <div className="flex flex-col items-center gap-6 pb-[37px] tab:items-start tab:gap-[55px] tab:pt-12 tab:pb-6 web:mx-auto web:max-w-[1440px] web:flex-row web:items-center web:gap-[65px] web:py-6 web:pl-[59px]">
        {/* Form — first in the DOM, painted second on mobile */}
        <div className="order-2 flex w-[345px] shrink-0 flex-col items-start gap-8 tab:order-1 tab:ml-12 tab:w-[633px] tab:gap-12 web:ml-0 web:w-[625px] web:gap-16">
          <div className="flex w-[316px] flex-col items-start gap-6 tab:w-[515px] tab:gap-16">
            <OnboardingBack onBack={onBack} />
            <p className="w-full font-brand text-[40px] leading-[48px] tracking-[-1px] text-primary-text tab:text-[64px] tab:leading-[68px]">
              <HomeLink>JOHTA</HomeLink>
            </p>

            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex w-full flex-col items-start gap-2">
                <p className="w-full font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:text-[40px] tab:leading-[48px]">
                  What&apos;s the name of your shop?
                </p>
                <p className="w-[316px] font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:w-full tab:text-[18px] tab:leading-[28px]">
                  Let&apos;s set up your shop. This are basic questions you need
                  to answers to get your shop dashboard set.
                </p>
              </div>
              <OnboardingProgress current={2} />
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-6">
            <OnboardingField
              id="ownerName"
              label="Owner name"
              placeholder="e.g. Ngozi Eze"
              value={ownerName}
              onChange={(v) => onChange?.("ownerName", v)}
              labelGap={8}
            />
            <OnboardingField
              id="shopName"
              label="Shop name"
              placeholder="e.g. T-Max Store"
              value={shopName}
              onChange={(v) => onChange?.("shopName", v)}
            />
            <OnboardingField
              id="staffCount"
              label="Staff count"
              placeholder="e.g. 3"
              value={staffCount}
              onChange={(v) => onChange?.("staffCount", v)}
              inputMode="numeric"
            />
          </div>

          <OnboardingButton onClick={onNext} disabled={!shopName.trim()}>
            {/* Reads "Almost Done" on web and "Next" below, as the file draws it. */}
            <span className="web:hidden">Next</span>
            <span className="hidden web:inline">Almost Done</span>
          </OnboardingButton>
        </div>

        <div className="order-1 w-full tab:order-2 tab:mx-auto tab:w-auto web:mx-0">
          <Panel />
        </div>
      </div>
    </div>
  );
}
