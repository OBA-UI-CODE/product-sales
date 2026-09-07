"use client";

import OnboardingButton from "./OnboardingButton";

/*
  Onboarding step 5 — "You're all set!"
  Figma 198:2826 (web) / 198:2852 (tablet) / 198:2878 (mobile)

  A centred column like step 1, vertically and horizontally centred in the
  frame, every gap 24. Column 353 wide on mobile, 553 on tablet and web.

    tick      72px, exported SVG (stroke #1D9E75)
    heading   mobile DM Sans 40/48 -1      tab+ DM Sans 48/58 -1
    body      mobile Inter 18/28           tab+ DM Sans SemiBold 24/29 -1
    button    mobile 20/24                 tab+ 24/29

  The body genuinely changes typeface between breakpoints — Inter Regular on
  mobile, DM Sans SemiBold above — so it is not a simple size step.
*/
export default function DoneStep({ onDone }: { onDone?: () => void }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-canvas px-5">
      <div className="flex w-[353px] flex-col items-center gap-6 tab:w-[553px]">
        <img
          src="/figma/icon-tick-circle.svg"
          alt=""
          aria-hidden
          width={72}
          height={72}
          className="size-[72px] shrink-0"
        />

        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-6 text-center">
            <p className="w-full font-heading text-[40px] font-semibold leading-[48px] tracking-[-1px] text-text-primary tab:text-[48px] tab:leading-[58px]">
              You&apos;re all set!
            </p>
            <p className="w-full font-body text-[18px] font-normal leading-[28px] text-text-secondary tab:font-heading tab:text-[24px] tab:font-semibold tab:leading-[29px] tab:tracking-[-1px]">
              Your shop is ready. Start logging sales and watch your numbers
              grow.
            </p>
          </div>

          <OnboardingButton onClick={onDone}>Go to shop</OnboardingButton>
        </div>
      </div>
    </div>
  );
}
