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
  description: "What JOHTA collects, how your shop's data is protected, and how to get a copy of it or delete it.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy · JOHTA",
    description: "What JOHTA collects, how your shop's data is protected, and how to get a copy of it or delete it.",
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
    heading: "1. Who is responsible for your data",
    body: "JOHTA is the data controller for the information described here. We are based in Nigeria and you can reach us about anything in this policy at johtahelp@gmail.com. This policy is written to meet the Nigeria Data Protection Act 2023, and we have kept it in plain English so it is actually readable.",
  },
  {
    heading: "2. What we collect",
    body: "When you sign up we collect your name, email address and a password, which is stored only in scrambled form that nobody at JOHTA can read. When you set up your shop we collect its name, what you sell and the colour you pick. As you use JOHTA we hold the records you enter: sales, prices, quantities, products, stock counts, and the names you type against unpaid debts. If you add staff we hold their name, email and role. If you subscribe we hold your plan and payment status, but never your card number, which only Paystack ever sees. We also keep ordinary technical records such as sign-in times, and anything you write to us through the contact form.",
  },
  {
    heading: "3. Information about your customers",
    body: "This one deserves saying plainly. When you record that someone owes you money, you are giving us another person’s name. We hold it only to show you your own debt list, we never contact them, and we never use it for anything else. Under Nigerian data protection law you are responsible for having a proper reason to record it, and we would ask you to record no more than you need. A first name and what is owed is usually enough.",
  },
  {
    heading: "4. Why we are allowed to use it, and what for",
    body: "We use your data to run the service you asked for: keeping your records, showing your totals and letting your staff sign in. The law calls this performance of a contract. We use it to take payment when you subscribe, also part of that contract. We use limited technical information to keep the service secure and working, which is our legitimate interest as a business. And we keep certain records where the law requires it. We do not use your data to advertise to you, and we do not make automated decisions about you.",
  },
  {
    heading: "5. We do not sell your data",
    body: "We have never sold customer data and we will not. We share it only with the suppliers that make JOHTA work: Supabase stores the database and manages sign-in, Vercel runs the website, Resend delivers our emails, and Paystack processes payments. Each receives only what it needs to do its job. We may also disclose data where the law requires it, or to protect someone’s safety or our legal rights.",
  },
  {
    heading: "6. Where your data is kept",
    body: "Your data is stored on servers in Ireland, and our own servers run in Dublin alongside them so the app stays fast. That means your data leaves Nigeria. We are satisfied this is lawful because Ireland is covered by European data protection law, which gives protection comparable to the Nigeria Data Protection Act, and our providers are bound by contract to protect it. If you would rather your data were held in Nigeria, tell us. We would like to know that people care about it.",
  },
  {
    heading: "7. How long we keep it",
    body: "We keep your records for as long as your shop is open, because they are the reason you are here. If you pause your shop we keep everything until you return. If you delete your shop we keep it for thirty days so a decision made in haste can be undone, and then it is permanently destroyed by an automatic job that runs every night, taking your sales, products, debts and your staff’s logins with it. After that it is gone, and not even we can bring it back. Messages sent through the contact form are kept for up to two years.",
  },
  {
    heading: "8. Keeping it safe",
    body: "Every shop’s data is separated at the database level, not merely hidden in the app, so one shop cannot reach another’s records even by guessing. Traffic is encrypted, passwords are stored scrambled and are checked against a list of passwords known to have leaked elsewhere, and staff access is controlled by the shop owner. No system is perfectly safe, and we will not pretend otherwise. If a breach ever put your rights at risk, we will report it to the Nigeria Data Protection Commission within 72 hours and tell you directly what happened and what to do.",
  },
  {
    heading: "9. Your rights over your data",
    body: "You can ask us to show you what we hold, correct anything wrong, delete it, restrict or object to how we use it, or hand it to you in a portable form. Much of this you can do yourself, immediately, without asking: you can edit your records, pause your shop or delete it outright from Settings, and on the paid plan you can download every sale, debt and product as a spreadsheet. Whatever plan you are on, you can ask for a copy of the personal data we hold about you, in a portable form, by writing to johtahelp@gmail.com. That is free, and we will respond within 30 days, as we will to any other request. If you are not satisfied with how we have handled it, you may complain to the Nigeria Data Protection Commission.",
  },
  {
    heading: "10. Children",
    body: "JOHTA is for people running a business and is not intended for anyone under 18. We do not knowingly collect data from children, and if we learn that we have, we will delete it.",
  },
  {
    heading: "11. Cookies and tracking",
    body: "We use only what is necessary to keep you signed in and to remember small preferences such as whether you have dismissed a message. We do not use advertising cookies and we do not track you across other websites.",
  },
  {
    heading: "12. Changes to this policy",
    body: "If we change how we handle your data in a way that affects you, we will update this page and tell you by email or in the app before it takes effect. The date at the top always shows when it last changed.",
  },
  {
    heading: "13. Contact us",
    body: "Any question about this policy, or any request about your data, can go to johtahelp@gmail.com and a person will read it.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="pb-[54px] tab:pb-[44px] web:pb-[105px]">
      <LegalPage
        title="Privacy Policy"
        intro="Last updated 10 September 2026. This policy explains what JOHTA collects, why, who else sees it, and what you can do about it. Your shop’s records are yours. We do not sell them, and you can delete them yourself at any time."
        sections={SECTIONS}
      />
    </div>
  );
}
