/*
  Three-segment progress bar shown on onboarding steps 2-4.
  Figma 196:2214 (web/tablet) / 197:2294 (mobile)

    mobile      bars 76 / 77 / 76 wide, 8 tall
    tablet+web  bars 108 wide, 12 tall
    gap 16, radius/md, filled = primary/default, empty = bg/surface-raised

  The middle bar really is 1px wider than its neighbours on mobile (261 total
  split 76/77/76), so the widths are written out rather than shared.
*/
export default function OnboardingProgress({ current }: { current: 1 | 2 | 3 }) {
  const widths = ["w-[76px]", "w-[77px]", "w-[76px]"];

  return (
    <div className="flex items-center gap-4" role="presentation">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-2 rounded-md tab:h-3 tab:w-[108px] ${widths[i - 1]} ${
            i <= current ? "bg-primary-default" : "bg-bg-surface-raised"
          }`}
        />
      ))}
    </div>
  );
}
