import FinalCTASection from "../FinalCTASection";

const STEPS = [
  {
    title: "Set up your shop",
    body: "Tell us your shop name, what you sell and add your team. takes less than five minutes no tech skills needed.",
    image: "/images/howitworks-step1.png",
  },
  {
    title: "Log sales as they happen",
    body: "Tap in the item and price. Reko does the math, updates your stock, and keeps a running total for the day automatically.",
    image: "/images/howitworks-step2.png",
  },
  {
    title: "Know your numbers",
    body: "See today's total, search past sales, spot low stock before it runs out. no more flipping through pages to find one entry.",
    image: "/images/howitworks-step2.png",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="mx-auto flex max-w-[1312px] flex-col gap-16 px-6 pt-6 pb-16 lg:pt-11">
        <div className="flex flex-col gap-6">
          <span
            className="inline-flex h-12 w-fit items-center rounded-[10px] border px-6 font-heading text-sm font-semibold md:text-lg lg:text-2xl"
            style={{
              borderColor: "var(--color-primary-hover)",
              color: "var(--color-accent-light)",
            }}
          >
            Takes 5 minutes
          </span>
          <div className="flex flex-col gap-3">
            <h1 className="max-w-[900px] font-heading text-[56px] font-semibold leading-tight md:text-[64px] lg:text-[72px]">
              From notebooks to Reko in three steps
            </h1>
            <p className="text-base text-[var(--color-text-secondary)] md:text-xl md:font-heading md:font-semibold lg:text-2xl">
              Easy. Straightforward.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-16">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`flex flex-col gap-8 lg:items-center lg:gap-16 ${
                i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              <div className="flex flex-col gap-4 lg:w-[470px] lg:shrink-0">
                <span className="font-heading text-lg font-semibold text-[var(--color-text-secondary)]">
                  Step {i + 1}
                </span>
                <h2 className="font-heading text-2xl font-semibold md:text-[48px]">
                  {step.title}
                </h2>
                <p className="text-base text-[var(--color-text-secondary)] md:text-2xl md:font-heading md:font-semibold">
                  {step.body}
                </p>
              </div>
              <img
                src={step.image}
                alt={step.title}
                className="h-auto w-full flex-1 rounded-2xl border border-[var(--color-border)]"
              />
            </div>
          ))}
        </div>
      </section>

      <FinalCTASection />
    </>
  );
}
