/*
  About — "For the future of small shops" — Figma nodes:
    web    123:1894 (1312x948) gap 64 · heading 56/68 · cards 376 tall
    tablet 127:2123 + 127:2102 gap 48 · heading 48/58 · cards 363 tall
    mobile 127:2239 + 127:2240 gap 24 · heading 24/29 · cards 630 / 604 tall

  Card layout flips: photo LEFT with left-rounded corners on tablet and web
  (363x363 and 674x376), photo ON TOP with top-rounded corners on mobile
  (345x251). Text block is 325 wide on mobile/tablet and 526 on web.

    title  32/39 (mobile & tablet) -> 56/68 (web)
    body   Inter 400 16/24         -> DM Sans 600 24/29 (web)

  Two decorative stars sit behind each card — 65x71 on mobile, 100x100 above —
  bleeding off the card edges. They are purely ornamental, so they are marked
  aria-hidden and clipped by the card.

  Both photographs are the same source files at every breakpoint (verified
  byte-identical), cropped differently by object-fit.
*/

type Card = {
  title: string;
  photo: string;
  alt: string;
  body: React.ReactNode;
};

const CARDS: Card[] = [
  {
    title: "Our Mission",
    photo: "/figma/about-mission.webp",
    alt: "A shop owner at her counter",
    body: (
      <>
        <p>
          To give every small shop owner regardless of size, location, or
          technical experience a simple, honest system to run their sales on.
        </p>
        <p>&#8203;</p>
        <p>
          We believe accountability shouldn’t require an accountant, and that the
          shop owner counting stock by hand today deserves the same clarity as a
          business with a full finance team.
        </p>
      </>
    ),
  },
  {
    title: "Our Vision",
    photo: "/figma/about-vision.webp",
    alt: "Shelves stocked in a small shop",
    body: (
      <>
        <p>
          A future where every small business, starting in Nigeria and growing
          across Africa, runs on trusted, transparent sales records instead of
          guesswork.
        </p>
        <p>&#8203;</p>
        <p>
          We want <span className="text-primary-text">JOHTA</span> to be the first
          tool a shop owner installs when they open their doors and the one they
          never feel the need to replace as they grow.
        </p>
      </>
    ),
  },
];

export default function MissionVision() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 pt-6 tab:gap-12 tab:px-12 tab:pt-12 web:gap-16 web:px-16 web:pt-16">
      <h2 className="w-full text-center font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] text-text-primary tab:text-[48px] tab:leading-[58px] web:text-[56px] web:leading-[68px]">
        For the future of small shops
      </h2>

      <div className="flex w-full flex-col items-start gap-6 tab:gap-12 web:gap-16">
        {CARDS.map((c) => (
          <div
            key={c.title}
            className="relative flex w-full flex-col overflow-hidden rounded-md bg-bg-surface tab:h-[363px] tab:flex-row tab:items-stretch web:h-[376px]"
          >
            {/* Decorative stars — bleed off the card, clipped by it */}
            <img
              src="/figma/about-star-2.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-[293px] top-[224px] h-[71px] w-[65px] tab:left-[327px] tab:top-[293px] tab:size-[100px] web:left-[656px] web:top-[315px]"
            />
            <img
              src="/figma/about-star-1.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -left-[18px] top-[557px] h-[71px] w-[65px] tab:left-[655px] tab:-top-[32px] tab:size-[100px] web:left-[1228px] web:-top-[21px]"
            />

            {/* Photo — on top at mobile, on the left above */}
            <div className="h-[251px] w-full shrink-0 overflow-hidden rounded-t-md tab:h-full tab:w-[363px] tab:rounded-none tab:rounded-l-md web:w-[674px]">
              <img
                src={c.photo}
                alt={c.alt}
                className="size-full max-w-none object-cover"
              />
            </div>

            {/* Text */}
            <div className="relative flex flex-1 items-center px-4 pb-6 pt-6 tab:px-6 web:px-16">
              <div className="flex w-full max-w-[325px] flex-col items-start gap-6 web:max-w-[526px]">
                <p className="w-full font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary web:text-[56px] web:leading-[68px]">
                  {c.title}
                </p>
                <div className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary web:font-heading web:text-[24px] web:font-semibold web:leading-[29px] web:tracking-[-1px]">
                  {c.body}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
