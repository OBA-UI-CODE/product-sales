"use client";

/*
  Onboarding text field — Figma component Input (9:22).

    label   mobile Inter Regular 16/24        tablet+web DM Sans SemiBold 18/22 -1
    field   h52 (min 48), bg/surface, 1px border/default, radius/md, px 16
    value   Inter Regular 16, placeholder at text/muted

  labelGap exists because the file itself is inconsistent: the first Input on
  each step has an 8px label gap and the rest have 6px (heights 82 / 80 / 80 on
  web, 84 / 82 / 82 on mobile). Reproduced rather than averaged.
*/
export default function OnboardingField({
  id,
  label,
  placeholder,
  value,
  onChange,
  labelGap = 6,
  inputMode,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange?: (v: string) => void;
  labelGap?: 8 | 6;
  inputMode?: "numeric";
}) {
  return (
    <div
      className={`flex w-full flex-col items-start ${
        labelGap === 8 ? "gap-2" : "gap-1.5"
      }`}
    >
      <label
        htmlFor={id}
        className="w-full font-body text-[16px] font-normal leading-[24px] text-text-primary tab:font-heading tab:text-[18px] tab:font-semibold tab:leading-[22px] tab:tracking-[-1px]"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="h-[52px] min-h-12 w-full rounded-md border border-border-default bg-bg-surface px-4 font-body text-[16px] font-normal text-text-primary placeholder:text-text-muted focus:border-primary-border focus:outline-none"
      />
    </div>
  );
}
