/*
  Dashboard stat card — Figma 203:3606 (web) / 205:4180 (tablet) / 205:4550 (mobile)

    card    bg/surface, 1px border/strong, radius/md, clipped
            web + tablet  content inset 15/13
            mobile        px 24, py 14
    label   web/tab Inter Medium 16/24 text/secondary
            mobile  Inter Regular 18/28 text/secondary
    value   DM Sans SemiBold 32/39 -1 text/primary at every size
    sub     web/tab Inter Regular 14/20   mobile Inter Regular 16/24, text/primary
    stack gap  16 on web and tablet, 12 on mobile

  The four cards are not one repeated block: each carries different trim in its
  footer (sparkline, avatar stack, or a bare delta), so the footer is passed in.

  Card icons are the exported Figma SVGs and are deliberately multi-coloured —
  coin #00E2E2, chart #FFE204, cart #5FA5E0, trend #E6A900 — so they are not
  recoloured to a token. The trend mark is also 20x12 rather than 24x24.
*/

export function ChangePill({
  direction,
  value,
  note,
}: {
  direction: "up" | "down";
  value: string;
  note?: string;
}) {
  /* A fall is amber and is set larger on mobile: 14/20 in color/amber/300
     (#e6a900, the warning token) on the mobile frame, 12/16 in
     color/amber/400 (#b88700, not a token) from tablet up. */
  const tone =
    direction === "down"
      ? "text-[14px] leading-[20px] text-warning-default tab:text-[12px] tab:leading-[16px] tab:text-[#b88700]"
      : "text-[12px] leading-[16px] text-primary-text";

  return (
    <div className="flex h-5 items-center gap-1">
      <div className={`flex items-center justify-center gap-1 ${tone}`}>
        {/* The exported arrow has the default green baked into its stroke, so
            it is inlined here with currentColor instead. Same geometry as the
            Figma export, but it follows the shop's accent colour (and the
            amber, when the number has fallen). */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className={`size-5 shrink-0 ${direction === "down" ? "-scale-y-100" : ""}`}
        >
          <path
            d="M10 15.8333V4.16667M15.8333 10L10 4.16667L4.16667 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="whitespace-nowrap text-center font-body font-normal">
          {value}
        </p>
      </div>
      {note && (
        /* texts/text-disabled #5c5c5c — also not in the palette. */
        <p className="whitespace-nowrap font-body text-[12px] font-normal leading-[16px] text-[#5c5c5c]">
          {note}
        </p>
      )}
    </div>
  );
}

/*
  Overlapping seller initials — Figma 203:3438. Four 26px circles stepped
  10/10/12 apart, so they sit under each other with the last slightly clear.
*/
export function AvatarStack({ names }: { names: string[] }) {
  const shown = names.slice(0, 4);
  const offsets = [0, 10, 20, 32];

  return (
    <div className="relative h-[26px] w-[58px] shrink-0">
      {shown.map((n, i) => (
        <div
          key={`${n}-${i}`}
          /* #040E18 is the file's own circle fill, not a token. */
          className="absolute top-0 flex size-[26px] items-center justify-center rounded-full bg-[#040E18]"
          style={{ left: offsets[i] }}
        >
          <span className="font-body text-[12px] font-normal leading-[16px] text-text-primary">
            {n}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ src }: { src: string }) {
  /* 62x31 on web and tablet, 84x42 on mobile — the file scales it up. */
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className="h-[42px] w-[84px] shrink-0 tab:h-[31px] tab:w-[62px]"
    />
  );
}

export default function StatCard({
  label,
  icon,
  value,
  sub,
  footer,
  mobileContentClass = "",
  iconClass = "size-6",
}: {
  label: string;
  icon: string;
  value: string;
  sub: string;
  footer: React.ReactNode;
  /* The mobile Low stock card (205:4524) is the one card whose inner column is
     given a fixed 178 height, which is what makes it 208 tall while the others
     hug their content. */
  mobileContentClass?: string;
  /* Three of the four card icons are 24x24, but Low stock's is a 20x12 vector
     turned 180 degrees. The SVGs carry preserveAspectRatio="none", so giving
     them all one size would stretch that one out of shape. */
  iconClass?: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border-strong bg-bg-surface px-6 py-3.5 tab:h-[178px] tab:px-[15px] tab:py-[13px] web:h-[179px]">
      <div
        className={`flex w-full flex-col gap-3 tab:h-full tab:gap-4 ${mobileContentClass}`}
      >
        <div className="flex w-full flex-col gap-3 tab:gap-4">
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full items-center justify-between">
              {/* The label box is a fixed 24 tall in the file even though its
                  line-height is 28 - that is what makes the card content add
                  up to the height the card is drawn at. */}
              <p className="h-6 font-body text-[18px] font-normal leading-[28px] text-text-secondary tab:text-[16px] tab:font-medium tab:leading-[24px]">
                {label}
              </p>
              <img
                src={icon}
                alt=""
                aria-hidden
                className={`shrink-0 ${iconClass}`}
              />
            </div>
            <p className="w-full font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary">
              {value}
            </p>
          </div>
          <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-primary tab:text-[14px] tab:leading-[20px]">
            {sub}
          </p>
        </div>
        <div className="tab:mt-auto">{footer}</div>
      </div>
    </div>
  );
}
