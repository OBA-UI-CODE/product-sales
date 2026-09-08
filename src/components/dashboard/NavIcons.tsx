/*
  Navigation icons, inline.

  These were <img src="/figma/icon-nav-*.svg"> before. An <img> paints the
  colours baked into the file and cannot inherit anything from the page, so:

    · icon-nav-home-active.svg had stroke="#1D9E75" hard-coded, which meant
      the active Home icon stayed brand green no matter which accent the shop
      owner picked — while the label beside it followed the theme correctly.
      Green icon, purple word, in the same nav item.
    · every other icon was stroke="white" and its "active" variant pointed at
      the same file, so those icons never changed on the current page at all.

  Inlined, every stroke is currentColor, so an icon is simply the colour of
  the text around it and the theme reaches it for free. This is the same fix
  the dashboard's trend arrow needed for the same reason.

  Geometry is untouched — the path data is copied verbatim from the exported
  files, so these are the Figma icons, just recoloured by their container.
*/

export interface NavIconProps {
  className?: string;
}

/*
  Shared frame: 24px box, round joins, no fill.

  strokeWidth is a prop because the logout icon is drawn at 1.5 in the design
  while the five nav icons are at 2. Forcing them all to one weight would make
  logout visibly heavier than it is in Figma.
*/
function Svg({
  className,
  strokeWidth = 2,
  children,
}: NavIconProps & { strokeWidth?: number; children: React.ReactNode }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      className={`size-6 shrink-0 ${className ?? ""}`}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: NavIconProps) {
  return (
    <Svg {...props}>
      <path d="M4 9V19C4 19.2652 4.10536 19.5196 4.29289 19.7071C4.48043 19.8946 4.73478 20 5 20H19C19.2652 20 19.5196 19.8946 19.7071 19.7071C19.8946 19.5196 20 19.2652 20 19V9M3 9L4.5 4H19.5L21 9H3Z" />
    </Svg>
  );
}

export function ChartIcon(props: NavIconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20V10M10 20V4M16 20V14M22 20H2" />
    </Svg>
  );
}

export function BoxIcon(props: NavIconProps) {
  return (
    <Svg {...props}>
      <path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" />
      <path d="M3 8L12 13M12 13L21 8M12 13V21" />
    </Svg>
  );
}

export function ReceiptIcon(props: NavIconProps) {
  return (
    <Svg {...props}>
      <path d="M5 2V22L7 20.5L9 22L11 20.5L13 22L15 20.5L17 22L19 20.5V2L17 3.5L15 2L13 3.5L11 2L9 3.5L7 2L5 3.5V2Z" />
      <path d="M8 8H16M8 12H16" />
    </Svg>
  );
}

export function ShieldIcon(props: NavIconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2L20 5V11C20 16 16.5 19.5 12 21C7.5 19.5 4 16 4 11V5L12 2Z" />
      <path d="M9 12L11 14L15 10" />
    </Svg>
  );
}

export function LogoutIcon(props: NavIconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="M17.44 14.62L20 12.06L17.44 9.5" />
      <path d="M9.76 12.06H19.93" />
      <path d="M11.76 20C7.34 20 3.76 17 3.76 12C3.76 7 7.34 4 11.76 4" />
    </Svg>
  );
}
