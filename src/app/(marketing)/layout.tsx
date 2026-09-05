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
  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)]">
      <header className="mx-auto flex max-w-[1312px] items-center gap-[167px] px-6 py-6">
        <Link
          href="/"
          className="font-heading text-[56px] font-bold leading-none tracking-[-1.5px]"
          style={{ color: "var(--color-accent-light)" }}
        >
          Reko
        </Link>

        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-[32px] font-semibold text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-6">
          <Link
            href="/login"
            className="flex h-12 items-center rounded-[10px] px-6 font-heading text-2xl font-semibold text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex h-12 items-center rounded-[10px] bg-[var(--color-primary)] px-6 font-heading text-2xl font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
