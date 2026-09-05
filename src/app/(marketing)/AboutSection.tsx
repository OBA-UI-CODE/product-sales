export default function AboutSection() {
  return (
    <section className="mx-auto flex max-w-[1312px] flex-col gap-8 px-6 py-12 md:gap-12 md:py-16 lg:gap-16 lg:py-20">
      <span
        className="inline-flex h-12 w-fit items-center rounded-[10px] border px-6 font-heading text-sm font-semibold md:text-lg lg:text-2xl"
        style={{
          borderColor: "var(--color-primary-hover)",
          color: "var(--color-accent-light)",
        }}
      >
        About Reko
      </span>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:gap-[58px]">
        <h2 className="font-heading text-[32px] font-semibold leading-tight md:text-[48px] lg:text-[56px]">
          Made for the shop, not the spreadsheet
        </h2>
        <p className="font-normal text-base text-[var(--color-text-secondary)] md:mt-[35px] md:font-heading md:text-2xl md:font-semibold lg:mt-10 lg:text-[32px]">
          We started with one real shop, real sales, and real mistakes a
          notebook or a shop owner makes and can&apos;t catch.
          <br />
          <br />
          Reko is what came out of it. simple enough to use or hand to any
          staff member.
        </p>
      </div>
    </section>
  );
}
