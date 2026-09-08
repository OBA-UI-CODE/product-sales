"use client";

import { ArrowLeft } from "lucide-react";

/*
  Back control for the onboarding steps.

  NOT IN FIGMA — the file draws the five steps as a one-way flow with no way
  to return, which is fine on a canvas and wrong in a product: someone who
  mistypes their shop name on step 3 should not have to abandon the wizard and
  start again.

  Placed above the JOHTA wordmark so it reads as "leave this step" rather than
  as part of the form, and given a real 44px touch target even though the icon
  is 24. It is a button, not a link — the wizard holds the step in state, so
  there is no URL to go back to, and the browser's own back button would leave
  onboarding entirely.

  Everything already entered is kept: the wizard's state lives above the steps,
  so going back and forward again shows the previous answers rather than
  clearing them.
*/
export default function OnboardingBack({ onBack }: { onBack?: () => void }) {
  if (!onBack) return null;

  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Go back to the previous step"
      className="-ml-2 flex size-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
    >
      <ArrowLeft size={24} aria-hidden />
    </button>
  );
}
