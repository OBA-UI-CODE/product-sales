const SECTIONS = [
  {
    heading: "1. Acceptable use",
    body: "You agree to use Reko only for lawful business purposes. You may not use Reko to store fraudulent records, evade taxes, or engage in any illegal activity.",
  },
  {
    heading: "2. Your account",
    body: "You are responsible for keeping your login credentials secure and for all activity under your shop account, including actions taken by staff accounts you create.",
  },
  {
    heading: "3. Subscription and billing",
    body: "Reko is billed on a monthly or yearly subscription after your 14-day free trial. Subscriptions renew automatically unless cancelled. Fees are non-refundable except where required by law.",
  },
  {
    heading: "4. Intellectual property",
    body: "Reko, its logo, and all related branding are the property of Reko. You retain ownership of the sales and shop data you enter into the platform.",
  },
  {
    heading: "5. Limitation of liability",
    body: 'Reko is provided "as is." We are not liable for indirect or consequential damages arising from use of the service, including data loss, to the extent permitted by law.',
  },
  {
    heading: "6. Termination",
    body: "You may cancel your subscription at any time. We may suspend or terminate accounts that violate these terms or engage in abusive behavior toward the platform or other users.",
  },
  {
    heading: "7. Changes to these terms",
    body: "We may update these terms from time to time. We'll notify you of material changes by email or in-app notice before they take effect.",
  },
  {
    heading: "8. Contact us",
    body: "If you have questions about these Terms of Service, contact us at legal@reko.app.",
  },
];

export default function TermsPage() {
  return (
    <section className="mx-auto flex max-w-[890px] flex-col gap-8 px-6 py-16 md:py-20">
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-[48px] font-semibold leading-tight md:text-[72px]">
          Terms of Service
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] md:text-2xl md:font-heading md:font-semibold">
          Last updated: September 2026. These Terms govern your use of Reko.
          By using Reko, you agree to these terms.
        </p>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.heading} className="flex flex-col gap-3">
          <h2 className="font-heading text-2xl font-semibold md:text-[40px]">
            {s.heading}
          </h2>
          <p className="text-base text-[var(--color-text-secondary)] md:text-2xl md:font-heading md:font-semibold">
            {s.body}
          </p>
        </div>
      ))}
    </section>
  );
}
