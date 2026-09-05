const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
  {
    heading: "Get Started",
    links: [
      { label: "Start free trial", href: "/signup" },
      { label: "Sign In", href: "/login" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

const SOCIAL_LINKS = ["LinkedIn", "Facebook", "X", "Instagram"];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-16 px-6 py-16 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between md:gap-8">
          <div className="flex flex-col gap-4 md:max-w-[327px]">
            <span
              className="font-heading text-3xl font-bold"
              style={{ color: "var(--color-accent-light)" }}
            >
              Reko
            </span>
            <p className="text-base text-[var(--color-text-secondary)]">
              Reko. Every sale, accounted for.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:flex md:gap-16">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-4">
                <span className="font-heading text-lg font-semibold md:text-2xl">
                  {col.heading}
                </span>
                <div className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-[var(--color-text-secondary)] md:text-base"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-heading text-lg font-semibold md:text-2xl">
            Social Media
          </span>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)] md:text-base">
            {SOCIAL_LINKS.map((label, i) => (
              <span key={label} className="flex items-center gap-4">
                {/* No real social accounts exist yet — rendered as
                    non-navigating text rather than a dead href="#" link,
                    which would jump the page to top on click. Swap in
                    real URLs once the accounts exist. */}
                <span className="cursor-default">{label}</span>
                {i < SOCIAL_LINKS.length - 1 && (
                  <span className="h-4 w-px bg-[var(--color-border)]" />
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-8 text-sm text-[var(--color-text-secondary)] md:flex-row md:items-center md:justify-between">
          <span>© 2026 Reko. All rights reserved</span>
          <span>Made for the shops that keep the world moving</span>
        </div>
      </div>
    </footer>
  );
}
