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
    heading: "1. Who we are and who these terms cover",
    body: "JOHTA is a record-keeping service for small shops, operated from Nigeria and reachable at johtahelp@gmail.com. These terms are an agreement between JOHTA and the person who opens a shop account (“the owner”). They also cover anyone the owner adds as staff, and the owner is responsible for making sure their staff know them. By creating an account or using JOHTA you accept these terms; if you do not accept them, please do not use the service.",
  },
  {
    heading: "2. Your account and your staff",
    body: "You must give accurate details when you sign up and keep your password to yourself. You are responsible for everything done under your shop account, including by staff accounts you create. Staff accounts are administered entirely by the owner: the owner sets and changes staff passwords and can remove a staff member at any time. Staff may log sales, and may edit or delete only the sales they logged themselves; the owner can edit or delete any sale in the shop. Tell us promptly at johtahelp@gmail.com if you believe someone has gained access to your account.",
  },
  {
    heading: "3. Plans, free trial, subscription and renewal",
    body: "JOHTA has a Free plan and a paid plan. The Free plan costs nothing and has no time limit; it covers logging sales, products and stock, sizes and packs, low-stock warnings, debts, one staff account, and the last 30 days of sales history. The paid plan adds receipts, unlimited staff accounts, your full sales history and downloading your records, and costs ₦1,599 per month or ₦15,990 per year; both give the same features. Every new shop gets the paid plan free for its first month. No card is required to start, and we do not ask for one until you choose to subscribe. When the trial ends without a subscription, the shop moves to the Free plan. Subscriptions renew automatically at the end of each period at the price then shown on our pricing page, and continue until you cancel. You can cancel at any time from Settings, and cancelling stops the next renewal rather than ending your access immediately, so you keep full use until the period you have already paid for runs out. Because payment is taken when a subscription starts, choosing to subscribe while you still have free trial left ends the remaining trial; the billing screen says so before you confirm.",
  },
  {
    heading: "4. Payments and refunds",
    body: "Payments are processed by Paystack. Your card details are entered on Paystack’s own checkout and are never seen or stored by JOHTA. Prices are in Nigerian Naira and include any tax we are required to charge. If a payment fails we may retry it, and your shop is on the Free plan until it succeeds. We do not generally give refunds for time already paid for, but if you were charged in error, or something on our side stopped you using the service, write to us at johtahelp@gmail.com and we will put it right. Nothing here removes rights you have under Nigerian consumer law.",
  },
  {
    heading: "5. If you stop paying",
    body: "When a trial ends without a subscription, or a subscription lapses, your shop moves to the Free plan. You keep your account and keep logging sales. The paid features switch off: receipts stop, sales older than 30 days are hidden, only one staff member keeps access, and your records can no longer be downloaded. Nothing is deleted. Hidden sales, paused staff and every other record come back the moment you subscribe again. Sales that are still owed stay visible however old they are.",
  },
  {
    heading: "6. Your data belongs to you",
    body: "The sales, products, stock counts and customer details you enter remain yours. We claim no ownership of them and we do not sell them or use them to advertise to you. On the paid plan you can download everything as a spreadsheet from Settings. On any plan you can ask us for a copy of the personal data we hold about you, free of charge, as described in our Privacy Policy. We use your data only to run the service for you, to keep it secure, and as described in our Privacy Policy.",
  },
  {
    heading: "7. Acceptable use",
    body: "Use JOHTA only for lawful business record-keeping. Do not use it to keep false records, to evade tax, to store other people’s personal information without a proper reason, or for anything illegal. Do not attempt to break into the service, reach another shop’s data, overload our systems, or copy the software. If you record a customer’s name because they owe you money, you are responsible for handling that person’s details lawfully.",
  },
  {
    heading: "8. Availability",
    body: "We work to keep JOHTA available and dependable, but we do not promise it will never be unavailable. Maintenance, faults, and problems at the suppliers we depend on can interrupt the service. JOHTA needs an internet connection to record a sale, and we do not guarantee it will work while your phone is offline.",
  },
  {
    heading: "9. Our responsibility, and its limits",
    body: "We provide JOHTA with reasonable care but “as is”, without promises that it will be uninterrupted, error-free, or fit for a particular purpose. JOHTA is a record-keeping tool, not an accountant, and is not a substitute for professional accounting or tax advice. To the fullest extent the law allows, we are not liable for indirect or consequential loss, including lost profit or lost business, and our total liability to you for any claim is limited to the amount you paid us in the twelve months before it arose. Nothing here limits liability that cannot lawfully be limited, including for fraud or for death or personal injury caused by negligence.",
  },
  {
    heading: "10. Ending your account",
    body: "You can pause or delete your shop at any time from Settings. Pausing stops billing and keeps everything. Deleting closes the shop and removes your staff’s logins, and we keep your records for thirty days before destroying them permanently, so that a decision made in haste can be undone. Sign back in within that time and everything returns. We may suspend or close an account that breaks these terms, is used unlawfully, or is used abusively towards our team or other users; where it is reasonable to do so we will warn you first.",
  },
  {
    heading: "11. Changes to the service and to these terms",
    body: "JOHTA will change as we improve it, and we may add, alter or withdraw features. We may also update these terms. If a change materially affects your rights we will tell you by email or in the app before it takes effect, and continuing to use JOHTA afterwards means you accept the new terms. If you do not accept them, you may cancel and delete your account.",
  },
  {
    heading: "12. Governing law and disputes",
    body: "These terms are governed by the laws of the Federal Republic of Nigeria, and the Nigerian courts have jurisdiction over any dispute. Please write to us first at johtahelp@gmail.com, because nearly everything can be sorted out that way, and we would much rather fix a problem than argue about it.",
  },
  {
    heading: "13. Contact us",
    body: "Questions about these Terms of Service can be sent to johtahelp@gmail.com and we will reply as soon as we can.",
  },
];

export default function TermsPage() {
  return (
    <div className="pb-[67px] tab:pb-[98px] web:pb-[69px]">
      <LegalPage
        title="Terms of Service"
        intro="Last updated 10 September 2026. These terms explain what you can expect from JOHTA and what we ask of you. We have written them in plain English on purpose. They are a real agreement, and you should be able to read them without a lawyer."
        sections={SECTIONS}
      />
    </div>
  );
}
