"use client";

/*
  Category pill — Figma 196:2223 etc (web/tablet), 197:2300 etc (mobile).

    both        1px border/strong, radius/full, px 20, py 12 (so 50 tall)
    mobile      Inter Regular 16/24
    tablet+web  DM Sans SemiBold 20/24, -1

  The type genuinely differs by breakpoint here — the mobile pills are Inter
  Regular, not a smaller cut of the web's DM Sans SemiBold.

  SELECTED STATE IS NOT IN FIGMA: the file only draws the resting pill, but the
  step is a single-choice question and needs to show the choice. Built from the
  existing system — primary/border ring on primary/subtle — rather than
  inventing a new colour.
*/
export default function CategoryPill({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center justify-center whitespace-nowrap rounded-full border px-5 py-3 font-body text-[16px] font-normal leading-[24px] text-text-primary tab:font-heading tab:text-[20px] tab:font-semibold tab:tracking-[-1px] ${
        selected
          ? "border-primary-border bg-primary-subtle"
          : "border-border-strong"
      }`}
    >
      {label}
    </button>
  );
}
