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

/*
  FREE AND PAID (not in the Figma file, which shows the two paid cards only).
  The Free card is built from the same card component, so it inherits every
  measurement above; only its content differs. Monthly and yearly carry the
  same features: yearly is the same plan paid upfront. The lists mirror
  src/lib/plan.ts.
*/
const FREE_FEATURES = [
  "Unlimited sales logging",
  "Automatic stock tracking",
  "Sizes and packs",
  "Low-stock warnings",
  "Debts and part payments",
  "1 staff account",
  "Last 30 days of sales history",
];

const PAID_FEATURES = [
  "WhatsApp receipts",
  "Unlimited staff accounts",
  "Full sales history & search",
  "Download your records",
];

type Plan = {
  name: string;
  desc: string;
  price: string;
  period: string;
  lead?: string;
  features: string[];
  cta: string;
  note: string;
};

const PLANS: Plan[] = [
  {
    name: "JOHTA Free",
    desc: "For running your shop, free for as long as you like",
    price: "₦ 0",
    period: "/forever",
    features: FREE_FEATURES,
    cta: "Start for free",
    note: "No card needed, ever",
  },
  {
    name: "JOHTA Starter Plan",
    desc: "1 month free trial, no card required to start",
    price: "₦ 1,599",
    period: "/monthly",
    lead: "Everything in Free, plus:",
    features: PAID_FEATURES,
    cta: "Start free trial",
    note: "Cancel anytime, then carry on free",
  },
  {
    name: "JOHTA Starter/ Best Value",
    desc: "2 months free.",
    price: "₦ 15,990",
    period: "/yearly",
    lead: "Everything in Free, plus:",
    features: PAID_FEATURES,
    cta: "Start free trial",
    note: "Cancel anytime, then carry on free",
  },
];

function PlanCard({ plan, wide }: { plan: Plan; wide?: boolean }) {
  return (
    // Card width: full on mobile, an equal share of the band from tablet up,
    // capped at the file's 411 on web. With three cards the file's fixed 411
    // no longer fits the 1200 breakpoint, so web shares the row instead.
    // `wide`: on tablet the Free card takes the whole first row, and the two
    // paid cards share the second, rather than three cramped 214px columns.
    // Cards stretch to the tallest in the row and the button sits at the
    // bottom of each, so the three buttons line up.
    <div
      className={`flex w-full min-w-0 justify-center overflow-hidden rounded-md bg-bg-canvas px-6 py-[15px] web:flex-1 web:max-w-[411px] web:py-10 ${
        wide ? "tab:col-span-2" : ""
      }`}
    >
      <div className="flex h-full w-full max-w-[363px] flex-col items-center justify-between gap-6">
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
            {plan.lead && (
              <p className="w-full font-body text-[16px] font-semibold leading-[24px] text-text-primary">
                {plan.lead}
              </p>
            )}
            {plan.features.map((f) => (
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

        <div className="flex w-full flex-col items-center gap-6">
          <Link
            href="/signup"
            className="press flex h-12 min-h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-text-on-primary"
          >
            {plan.cta}
          </Link>

          <p className="w-full text-center font-body text-[16px] font-normal leading-[24px] text-text-secondary">
            {plan.note}
          </p>
        </div>
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
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 justify-items-center gap-6 tab:grid-cols-2 tab:gap-12 web:flex web:items-stretch web:justify-center web:gap-8">
        {PLANS.map((p, i) => (
          <PlanCard key={p.name} plan={p} wide={i === 0} />
        ))}
      </div>
    </section>
  );
}
