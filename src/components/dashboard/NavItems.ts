/*
  One source for both navs. The labels differ between them in the design —
  the sidebar says "Sales History" / "Product", the mobile bar says
  "History" / "Products" — so each label is carried separately rather than
  picking one and using it in both places.
*/
export const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    shortLabel: "Home",
    icon: "/figma/icon-nav-home.svg",
    activeIcon: "/figma/icon-nav-home-active.svg",
  },
  {
    href: "/sales-history",
    label: "Sales History",
    shortLabel: "History",
    icon: "/figma/icon-nav-chart.svg",
    activeIcon: "/figma/icon-nav-chart.svg",
  },
  {
    href: "/products",
    label: "Product",
    shortLabel: "Products",
    icon: "/figma/icon-nav-box.svg",
    activeIcon: "/figma/icon-nav-box.svg",
  },
  {
    href: "/debts",
    label: "Debts",
    shortLabel: "Debts",
    icon: "/figma/icon-nav-receipt.svg",
    activeIcon: "/figma/icon-nav-receipt.svg",
  },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: "/figma/icon-nav-shield.svg",
    activeIcon: "/figma/icon-nav-shield.svg",
  },
] as const;
