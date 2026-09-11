/*
  Testimonials — Figma nodes:
    web    81:1059 (1312x928)  heading w944 · h2 56/68 · featured 396x724 + 2x2 grid (852)
    tablet 81:1467 (738x1345)  heading w556 · h2 48/58 · 2-col grid, 5th card full width
    mobile 81:1702 (345x1900)  heading w295 · h2 24/29 · single column, 5 cards of 330

  All three arrangements come from ONE grid with one DOM order
  (featured, Chiamaka, Tunde, Ngozi, Fatima):

    web   grid-cols 396 / 394 / 394, gap 64 — featured spans both rows, so the
          remaining four auto-place as the 2x2 block on the right
          (330 + 64 + 330 = 724 = the featured card's height in the file)
    tab   grid-cols 281 / 409, gap 48 — featured is a normal cell, Fatima spans
          both columns on row 3
    mob   single column, gap 24

  Card chrome: bg surface, 1px border/strong, r10, clipped. Content block is
  vertically centred with a 64px gap above the profile strip (h94, 1px top
  rule — reproduced with border-t rather than the exported 1px line SVG).

  Quotes carry hard line breaks in Figma at each breakpoint. They are left to
  wrap naturally here: the three sets of breaks disagree with each other (the
  web frame even splits "notebooks" mid-word, which the tablet frame renders as
  one word), and fixed breaks would misrender at every width between the three
  fixed frames.

  Copy and avatars updated from the file on 12 September 2026. The quotes
  follow the web frames (81:1059, 450:6744), the most polished of the three;
  the name is spelled Tolulope as on mobile (web has "Toulope", tablet
  "Toluope" and "Costmetics"). Avatars are the file's own renders of each
  Ellipse at 4x, so Fatima's crop is exactly as drawn, served at 174px (3x
  the 58px web size) and masked round here.
*/

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  location: string;
  avatar?: string;
};

const FEATURED: Testimonial = {
  quote:
    "“I restock every week and used to lose track of what was left on the shelf. JOHTA updates my stock the moment a sale happens, so I always know what to reorder.”",
  name: "Mrs. Sarah N.",
  role: "Owner - Hairs and Cosmetics",
  location: "Lagos State",
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "“Before JOHTA, I was flipping through three notebooks just to find one sale from two weeks ago. Now I can search in ten seconds. My staff even prefers it to writing.”",
    name: "Mrs. Tolulope O.",
    role: "Owner - Beauty & Cosmetics",
    location: "Lagos State",
    avatar: "/figma/avatar-tolulope.webp",
  },
  {
    quote:
      "“I used to close some evenings unsure if the money I had matched my actual sales. With JOHTA, the total sales are just there. No more guessing.”",
    name: "Tunde A.",
    role: "Owner - Provision Store",
    location: "Ibadan City",
    avatar: "/figma/avatar-tunde.webp",
  },
  {
    quote:
      "“My two attendants used to argue about who sold what. Now every sale has a name attached. It solved a problem I didn’t even know I could solve.”",
    name: "Blessing H.",
    role: "Owner - Cosmetics Shop",
    location: "Enugu State",
    avatar: "/figma/avatar-blessing.webp",
  },
  {
    quote:
      "“Honestly, I was scared it would be complicated. It took me five minutes to set up, and my staff learned it in one sitting. That’s rare for me.”",
    name: "Fatima B.",
    role: "Owner - Fashion Accessories.",
    location: "Ogun State",
    avatar: "/figma/avatar-fatima.webp",
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <img key={i} src="/figma/icon-star.svg" alt="" width={24} height={24} />
      ))}
    </div>
  );
}

/*
  Profile strip. The file uses genuinely different values per breakpoint — this
  is not one design scaled down:
                 mobile / tablet        web
    avatar       52px                   58px
    row gap      16                     8
    name         Inter Medium 16/24     Inter Medium 18/28
    role         Inter MEDIUM  14/20    Inter Regular 16/24
    location     Inter Regular 14/20    Inter Regular 16/24
*/
function Profile({ t }: { t: Testimonial }) {
  return (
    <div className="flex items-center gap-4 px-4 web:gap-2">
      <img
        src={t.avatar ?? "/figma/avatar-placeholder.svg"}
        alt=""
        width={58}
        height={58}
        loading="lazy"
        className="size-[52px] shrink-0 rounded-full object-cover web:size-[58px]"
      />
      <div className="flex w-[242px] flex-col items-start gap-1">
        <p className="w-full font-body text-[16px] font-medium leading-[24px] text-text-primary web:text-[18px] web:leading-[28px]">
          {t.name}
        </p>
        <p className="w-full font-body text-[14px] font-medium leading-[20px] text-text-secondary web:text-[16px] web:font-normal web:leading-[24px]">
          {t.role}
        </p>
        <p className="w-full font-body text-[14px] font-normal leading-[20px] text-text-secondary web:text-[16px] web:leading-[24px]">
          {t.location}
        </p>
      </div>
    </div>
  );
}

function Card({ t, className = "" }: { t: Testimonial; className?: string }) {
  return (
    /*
      Card rhythm differs by breakpoint (measured from 81:1526 mobile and
      81:1136 tablet, vs 72:744 web):

        mobile/tablet  24px top pad -> stars -> 24 -> quote -> 48 -> rule
                       -> 40 -> profile -> 24px bottom pad
        web            content vertically centred, 64 to the rule, then 10 to
                       the profile row (the file's 94px profile strip)

      Mobile/tablet were previously rendering with the web rhythm, which is why
      the stars sat hard against the top edge. Heights are minimums so a longer
      quote grows the card instead of clipping it (tablet row 2 is 359 tall in
      the file for exactly that reason).
    */
    <div
      className={`flex min-h-[330px] flex-col overflow-hidden rounded-md border border-border-strong bg-bg-surface py-6 web:justify-center web:py-0 ${className}`}
    >
      <div className="flex w-full flex-col items-start gap-6 px-4">
        <Stars />
        <p className="font-body text-[16px] font-normal leading-[24px] text-text-primary">
          {t.quote}
        </p>
      </div>
      <div className="mt-12 border-t border-border-strong web:mt-16" />
      <div className="mt-10 web:mt-[10px]">
        <Profile t={t} />
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 pt-6 tab:gap-12 tab:px-12 tab:pt-12 web:gap-16 web:px-16 web:pt-16">
      {/* Heading */}
      <div className="flex w-full max-w-[295px] flex-col items-center gap-6 tab:max-w-[556px] web:max-w-[944px]">
        <div className="flex min-h-12 items-center justify-center rounded-md border border-primary-border px-6">
          <p className="whitespace-nowrap font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-primary-text tab:text-[24px] tab:leading-[29px]">
            Testimonials
          </p>
        </div>
        <h2 className="w-full text-center font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] text-text-primary tab:text-[48px] tab:leading-[58px] web:text-[56px] web:leading-[68px]">
          Read live reviews from business owners.
        </h2>
      </div>

      {/* One grid, three arrangements */}
      <div className="grid w-full grid-cols-1 gap-6 tab:grid-cols-[281fr_409fr] tab:gap-12 web:grid-cols-[396fr_394fr_394fr] web:gap-16">
        {/* Featured — real photograph, spans both rows on web */}
        <div className="relative min-h-[330px] overflow-hidden rounded-md border border-border-strong web:row-span-2">
          <img
            src="/figma/testimonial-featured.webp"
            alt="Mrs Sarah N. in her hair and cosmetics shop"
            className="absolute inset-0 size-full max-w-none rounded-md object-cover"
          />
          {/* Soft dark-green scrim behind the caption */}
          <div
            aria-hidden
            className="absolute -bottom-px left-0 h-[290px] w-full bg-[rgba(6,46,36,0.4)] blur-[21.25px]"
          />
          <div className="absolute inset-x-[15px] bottom-[15px] flex flex-col gap-[19px] web:w-[342px]">
            <p className="font-body text-[16px] font-normal leading-[24px] text-text-primary">
              {FEATURED.quote}
            </p>
            <div className="flex w-[242px] flex-col items-start gap-1">
              <p className="w-full font-body text-[18px] font-medium leading-[28px] text-text-primary">
                {FEATURED.name}
              </p>
              <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary">
                {FEATURED.role}
              </p>
              <p className="w-full font-body text-[16px] font-normal leading-[24px] text-text-secondary">
                {FEATURED.location}
              </p>
            </div>
          </div>
        </div>

        {TESTIMONIALS.map((t, i) => (
          <Card
            key={t.name}
            t={t}
            /* Fatima (last) spans both columns on tablet only */
            className={i === TESTIMONIALS.length - 1 ? "tab:col-span-2 web:col-span-1" : ""}
          />
        ))}
      </div>
    </section>
  );
}
