export default function MissionVision() {
  return (
    <section className="mx-auto flex max-w-[1312px] flex-col gap-10 px-6 py-12 md:py-16 lg:py-20">
      <h2 className="font-heading text-[32px] font-semibold leading-tight md:text-[56px]">
        For the future of small shops
      </h2>

      <div className="flex flex-col gap-10 md:flex-row md:gap-8">
        <div className="flex flex-1 flex-col gap-6">
          <img
            src="/images/about-mission.png"
            alt="Reko mission"
            className="h-[240px] w-full rounded-2xl border border-[var(--color-border)] object-cover"
          />
          <h3 className="font-heading text-2xl font-semibold md:text-[40px]">
            Our Mission
          </h3>
          <p className="text-base text-[var(--color-text-secondary)] md:text-lg">
            To give every small shop owner — regardless of size, location, or
            technical experience — a simple, honest system to run their
            sales on.
            <br />
            <br />
            We believe accountability shouldn&apos;t require an accountant,
            and that the shop owner counting stock by hand today deserves the
            same clarity as a business with a full finance team.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <img
            src="/images/about-vision.png"
            alt="Reko vision"
            className="h-[240px] w-full rounded-2xl border border-[var(--color-border)] object-cover"
          />
          <h3 className="font-heading text-2xl font-semibold md:text-[40px]">
            Our Vision
          </h3>
          <p className="text-base text-[var(--color-text-secondary)] md:text-lg">
            A future where every small business, starting in Nigeria and
            growing across Africa, runs on trusted, transparent sales records
            instead of guesswork.
            <br />
            <br />
            We want Reko to be the first tool a shop owner installs when they
            open their doors — and the one they never feel the need to
            replace as they grow.
          </p>
        </div>
      </div>
    </section>
  );
}
