import ContactSection from "@/components/marketing/ContactSection";

import type { Metadata } from "next";

/*
  Its own title and description. Every page used to inherit one set from the
  root layout, which tells a search engine these pages are interchangeable and
  gives it no reason to show this one for a relevant search. The canonical url
  states which address is the real one, so query strings and any preview
  domain do not compete with johta.click.
*/
export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions, support or feedback — send the JOHTA team a message and we will get back to you.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us · JOHTA",
    description: "Questions, support or feedback — send the JOHTA team a message and we will get back to you.",
    url: "/contact",
  },
};

/*
  Contact — Figma 146:8867 (web) / 146:8969 (tablet) / 146:9058 (mobile)

  Order per the file: Nav (layout) -> Contact section -> Footer (layout).
  There is no Final CTA or Trust strip on this page.

  Gap to the footer, measured from the file: 29 / 81 / 94
  (mobile 1015->1044, tablet 698->779, web 832->926).
*/
export default function ContactPage() {
  return (
    <div className="pb-[29px] tab:pb-[81px] web:pb-[94px]">
      <ContactSection />
    </div>
  );
}
