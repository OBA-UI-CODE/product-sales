/*
  Pricing hero — Figma nodes:
    web    130:4659 (627x299, centred) badge Inter Medium 18/28 · h1 72/87 · sub DM Sans 600 24/29
    tablet 130:4869 hero block         badge Inter Medium 18/28 · h1 64/77 · sub DM Sans 600 24/29
    mobile 130:5084 (345 wide)         badge Inter Regular 14/20 · h1 56/68 · sub Inter 400 16/24

  Heading is green/50 with "surprises" in primary/text. Tablet and mobile break
  after "Simple pricing," ; web sets it as one flowing line.
*/

export default function PricingHero() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-6 pt-6 tab:px-12 tab:pt-12 web:px-16 web:pt-16">
      <div className="flex w-full max-w-[345px] flex-col items-center gap-6 tab:max-w-none web:max-w-[627px]">
        <div className="flex h-12 min-h-12 items-center justify-center rounded-md bg-primary-subtle px-6">
          <p className="whitespace-nowrap font-body text-[14px] font-normal leading-[20px] text-text-primary tab:text-[18px] tab:font-medium tab:leading-[28px]">
            Simple &amp; Transparent
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-6 text-center">
          <h1 className="w-full font-heading text-[56px] font-semibold leading-[68px] tracking-[-1px] text-green-50 tab:text-[64px] tab:leading-[77px] web:text-[72px] web:leading-[87px]">
            Simple pricing,
            <br className="web:hidden" /> no{" "}
            <span className="text-primary-text">surprises</span>
          </h1>
          <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:font-heading tab:text-[24px] tab:font-semibold tab:leading-[29px] tab:tracking-[-1px]">
            Start free. Stay because it works.
          </p>
        </div>
      </div>
    </section>
  );
}
