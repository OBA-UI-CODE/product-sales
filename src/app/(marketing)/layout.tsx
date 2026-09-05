"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the mobile menu is open, like any full-screen
  // overlay menu should.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)]">
      <header className="relative z-50 mx-auto flex max-w-[1312px] items-center justify-between gap-6 px-6 py-6 md:gap-6 lg:justify-start lg:gap-[167px]">
        <Link
          href="/"
          className="font-heading font-bold leading-none tracking-[-1.5px] text-[32px] md:font-semibold md:text-[48px] lg:font-bold lg:text-[56px]"
          style={{ color: "var(--color-accent-light)" }}
          onClick={() => setMenuOpen(false)}
        >
          Reko
        </Link>

        {/* Desktop + tablet inline nav */}
        <nav className="hidden items-center gap-5 md:flex lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-[18px] font-semibold text-white lg:text-[32px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex lg:ml-auto">
          <Link
            href="/login"
            className="flex h-12 items-center rounded-[10px] px-6 font-heading text-lg font-semibold text-white lg:text-2xl"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex h-12 items-center rounded-[10px] bg-[var(--color-primary)] px-6 font-heading text-xl font-semibold text-white transition hover:bg-[var(--color-primary-hover)] lg:text-2xl"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger / close toggle */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] text-white md:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile full-screen menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--color-bg-canvas)] transition-opacity duration-200 md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col px-6 pt-28 pb-10">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-[10px] px-2 py-4 font-heading text-2xl font-semibold text-white active:bg-[var(--color-bg-surface)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="my-6 h-px bg-[var(--color-border)]" />

          <div className="mt-auto flex flex-col gap-4">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex h-12 items-center justify-center rounded-[10px] border border-[var(--color-border)] font-heading text-lg font-semibold text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-primary)] font-heading text-lg font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}
