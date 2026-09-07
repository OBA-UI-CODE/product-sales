import Link from "next/link";

/*
  Pricing plans — Figma nodes:
    web    130:4665 (1440x680) full-bleed info/subtle band, two 411x584 cards, gap 64
    tablet 130:4876 (h671, px48) two cards h604, gap 48
    mobile 130:5091 (h1326)     cards stacked full width, gap 24

  Card is identical in content at every breakpoint:
    name    DM Sans 600 18/22 -1   |  desc  Inter 400 16/24   (border-b primary/border, pb 24, gap 8)
    price   DM Sans 600 32/39 -1   |  period DM Sans 600 18/22 -1 (border-b, py 24, gap 4, baseline)
    feature Inter 400 16/24 with a 20px tick, row gap 16, list gap 24, py 24
    button  h48 primary r10, DM Sans 600 18/22 -1, full width
    note    Inter 400 16/24

  Card radius: the file emits `var(--radius-xl, 24px)`, which is NOT the
  published radius/xl token (that one is 20). The 24px fallback is what the
  frame renders, so 24 is used here — flagged as an unresolved variable rather
  than silently rounded to the token.

  PRICES — deliberate deviation from the file, see the note in the page:
  the file shows a yearly figure of 19,188, which is exactly 12x the monthly
  1,599 (i.e. no discount at all) while the same card is labelled "2 months
  free". 15,990 (= 1,599 x 10) is the value that matches the card's own claim
  and the figure previously confirmed for this project.

  Web card 2 is titled "JOHTA Starter/ Best Value"; tablet and mobile both title
  it "JOHTA Starter Plan", identical to card 1, which would leave two
  identically-named plans side by side. The web title is used throughout.
*/

const FEATURES = [
  "Unlimited sales logging",
  "Automatic stock tracking",
  "Unlimited staff accounts",
  "Sales history & search",
  "WhatsApp receipts",
];

type Plan = {
  name: string;
  desc: string;
  price: string;
  period: string;
};

const PLANS: Plan[] = [
  {
    name: "JOHTA Starter Plan",
    desc: "1 month free trial, no card required to start",
    price: "₦ 1,599",
    period: "/monthly",
  },
  {
    name: "JOHTA Starter/ Best Value",
    desc: "2 months free.",
    price: "₦ 15,990",
    period: "/yearly",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    // Card width: full on mobile, an equal share of the tablet band on tablet,
    // and the file's fixed 411 on web. It was previously 411 at BOTH tablet and
    // web — but the tablet band is only 738 wide inside its 48px padding, so
    // 411 + 48 + 411 = 870 overflowed by 132px and the cards bled off the frame.
    // The file's tablet cards are 339 and 351; an equal (738 - 48) / 2 = 345
    // split is used instead, since two side-by-side plan cards differing by
    // 12px reads as a slip rather than a decision.
    <div className="flex w-full min-w-0 items-center justify-center overflow-hidden rounded-[24px] bg-bg-canvas px-6 py-[15px] tab:flex-1 web:w-[411px] web:flex-none web:py-10">
      <div className="flex w-full max-w-[363px] flex-col items-center gap-6">
        <div className="flex w-full flex-col items-start">
          {/* Name + description */}
          <div className="flex w-full flex-col items-start gap-2 border-b border-primary-border pb-6">
            <p className="w-full font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-text-primary">
              {plan.name}
            </p>
            <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary">
              {plan.desc}
            </p>
          </div>

          {/* Price */}
          <div className="flex w-full items-baseline gap-1 whitespace-nowrap border-b border-primary-border py-6 font-heading font-semibold tracking-[-1px]">
            <p className="text-[32px] leading-[39px] text-text-primary">
              {plan.price}
            </p>
            <p className="text-[18px] leading-[22px] text-text-secondary">
              {plan.period}
            </p>
          </div>

          {/* Features */}
          <div className="flex w-full flex-col items-start gap-6 py-6">
            {FEATURES.map((f) => (
              <div key={f} className="flex w-full items-center gap-4">
                <img
                  src="/figma/icon-tick-circle.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 shrink-0"
                />
                <p className="min-w-px flex-1 font-body text-[16px] font-normal leading-[24px] text-text-secondary">
                  {f}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/signup"
          className="flex h-12 min-h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-text-on-primary"
        >
          Start free trial
        </Link>

        <p className="w-full text-center font-body text-[16px] font-normal leading-[24px] text-text-secondary">
          Cancel anytime, your data stays yours
        </p>
      </div>
    </div>
  );
}

export default function PricingPlans() {
  return (
    // Full-bleed info/subtle band, as in the file (1440 wide on web, edge to
    // edge on tablet and mobile).
    // Full-bleed info/subtle band, as in the file (1440 wide on web, edge to
    // edge on tablet and mobile). Band padding from the file: mobile
    // (1326 - 1285 stacked cards)/2 ≈ 20, tablet pt 30 / pb 37,
    // web (680 - 584)/2 = 48.
    <section className="mt-6 w-full bg-info-subtle px-6 py-5 tab:mt-12 tab:px-12 tab:pb-[37px] tab:pt-[30px] web:mt-16 web:py-12">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 tab:flex-row tab:items-stretch tab:justify-center tab:gap-12 web:gap-16">
        {PLANS.map((p) => (
          <PlanCard key={p.name} plan={p} />
        ))}
      </div>
    </section>
  );
}
