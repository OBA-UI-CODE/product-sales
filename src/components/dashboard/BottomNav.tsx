"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./NavItems";

/*
  Mobile bottom bar — Figma 212:4743. Mobile only; the sidebar takes over from
  tablet up.

    bar     bg/canvas, 1px top border/strong, 105 tall, px 23 with the row
            at y19 - the space left under it is not padding but room for the
            phone's home indicator
    row     each item a centred icon (24) over a label. The file spaces them
            with a 26 gap, which at 393 works out the same as justify-between
            across the 347-wide row - and unlike a fixed gap it cannot force a
            sideways scroll once a scrollbar narrows the viewport.
    label   Inter Regular 14/20 — text/secondary, primary/text when active
    active  green icon + green label, with NO filled pill (unlike the sidebar,
            which fills the active row and keeps its icon white)

  The file uses an 8px icon-to-label gap on the first three items and 4px on
  the last two. That reads as a slip rather than intent, so 8 is used
  throughout — otherwise the five labels sit on two different baselines.
*/
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 h-[105px] border-t border-border-strong bg-bg-canvas px-[23px] pt-[19px] tab:hidden">
      <div className="flex w-full items-start justify-between">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-2"
            >
              <img
                src={active ? item.activeIcon : item.icon}
                alt=""
                aria-hidden
                width={24}
                height={24}
                className="size-6 shrink-0"
              />
              <span
                className={`whitespace-nowrap text-center font-body text-[14px] font-normal leading-[20px] ${
                  active ? "text-primary-text" : "text-text-secondary"
                }`}
              >
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
