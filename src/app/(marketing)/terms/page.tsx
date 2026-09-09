import LegalPage, { type LegalSection } from "@/components/marketing/LegalPage";

import type { Metadata } from "next";

/*
  Its own title and description. Every page used to inherit one set from the
  root layout, which tells a search engine these pages are interchangeable and
  gives it no reason to show this one for a relevant search. The canonical url
  states which address is the real one, so query strings and any preview
  domain do not compete with johta.click.
*/
export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms covering your use of JOHTA.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service · JOHTA",
    description: "The terms covering your use of JOHTA.",
    url: "/terms",
  },
};

/*
  Terms of Service — Figma 187:1667 (web) / 187:1732 (tablet) / 187:1797 (mobile)

  Gap to the footer, measured from the file: 67 / 98 / 69
  (mobile 2371->2438, tablet 2748->2846, web 2635->2704).
*/

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Acceptable use",
    body: "You agree to use JOHTA only for lawful business purposes. You may not use JOHTA to store fraudulent records, evade taxes, or engage in any illegal activity.",
  },
  {
    heading: "2. Your account",
    body: "You are responsible for keeping your login credentials secure and for all activity under your shop account, including actions taken by staff accounts you create.",
  },
  {
    heading: "3. Subscription and billing",
    body: "JOHTA is billed on a monthly or yearly subscription after your one-month free trial. Subscriptions renew automatically unless cancelled. Fees are non-refundable except where required by law.",
  },
  {
    heading: "4. Intellectual property",
    body: "JOHTA, its logo, and all related branding are the property of JOHTA. You retain ownership of the sales and shop data you enter into the platform.",
  },
  {
    heading: "5. Limitation of liability",
    body: "JOHTA is provided “as is.” We are not liable for indirect or consequential damages arising from use of the service, including data loss, to the extent permitted by law.",
  },
  {
    heading: "6. Termination",
    body: "You may cancel your subscription at any time. We may suspend or terminate accounts that violate these terms or engage in abusive behavior toward the platform or other users.",
  },
  {
    heading: "7. Changes to these terms",
    body: "We may update these terms from time to time. We’ll notify you of material changes by email or in-app notice before they take effect.",
  },
  {
    heading: "8. Contact us",
    body: "If you have questions about these Terms of Service, contact us at johtahelp@gmail.com",
  },
];

export default function TermsPage() {
  return (
    <div className="pb-[67px] tab:pb-[98px] web:pb-[69px]">
      <LegalPage
        title="Terms of Service"
        intro="Last updated: September 2026. These Terms govern your use of JOHTA. By using JOHTA, you agree to these terms."
        sections={SECTIONS}
      />
    </div>
  );
}
