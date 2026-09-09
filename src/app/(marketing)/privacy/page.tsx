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
  title: "Privacy Policy",
  description: "What JOHTA collects, how your shop's data is protected, and how to download or delete it.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy · JOHTA",
    description: "What JOHTA collects, how your shop's data is protected, and how to download or delete it.",
    url: "/privacy",
  },
};

/*
  Privacy Policy — Figma 238:7432 (web) / 238:7531 (tablet) / 238:7629 (mobile)

  Gap to the footer, measured from the file: 54 / 44 / 105
  (mobile 1925->1979, tablet 2203->2247, web 2177->2282).
*/

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Information we collect",
    body: "We collect information you provide directly, such as your name, email, shop details, and sales records you log through JOHTA. We also gather basic usage data to help us enhance the product.",
  },
  {
    heading: "2. How we use your information",
    body: "We use your information to provide and improve JOHTA’s services, process your subscription, send important account notices, and offer customer support.",
  },
  {
    heading: "3. How we share your information",
    body: "We do not sell your data. We share information only with service providers who assist us in running JOHTA (such as hosting and payment processing), and only as necessary to provide the service.",
  },
  {
    heading: "4. Data security",
    body: "Your shop’s data is private to your shop account. We employ industry-standard security practices, including encrypted storage and access controls, to safeguard your information.",
  },
  {
    heading: "5. Your rights",
    body: "You can access, correct, download or delete your data at any time from Settings — you do not need to ask us. You can also pause your shop, which stops billing but keeps your records. When you delete your shop we keep it for 30 days so you can change your mind, then it is permanently destroyed, including your staff’s logins. Before deleting, you can download a spreadsheet of every sale, debt and product to keep for your own records.",
  },
  {
    heading: "6. Contact us",
    body: "If you have questions about this Privacy Policy, contact us at johtahelp@gmail.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="pb-[54px] tab:pb-[44px] web:pb-[105px]">
      <LegalPage
        title="Privacy Policy"
        intro="Last updated: September 2026. This Privacy Policy explains how JOHTA collects, uses, and protects your information."
        sections={SECTIONS}
      />
    </div>
  );
}
