"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How does the free trial work?",
    a: "You get 14 days of full access, no card required. Subscribe anytime to keep going after the trial ends.",
  },
  {
    q: "Do i need any technical skills to use Reko?",
    a: "No. if you can use whatsapp, you can use Reko. setup takes minutes.",
  },
  {
    q: "What happens after my free trial ends?",
    a: "You'll be asked to subscribe to keep using Reko. Your data stays safe either way, nothing is deleted ",
  },
  {
    q: "Can my staff/workers use it too?",
    a: "Yes. Add as many staff accounts as you need. Every sale is logged under the person who made it.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-4 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-6 md:gap-5 md:px-6 md:py-7 lg:gap-6 lg:px-5 lg:py-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-6 text-left"
      >
        <span className="font-heading text-xl font-semibold md:text-2xl lg:text-[32px]">
          {q}
        </span>
        <span className="shrink-0 text-lg font-semibold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p className="text-base text-[var(--color-text-secondary)] md:text-xl md:font-heading md:font-semibold lg:text-2xl">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section className="mx-auto flex max-w-[1312px] flex-col gap-10 px-6 py-12 md:gap-12 md:py-16 lg:flex-row lg:gap-16 lg:py-20">
      <div className="flex flex-col gap-6 lg:w-[653px] lg:shrink-0">
        <span
          className="inline-flex h-12 w-fit items-center rounded-[10px] border px-6 font-heading text-sm font-semibold md:text-lg lg:text-2xl"
          style={{
            borderColor: "var(--color-primary-hover)",
            color: "var(--color-accent-light)",
          }}
        >
          FAQ
        </span>
        <h2 className="font-heading text-[32px] font-semibold leading-tight md:text-[48px] lg:text-[56px]">
          Frequently asked questions
        </h2>
      </div>

      <div className="flex flex-col gap-6 lg:flex-1 lg:gap-16">
        {FAQS.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  );
}
