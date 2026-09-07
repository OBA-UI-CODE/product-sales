"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./NavItems";

/*
  Dashboard sidebar — Figma 201:3096 (web) / 203:3855 (tablet).
  Hidden on mobile, where BottomNav takes over.

    column   256 wide, inner content 208 at 24,24, gap 48
    profile  50px avatar on primary/default, initials Inter Regular 18/28;
             name DM Sans Medium 20/24 -1; role Inter Regular 16/24 secondary
    item     px 12 py 10, radius 8, gap 10, icon 24,
             label Inter Medium 18/28 text/primary; items 24 apart
    active   filled with primary/default (the icon stays white)
    logout   pinned to the bottom of the nav column
*/
export default function Sidebar({
  name,
  role,
  initials,
  onSignOut,
}: {
  name: string;
  role: string;
  initials: string;
  onSignOut: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col bg-bg-canvas p-6 tab:flex">
      <div className="flex h-full w-[208px] flex-col gap-12">
        <div className="flex items-center gap-3">
          <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-primary-default">
            <span className="font-body text-[18px] font-normal leading-[28px] text-text-primary">
              {initials}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="whitespace-nowrap font-heading text-[20px] font-medium leading-[24px] tracking-[-1px] text-text-primary">
              {name}
            </p>
            <p className="whitespace-nowrap font-body text-[16px] font-normal leading-[24px] capitalize text-text-secondary">
              {role}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <nav className="flex w-full flex-col gap-6">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-2.5 overflow-hidden rounded-[8px] px-3 py-2.5 ${
                    active ? "bg-primary-default" : ""
                  }`}
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden
                    width={24}
                    height={24}
                    className="size-6 shrink-0"
                  />
                  <span className="whitespace-nowrap font-body text-[18px] font-medium leading-[28px] text-text-primary">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <form action={onSignOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 overflow-hidden rounded-[8px] px-3 py-2.5"
            >
              <img
                src="/figma/icon-nav-logout.svg"
                alt=""
                aria-hidden
                width={24}
                height={24}
                className="size-6 shrink-0"
              />
              <span className="whitespace-nowrap font-body text-[18px] font-medium leading-[28px] text-text-primary">
                Logout
              </span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
