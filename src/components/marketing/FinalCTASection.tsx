import Link from "next/link";

/*
  Final CTA — Figma nodes:
    web    87:2150 (1312x526) wordmark 250px · h2 72/87 · button 32/39
    tablet 96:2347 (738x410)  wordmark 128px · h2 48/58 · button 20/24
    mobile 99:2475 (345x304)  wordmark  64px · h2 24/29 · button 18/22

  Panel: bg primary/subtle (#062e24), r10, clipped.

  Background wordmarks: DM Sans Bold, transparent fill with an outline stroke,
  tracking -1.5, opacity 50, mix-blend-screen. The file stacks TWO copies at
  each of two x-positions, offset vertically by ~10 / 8 / 3px — that doubling is
  what gives the outline its echoed look, so both copies are kept.
  Positions are percentages of the panel (web x 0 / 54.8%, tablet 1.1% / 59.7%,
  mobile 0 / 59.3%; tops 71.7% / 80.5% / 86.8%) so they hold between the three
  fixed frames.

  The stroke colour is not exposed by the extractor (it reports the fill as
  transparent); #1d9e75 is the primary/border token and matches the rendered
  frame.

  Copy differences that are real, not transcription slips: the sub-line and the
  reassurance line change font family per breakpoint (DM Sans on web, Inter on
  tablet/mobile), and mobile splits "No card required. / Cancel anytime." over
  two lines and anchors the content 30px from the top rather than centring it.
*/

function Wordmarks() {
  const base =
    "absolute font-brand leading-none tracking-[-1.5px] text-transparent [-webkit-text-stroke:2px_#1d9e75] text-[64px] tab:text-[128px] web:text-[250px]";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-[86.8%] opacity-50 mix-blend-screen tab:top-[80.5%] web:top-[71.7%]"
    >
      {/* left pair */}
      <span className={`${base} left-0 top-0 tab:left-[1.08%] web:left-0`}>JOHTA</span>
      <span className={`${base} left-0 top-[3px] tab:left-[1.08%] tab:top-[8px] web:left-0 web:top-[10px]`}>
        JOHTA
      </span>
      {/* right pair */}
      <span className={`${base} left-[59.3%] top-0 tab:left-[59.72%] web:left-[54.8%]`}>
        JOHTA
      </span>
      <span
        className={`${base} left-[59.3%] top-[3px] tab:left-[59.72%] tab:top-[8px] web:left-[54.8%] web:top-[10px]`}
      >
        JOHTA
      </span>
    </div>
  );
}

export default function FinalCTASection() {
  return (
    // NOTE: the gap before the footer is NOT set here. It differs per page
    // (Landing 156/79/105, About 120/30/138, Pricing 42/49/75), and this
    // component is shared, so each page owns its own bottom spacing.
    <section className="mx-auto w-full max-w-[1440px] px-6 pt-6 tab:px-12 tab:pt-12 web:px-16 web:pt-16">
      <div className="relative h-[304px] w-full overflow-hidden rounded-md bg-primary-subtle tab:h-[410px] web:h-[526px]">
        <Wordmarks />

        {/*
          No horizontal padding above mobile: the file's text box is exactly
          836px and the 72px headline measures ~839px, so any inset forces the
          "Start with" onto a third line where the design has two.
        */}
        <div className="absolute left-1/2 top-[30px] flex w-full max-w-[345px] -translate-x-1/2 flex-col items-center gap-6 px-6 tab:top-1/2 tab:max-w-[836px] tab:-translate-y-1/2 tab:px-0">
          <div className="flex w-full flex-col items-center gap-4 text-center text-text-on-primary tab:gap-6">
            <h2 className="w-full font-heading text-[24px] font-semibold leading-[29px] tracking-[-1px] tab:text-[48px] tab:leading-[58px] web:text-[72px] web:leading-[87px]">
              Stop losing track. Start with
              <br />
              <span className="text-green-100">JOHTA</span>
            </h2>
            <p className="w-full font-body text-[14px] font-normal leading-[20px] tab:text-[20px] tab:leading-[24px] web:font-heading web:text-[24px] web:font-semibold web:leading-[29px] web:tracking-[-1px]">
              Set up your shop in five minutes. Free for one month.
            </p>
          </div>

          <div className="flex w-[174px] flex-col items-center gap-6 tab:w-auto">
            <Link
              href="/signup"
              className="flex h-[62px] min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-text-on-primary tab:text-[20px] tab:leading-[24px] web:text-[32px] web:leading-[39px]"
            >
              Start Free Trial
            </Link>
            <p className="w-full text-center font-body text-[14px] font-medium leading-[20px] text-text-secondary tab:text-[18px] tab:font-normal tab:leading-[28px] web:font-heading web:text-[24px] web:font-semibold web:leading-[29px] web:tracking-[-1px]">
              No card required.
              <br className="tab:hidden" /> Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
