import {
  BoxIcon,
  ChartIcon,
  HomeIcon,
  ReceiptIcon,
  ShieldIcon,
  TrendIcon,
} from "./NavIcons";

/*
  One source for both navs. The labels differ between them in the design —
  the sidebar says "Sales History" / "Product", the mobile bar says
  "History" / "Products" — so each label is carried separately rather than
  picking one and using it in both places. The mobile labels are now the
  owner's shorter "Sales" / "Stock" / "Account" (12 September 2026).

  Icons are COMPONENTS, not file paths. They used to be <img src=...>, which
  paints whatever colour is baked into the SVG and cannot follow the shop's
  theme — see NavIcons.tsx. There is no separate "active" icon any more
  either: an active icon is just the same icon in a different colour, which
  is now the caller's business rather than a second file.
*/
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", shortLabel: "Home", Icon: HomeIcon },
  {
    href: "/sales-history",
    label: "Sales History",
    shortLabel: "Sales",
    Icon: ChartIcon,
  },
  /*
    Not in the Figma nav (added 12 September 2026 with the Insights page).
    Sidebar only: on phones the bottom bar stays at five, and Insights is
    reached from a button at the top of Sales History (the "Sales" item
    stays highlighted while on it).
  */
  { href: "/insights", label: "Insights", shortLabel: "Insights", Icon: TrendIcon, mobile: false },
  { href: "/products", label: "Product", shortLabel: "Stock", Icon: BoxIcon },
  { href: "/debts", label: "Debts", shortLabel: "Debts", Icon: ReceiptIcon },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "Account",
    Icon: ShieldIcon,
  },
] as const;
