import Link from "next/link";
import { BRAND, LogoMark } from "@/components/Brand";

/*
  Footer — Figma nodes:
    web    89:2251 (1440x1052) content 1312 @ 64,62 · brand mark 86 · col heads 48/58 · links 24/29
    tablet 96:2377 (834x910)   brand mark 60 · col heads 32/39 · links 18/22
    mobile 99:2493 (393x934)   brand mark 60 · col heads 24/29 · links 18/22

  Link area is one grid in one DOM order (Product, Company, Get Started, Social):
    mobile  2 columns -> Product/Company on row 1, Get Started/Social on row 2
    tab/web 3 columns -> the three link columns on row 1, Social alone on row 2
                         (matching the file, where Social sits under Product)

  Social links are inline with vertical rules on web/tablet and stacked with
  horizontal rules on mobile — both arrangements are in the file.

  Rules and the 1px separators are drawn with borders rather than the exported
  1px line SVGs; identical result, far less markup.

  The social entries are NOT links: no real accounts exist yet, and the file has
  no URLs. Rendered as plain text so there are no dead href="#" links that jump
  the page. Needs real URLs before launch.
*/

const PRODUCT = [
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/how-it-works" },
];
const COMPANY = [
  { label: "About", href: "/about" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
];
const GET_STARTED = [
  { label: "Start free trial", href: "/signup" },
  { label: "Sign In", href: "/login" },
  { label: "Contact Us", href: "/contact" },
];
const SOCIAL = ["LinkedIn", "Facebook", "X", "Instagram"];

const HEAD =
  "font-heading font-semibold tracking-[-1px] text-text-secondary text-[24px] leading-[29px] tab:text-[32px] tab:leading-[39px] web:text-[48px] web:leading-[58px]";
/*
  Link size steps 18/22 -> 20/24 -> 24/29 (mobile 99:2507, tablet 96:2386,
  web 96:2279). Tablet was previously inheriting mobile's 18/22.
*/
const LINK =
  "font-heading font-semibold tracking-[-1px] text-text-secondary text-[18px] leading-[22px] tab:text-[20px] tab:leading-[24px] web:text-[24px] web:leading-[29px]";

function Column({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col items-start gap-6">
      <p className={`${HEAD} whitespace-nowrap`}>{title}</p>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={`${LINK} whitespace-nowrap`}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-info-subtle">
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-10 pb-10 tab:px-12 tab:pt-14 web:px-16 web:pt-[62px]">
        {/* Brand + link columns */}
        {/*
          Brand -> columns gap is 48 on tablet (96:2398) and 80 on web
          (96:2293). Using 80 at tablet pushed the three columns past the
          738px content width, which is what made them jam and spill.
        */}
        <div className="flex flex-col gap-10 tab:flex-row tab:gap-12 web:gap-20">
          {/* Brand */}
          <div className="flex shrink-0 flex-col items-start gap-6 web:w-[327px]">
            <div className="flex items-start gap-3 tab:items-center web:gap-9">
              <LogoMark
                className="size-[60px] rounded-xl web:size-[86px]"
                letterClassName="text-[44px] web:text-[64px]"
              />
              <span className="whitespace-nowrap font-brand text-[40px] leading-[48px] tracking-[-1px] text-primary-text web:text-[48px] web:leading-[58px]">
                {BRAND}
              </span>
            </div>
            {/*
              Tagline line count differs by breakpoint: mobile keeps it on ONE
              line (99:2499 is whitespace-nowrap), tablet breaks it into two
              hard lines (96:2383 is two separate paragraphs), and web wraps
              naturally inside the 327px brand column. Letting tablet run on one
              line made the brand block ~360px wide instead of ~178, which is
              what squeezed the three link columns off the right edge.
            */}
            <p className="whitespace-nowrap font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] text-text-secondary tab:whitespace-normal">
              JOHTA. Every sale,{" "}
              <br className="hidden tab:inline web:hidden" />
              <span className="text-primary-text">accounted for.</span>
            </p>
          </div>

          {/* Links: 2 cols on mobile, 3 cols with Social on its own row above tablet */}
          {/*
            Column gap: 48 on tablet (96:2397), 80 on web (96:2292).
            Columns size to their content (auto), not equal thirds — the file
            has them at 112 / 143 / 162 on tablet. grid-cols-3 split the space
            evenly, starving "Get Started" and jamming it into "Company".
          */}
          <div className="grid grid-cols-2 gap-x-[59px] gap-y-6 tab:grid-cols-[max-content_max-content_max-content] tab:justify-start tab:gap-x-12 tab:gap-y-14 web:gap-x-20 web:gap-y-[133px]">
            <Column title="Product" links={PRODUCT} />
            <Column title="Company" links={COMPANY} />
            <Column title="Get Started" links={GET_STARTED} />

            {/*
              Social spans the full row above mobile. In the file it is a
              separate block below the columns (tablet 99:2399, 464 wide), not a
              fourth column — and it is wider than the Product column. Left as a
              normal grid cell it set column 1's max-content to its own ~389px
              width, which pushed Company and Get Started off the right edge.
              On mobile it genuinely is the fourth cell, beside Get Started.
            */}
            <div className="flex flex-col items-start gap-6 tab:col-span-3">
              <p className={`${HEAD} whitespace-nowrap`}>Social Media</p>
              <div className="flex w-full flex-col items-start gap-4 tab:w-auto tab:flex-row tab:items-center tab:gap-0">
                {SOCIAL.map((name, i) => (
                  <div
                    key={name}
                    className="flex w-full flex-col items-start gap-4 tab:w-auto tab:flex-row tab:items-center tab:gap-0"
                  >
                    <span className={`${LINK} whitespace-nowrap tab:px-4`}>
                      {name}
                    </span>
                    {i < SOCIAL.length - 1 && (
                      <span
                        aria-hidden
                        className="h-px w-full bg-border-strong tab:h-[23px] tab:w-px"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rule → JOHTA watermark → rule */}
        <div className="mt-14 border-t border-border-strong web:mt-14" />

        <div className="flex justify-center py-10">
          <img
            src="/figma/johta-watermark.svg"
            alt=""
            aria-hidden
            className="h-auto w-[335px] max-w-full tab:w-[629px] web:w-[973px]"
          />
        </div>

        <div className="border-t border-border-strong" />

        {/* Bottom row */}
        <div className="mt-10 flex flex-col items-center gap-2 tab:flex-row tab:items-center tab:justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/figma/icon-copyright.svg"
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0"
            />
            <p className="whitespace-nowrap font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:font-heading tab:text-[18px] tab:font-semibold tab:leading-[22px] tab:tracking-[-1px] web:text-[24px] web:leading-[29px]">
              2026 JOHTA. All rights reserved
            </p>
          </div>
          <p className="text-center font-body text-[14px] font-normal leading-[20px] text-text-secondary tab:font-heading tab:text-[18px] tab:font-semibold tab:leading-[22px] tab:tracking-[-1px] web:text-[24px] web:leading-[29px]">
            Made for the shops that keep the world moving
          </p>
        </div>
      </div>
    </footer>
  );
}
