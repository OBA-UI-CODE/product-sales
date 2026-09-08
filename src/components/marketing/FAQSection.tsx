"use client";

import { useState } from "react";

/*
  FAQ — Figma nodes:
    web    66:687 (1087x1020) gap 64 · heading block w653 · h2 56/68
    tablet 71:714 (738x946)   gap 48 · heading block w556 · h2 48/58
    mobile 72:741 (345x981)   gap 24 · heading block w295 · h2 24/29

  The FAQ column is 1087 wide inside the 1312 content column on web (centred,
  x=112.5), and full width on tablet/mobile.

  FAQItem per breakpoint:
    row gap      64 / 48 / 24
    question     DM Sans 600  32/39 · 24/29 · 20/24   (-1px)
    answer       DM Sans 600  24/29 · 20/24 · Inter 400 16/24
    toggle glyph Inter 600 18, colour text/secondary
    box          bg surface, 1px border/default, r10, px20 py32, gap 24
    height       fixed 156 on web/tablet, auto on mobile — used as a
                 min-height here so nothing clips if text wraps differently.

  Figma shows all four rows expanded with "−". The component (11:51) does
  declare a collapsed variant, but that state is not laid out in this frame, so
  the collapsed rendering (answer hidden, glyph "+") is the natural complement
  rather than an extracted design. Flagged, not silently invented.
*/

type Faq = {
  q: React.ReactNode;
  a: string;
};

const FAQS: Faq[] = [
  {
    q: "How does the free trial work?",
    a: "You get one month of full access, no card required. Subscribe anytime to keep going after the trial ends.",
  },
  {
    q: (
      <>
        Do i need any technical skills to use{" "}
        <span className="text-primary-text">JOHTA</span>?
      </>
    ),
    a: "No. if you can use whatsapp, you can use JOHTA. setup takes minutes.",
  },
  {
    q: "What happens after my free trial ends?",
    a: "You’ll be asked to subscribe to keep using JOHTA. Your data stays safe either way, nothing is deleted ",
  },
  {
    q: "Can my staff/workers use it too?",
    a: "Yes. Add as many staff accounts as you need. Every sale is logged under the person who made it.",
  },
];

export default function FAQSection() {
  // All rows start expanded, matching the design.
  const [open, setOpen] = useState<boolean[]>(() => FAQS.map(() => true));

  const toggle = (i: number) =>
    setOpen((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <section data-reveal className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-6 pt-6 tab:px-12 tab:pt-12 web:px-16 web:pt-16">
      <div className="flex w-full max-w-[1087px] flex-col items-center gap-6 tab:gap-12 web:gap-16">
        {/* Heading */}
        <div className="flex w-full max-w-[295px] flex-col items-center gap-6 tab:max-w-[556px] web:max-w-[653px]">
          <div className="flex min-h-12 items-center justify-center rounded-md border border-primary-border px-6">
            <p className="whitespace-nowrap font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-primary-text tab:text-[24px] tab:leading-[29px]">
              FAQ
            </p>
          </div>
          <h2 className="w-full font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] text-text-primary tab:text-[48px] tab:leading-[58px] web:text-[56px] web:leading-[68px]">
            Frequently asked questions
          </h2>
        </div>

        {/* Rows */}
        <div className="flex w-full flex-col items-start gap-6 tab:gap-12 web:gap-16">
          {FAQS.map((faq, i) => {
            const isOpen = open[i];
            return (
              <div
                key={i}
                className="card-hover flex w-full flex-col items-start gap-6 rounded-md border border-border-default bg-bg-surface px-5 py-8 tab:min-h-[156px]"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-6 text-left"
                >
                  <span className="min-w-px flex-1 font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-primary tab:text-[24px] tab:leading-[29px] web:text-[32px] web:leading-[39px]">
                    {faq.q}
                  </span>
                  {/*
                    One glyph that turns, rather than swapping + for −. A swap
                    is instant and easy to miss; a 90 degree turn shows the
                    row responded to the tap. Always a "+" in the markup, so
                    the rotation has something continuous to animate.
                  */}
                  <span
                    aria-hidden
                    className={`shrink-0 whitespace-nowrap font-body text-[18px] font-semibold text-text-secondary transition-transform duration-200 motion-reduce:transition-none ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:font-heading tab:text-[20px] tab:font-semibold tab:leading-[24px] tab:tracking-[-1px] web:text-[24px] web:leading-[29px]">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
