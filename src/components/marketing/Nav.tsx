"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  Nav Bars — Figma nodes:
    web    19:225  (1312x73  @ x=64  y=44)
    tablet 19:313  (738x58   @ x=48  y=44)
    mobile 19:342  (345x39   @ x=24  y=24)

  Heights are driven by the logo's line box (56/73, 48/58, 32/39), so no
  explicit height is set — matching Figma's HUG behaviour.
*/

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/*
        relative z-50 so the header stays ABOVE the mobile menu overlay, which
        is z-40. Without it the overlay covered the header, and the close "X"
        — which is the same button as the hamburger — was rendered underneath
        it: present in the DOM, invisible, and impossible to tap. The only way
        out of the menu was to pick a link.

        Harmless above mobile, where the overlay is hidden entirely.
      */}
      <header className="relative z-50 mx-auto w-full max-w-[1440px] px-6 pt-6 tab:px-12 tab:pt-11 web:px-16">
        {/* mobile: space-between · tablet: packed w/ 24px gaps · web: space-between */}
        <nav className="flex items-center justify-between gap-6 tab:justify-start web:justify-between">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="shrink-0 whitespace-nowrap font-brand leading-[39px] tracking-[-1px] text-[32px] text-primary-text tab:text-[48px] tab:leading-[58px] web:text-[56px] web:leading-normal web:tracking-[-1.5px]"
          >
            JOHTA
          </Link>

          {/* Inline links — tablet and up */}
          <div className="hidden items-center justify-center whitespace-nowrap font-heading font-semibold tracking-[-1px] tab:flex tab:gap-5 tab:text-[18px] tab:leading-[22px] web:gap-8 web:text-[32px] web:leading-[39px]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`link-underline hover:text-text-primary ${
                  isActive(link.href) ? "text-primary-text" : "text-text-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons — tablet and up */}
          <div className="hidden shrink-0 items-center gap-6 tab:flex">
            <Link
              href="/login"
              className="press flex min-h-12 items-center justify-center whitespace-nowrap rounded-md px-6 font-heading font-semibold tracking-[-1px] text-primary-text tab:text-[18px] tab:leading-[22px] web:h-12 web:text-[24px] web:leading-[29px]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="press flex min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading font-semibold tracking-[-1px] text-text-on-primary tab:text-[20px] tab:leading-[24px] web:h-12 web:text-[24px] web:leading-[29px]"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger — mobile only. Icon is the asset exported from Figma. */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-6 shrink-0 items-center justify-center tab:hidden"
          >
            {menuOpen ? (
              /* No expanded-menu design exists in the Figma file — this close
                 icon mirrors the exported hamburger's stroke spec (2px, round
                 caps, white). Flagged as designed, not extracted. */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <img src="/figma/icon-menu.svg" alt="" width={24} height={24} />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay — designed, not extracted (no Figma design exists).
          Uses only tokens already established by the audited screens. */}
      <div
        className={`fixed inset-0 z-40 bg-bg-canvas transition-opacity duration-200 tab:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col px-6 pt-24 pb-10">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-md px-2 py-4 font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] active:bg-bg-surface ${
                  isActive(link.href) ? "text-primary-text" : "text-text-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="my-6 h-px bg-border-default" />

          <div className="mt-auto flex flex-col gap-4">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex h-12 items-center justify-center rounded-md border border-border-default font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-primary-text"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="press flex h-12 items-center justify-center rounded-md bg-primary-default font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-on-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
