"use client";

/*
  Onboarding primary button — Figma component Button (8:27), primary/default.

  Per the component's own description in Figma it fills the width on mobile
  frames and keeps a 48px min height for the touch target. Every onboarding
  frame uses it full-width, so that is baked in here rather than made a prop.

  Label type scale, read off the step frames:
    mobile      DM Sans SemiBold 20/24, -1
    tablet/web  DM Sans SemiBold 24/29, -1
*/
export default function OnboardingButton({
  children,
  type = "button",
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 min-h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-on-primary disabled:opacity-70 tab:text-[24px] tab:leading-[29px]"
    >
      {children}
    </button>
  );
}
