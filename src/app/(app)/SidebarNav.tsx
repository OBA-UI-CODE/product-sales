"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Package, Receipt, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/sales-history", label: "Sales History", icon: BarChart3 },
  { href: "/products", label: "Product", icon: Package },
  { href: "/debts", label: "Debts", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-[10px] px-4 py-3 text-lg font-medium transition ${
              active
                ? "bg-[var(--color-primary)] text-white"
                : "text-white hover:bg-[var(--color-bg-surface)]"
            }`}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
