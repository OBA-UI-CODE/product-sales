"use client";

/*
  Accent colour swatch — Figma "Colour Swatches" (198:2740 web / 198:2788
  tablet / 198:2813 mobile). Identical at all three breakpoints: five 56x52
  boxes, 16 gap, each holding a 40px circle.

  Exported from Figma as flat SVGs, which cannot carry a moving selection, so
  the circles are drawn in code and the exact fills are taken from those SVGs:
    #1C9E75  #3366E6  #8C40D9  #D95933  #CC3366
  The selected swatch's ring is the SVG's own marker — a 54x50 rounded rect,
  2px white stroke, inset 1px, which is a 2px white border on the 56x52 box.
*/

export const THEME_COLORS = [
  "#1C9E75",
  "#3366E6",
  "#8C40D9",
  "#D95933",
  "#CC3366",
];

export default function ColourSwatch({
  color,
  selected,
  onSelect,
}: {
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Accent colour ${color}`}
      aria-pressed={selected}
      className={`flex h-[52px] w-[56px] shrink-0 items-center justify-center rounded-[25px] border-2 ${
        selected ? "border-white" : "border-transparent"
      }`}
    >
      <span
        className="block size-10 rounded-full"
        style={{ backgroundColor: color }}
      />
    </button>
  );
}
