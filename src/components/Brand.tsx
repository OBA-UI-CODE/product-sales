/*
  The brand name and its wordmark.

  Two rules, taken from the Figma file:

    WORDMARK  — nav, footer, auth screens, onboarding, hero headlines. Set in
                Dokdo, the display face, usually in primary/text green and at a
                larger size than the copy around it.
    PROSE     — every mention inside body copy (Terms, Privacy, FAQ answers,
                feature text) is PLAIN, in whatever font that paragraph uses.
                Checked against the Terms page (233:7218), where the whole
                paragraph is one DM Sans text node with no styled span.

  Getting that distinction wrong would set half the Terms page in a handwriting
  font, so the two cases are deliberately separate exports.

  The file itself is inconsistent about casing — the Nav (19:225) reads "JOhTA"
  while the footer, onboarding, copyright line and all legal copy read "JOHTA".
  OBA confirmed JOHTA, so it is defined once here; the Nav frame is the one to
  correct in Figma.
*/

import Link from "next/link";

export const BRAND = "JOHTA";

/*
  The wordmark as a way back to the website. Used on the screens that sit
  outside the site's own navigation (sign in, sign up, password reset,
  onboarding), where the logo was the only brand on the page and led nowhere,
  so leaving meant searching for JOHTA again.

  Wraps just the word, not the row it sits in, so only the logo is a target.
  It looks exactly as before; the visible text stays "JOHTA" and the label says
  where it goes.
*/
export function HomeLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/"
      aria-label={`${BRAND} home page`}
      className="rounded-md transition-opacity hover:opacity-80"
    >
      {children}
    </Link>
  );
}

/* Size and colour vary per placement, so both are left to the caller rather
   than baked in — the nav is 56px/-1.5, the footer 48px/-1, onboarding 64px. */
export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-brand ${className}`}>{BRAND}</span>;
}

/*
  The square logo mark — Figma 93:2259. An 86px rounded square on
  primary/border carrying a "J" in Dokdo. Scaled by the caller through
  className, since the footer uses 86 and smaller placements will not.
*/
export function LogoMark({
  className = "size-[86px] rounded-xl",
  letterClassName = "text-[64px]",
}: {
  className?: string;
  letterClassName?: string;
}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-primary-border ${className}`}
    >
      <span className={`font-brand leading-none text-white ${letterClassName}`}>
        {BRAND.charAt(0)}
      </span>
    </span>
  );
}
