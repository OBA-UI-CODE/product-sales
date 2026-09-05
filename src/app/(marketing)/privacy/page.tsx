const SECTIONS = [
  {
    heading: "1. Information we collect",
    body: "We collect information you provide directly, such as your name, email, shop details, and sales records you log through Reko. We also collect basic usage data to help us improve the product.",
  },
  {
    heading: "2. How we use your information",
    body: "We use your information to provide and improve Reko's services, process your subscription, send important account notices, and provide customer support.",
  },
  {
    heading: "3. How we share your information",
    body: "We do not sell your data. We share information only with service providers who help us run Reko (such as hosting and payment processing), and only as needed to provide the service.",
  },
  {
    heading: "4. Data security",
    body: "Your shop's data is private to your shop account. We use industry-standard security practices, including encrypted storage and access controls, to protect your information.",
  },
  {
    heading: "5. Your rights",
    body: "You can access, correct, or request deletion of your data at any time by contacting us. If you close your account, your data is retained only as long as necessary and then deleted.",
  },
  {
    heading: "6. Contact us",
    body: "If you have questions about this Privacy Policy, contact us at privacy@reko.app.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="mx-auto flex max-w-[890px] flex-col gap-8 px-6 py-16 md:py-20">
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-[48px] font-semibold leading-tight md:text-[72px]">
          Privacy Policy
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] md:text-2xl md:font-heading md:font-semibold">
          Last updated: September 2026. This Privacy Policy explains how
          Reko collects, uses, and protects your information.
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
