const REASONS = [
  {
    title: "One honest record",
    body: "Your whole team works from the same book — every sale, logged under the person who made it.",
  },
  {
    title: "Simple by design",
    body: "Clear enough to hand to any staff member on their first day — no training manual required.",
  },
  {
    title: "Numbers you can trust",
    body: "Accurate totals and live stock, honest enough to trust with every naira.",
  },
];

export default function WhyReko() {
  return (
    <section className="mx-auto flex max-w-[1312px] flex-col gap-10 px-6 py-12 md:py-16 lg:py-20">
      <h2 className="max-w-[900px] font-heading text-[32px] font-semibold leading-tight md:text-[48px]">
        Your sales accountability right in front of you.
      </h2>

      <div className="flex flex-col gap-8">
        <h3 className="font-heading text-2xl font-semibold md:text-[40px]">
          Why Shop Owners Switch
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="flex flex-col gap-3 rounded-[10px] bg-[var(--color-bg-surface)] p-6"
            >
              <h4 className="font-heading text-xl font-semibold">
                {r.title}
              </h4>
              <p className="text-base text-[var(--color-text-secondary)]">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
