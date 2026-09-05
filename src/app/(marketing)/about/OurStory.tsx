import { Badge } from "./AboutHero";

export default function OurStory() {
  return (
    <section className="mx-auto flex max-w-[1312px] flex-col gap-10 px-6 py-12 md:py-16 lg:py-20">
      <div className="flex flex-col gap-6">
        <Badge>About Reko</Badge>
        <h2 className="max-w-[890px] font-heading text-[32px] font-semibold leading-tight md:text-[40px]">
          Reko exists so no shop owner has to wonder where the money went.
        </h2>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <img
          src="/images/about-story-side.png"
          alt="About Reko"
          className="h-[300px] w-full rounded-2xl border border-[var(--color-border)] object-cover lg:h-auto lg:w-[409px] lg:shrink-0"
        />

        <div className="flex flex-1 flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-2xl font-semibold">
              Our Story
            </h3>
            <p className="text-base text-[var(--color-text-secondary)] md:font-heading md:text-xl md:font-semibold">
              Reko didn&apos;t start as a product. It started as a notebook —
              the kind you&apos;ll find on almost every shop counter in
              Nigeria, full of dates, item names, and prices written in a
              hurry between customers. That notebook worked, until it
              didn&apos;t. Pages went missing. Totals didn&apos;t add up at
              the end of the day. Nobody could tell, at a glance, who sold
              what or how much stock was really left.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-2xl font-semibold">
              The Build
            </h3>
            <p className="text-base text-[var(--color-text-secondary)] md:font-heading md:text-xl md:font-semibold">
              We built Reko to fix that — not by replacing the shop
              owner&apos;s way of working, but by giving it structure. Every
              sale logged in seconds. Every unit of stock tracked without
              anyone having to count it by hand.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-2xl font-semibold">
              Personas
            </h3>
            <p className="text-base text-[var(--color-text-secondary)] md:font-heading md:text-xl md:font-semibold">
              We started with three real shops, real sales, real staff, real
              mistakes a notebook could never catch. Everything in Reko was
              shaped by what these shops actually needed, not by what a big
              business sales tool assumes you need.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
