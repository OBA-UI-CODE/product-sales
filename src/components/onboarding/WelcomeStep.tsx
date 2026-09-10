"use client";

import OnboardingButton from "./OnboardingButton";
import { BRAND, HomeLink } from "@/components/Brand";

/*
  Onboarding step 1 — welcome.
  Figma 191:2008 (web) / 191:2042 (tablet) / 191:2075 (mobile)

  A single centred column, vertically and horizontally centred in the frame.
  Every gap in the stack is 24. Tablet is identical to web here; only mobile
  steps the type down, so the base styles are mobile and `tab:` carries the
  web scale.

    JOHTA      DM Sans 600  mobile 48/58 -1   tab+ 56/68 -1   primary/text
    heading   DM Sans 600  mobile 32/39 -1   tab+ 48/58 -1   text/primary
    sub       DM Sans 600  mobile 18/22 -1   tab+ 24/29 -1   text/secondary
    column    341 wide on mobile, 553 on tablet and web

  The mobile frame sits 6px left of centre in the file (341 wide at x20 in a
  393 frame). That reads as a nudge rather than intent, so it is centred here.
*/
export default function WelcomeStep({
  ownerName,
  onNext,
}: {
  ownerName: string;
  /* Optional so the dev preview harness can render the step statically. */
  onNext?: () => void;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-canvas px-6">
      <div className="flex w-[341px] flex-col items-center gap-6 text-center tab:w-[553px]">
        <p className="w-full font-brand text-[48px] leading-[58px] tracking-[-1px] text-primary-text tab:text-[64px] tab:leading-[68px]">
          <HomeLink>JOHTA</HomeLink>
        </p>

        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-6 font-heading font-semibold tracking-[-1px]">
            <p className="w-full text-[32px] leading-[39px] text-text-primary tab:text-[48px] tab:leading-[58px]">
              Welcome to{" "}
              <span className="font-brand text-[40px] leading-[39px] tab:text-[64px] tab:leading-[58px]">
                {BRAND}
              </span>
              {ownerName ? `, ${ownerName}` : ""}
            </p>
            <p className="w-full text-[18px] leading-[22px] text-text-secondary tab:text-[24px] tab:leading-[29px]">
              Let&apos;s set up your shop. This takes about five minutes.
            </p>
          </div>

          <OnboardingButton onClick={onNext}>Get Started</OnboardingButton>
        </div>
      </div>
    </div>
  );
}
