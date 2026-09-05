"use client";

import { useState } from "react";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)]">
      <header className="mx-auto flex max-w-[1312px] items-center justify-between gap-6 px-6 py-6 md:gap-6 lg:justify-start lg:gap-[167px]">
        <Link
          href="/"
          className="font-heading font-bold leading-none tracking-[-1.5px] text-[32px] md:font-semibold md:text-[48px] lg:font-bold lg:text-[56px]"
          style={{ color: "var(--color-accent-light)" }}
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

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-6 w-6 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className="h-0.5 w-full bg-white" />
          <span className="h-0.5 w-full bg-white" />
        </button>
      </header>

      {/* Mobile menu — no expanded-state frame found in Figma for this;
          sizes below are carried over from the tablet nav as a reasonable
          default. Flagged for Oba to confirm/replace if a mobile menu
          design exists elsewhere in the file. */}
      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-[var(--color-border)] px-6 py-6 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-lg font-semibold text-white"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-[10px] border border-[var(--color-border)] font-heading text-lg font-semibold text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-primary)] font-heading text-lg font-semibold text-white"
          >
            Get Started
          </Link>
        </div>
      )}

      <main>{children}</main>
    </div>
  );
}
