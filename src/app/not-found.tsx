import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";

/*
  404: any address that does not exist, on the website or inside the app.

  There is no Figma design for this page (checked 13 Sep 2026), so it is
  built from the website's own pieces: the marketing Nav and Footer, the
  hero's badge, its two-tone headline (light green, then the darker green)
  and its two buttons. Replaces Next's bare black "404 | This page could not
  be found", which had no way back and made the site look broken.

  One page serves both the website and the app. "Go to my dashboard" works
  for everyone: signed-in people land on their dashboard, anyone else is
  sent to sign in by the middleware, which is the right next step for them
  too. Checking the session here instead would add a database round trip to
  every mistyped address.

  Next sends this with a real 404 status, and it is kept out of search
  results.
*/

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Go to the JOHTA homepage or your dashboard.",
  robots: { index: false, follow: true },
};

const HELPFUL_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact us" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-canvas">
      <Nav />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-6 pb-[105px] pt-12 tab:px-12 tab:pt-20 web:px-16 web:pt-24">
        <div className="flex w-full max-w-[720px] flex-col items-center gap-6 text-center tab:gap-8">
          <div className="flex h-12 min-h-12 items-center justify-center rounded-md bg-primary-subtle px-6">
            <p className="whitespace-nowrap font-body text-[14px] font-semibold leading-[20px] text-text-primary tab:text-[18px] tab:font-medium tab:leading-[28px]">
              Error 404
            </p>
          </div>

          <h1 className="font-heading text-[40px] font-semibold leading-[48px] tracking-[-1px] text-primary-text tab:text-[56px] tab:leading-[68px] web:text-[64px] web:leading-[77px]">
            <span className="text-green-100">This page</span> doesn&apos;t exist.
          </h1>

          <p className="max-w-[560px] font-body text-[16px] leading-[24px] text-text-secondary tab:text-[18px] tab:leading-[28px]">
            The link may be old, or the address may have a typo. Your sales and
            records are safe; nothing is missing.
          </p>

          <div className="flex w-full flex-col items-center gap-4 tab:w-auto tab:flex-row tab:gap-6">
            <Link
              href="/"
              className="press flex h-12 min-h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-on-primary tab:w-auto"
            >
              Go to homepage
            </Link>
            <Link
              href="/dashboard"
              className="press flex h-12 min-h-12 w-full items-center justify-center whitespace-nowrap rounded-md border border-border-default px-6 font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-text-primary hover:border-primary-border tab:w-auto tab:text-[20px] tab:leading-[24px]"
            >
              Go to my dashboard
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 pt-4">
            <p className="font-body text-[14px] leading-[20px] text-text-secondary">
              Or try one of these
            </p>
            <nav aria-label="Helpful pages" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {HELPFUL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-primary-text hover:underline"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
