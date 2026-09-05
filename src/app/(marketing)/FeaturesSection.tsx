function ImagePlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)] ${className ?? ""}`}
    >
      {label}
    </div>
  );
}

function FeatureBlock({
  title,
  body,
  image,
  imageFirst,
}: {
  title: string;
  body: string;
  image: string;
  imageFirst: boolean;
}) {
  const text = (
    <div className="flex flex-col gap-3 md:gap-4">
      <h3 className="font-heading text-2xl font-semibold md:text-[48px]">
        {title}
      </h3>
      <p className="text-base text-[var(--color-text-secondary)] md:font-heading md:text-2xl md:font-semibold">
        {body}
      </p>
    </div>
  );
  const img = <ImagePlaceholder label={image} className="h-[220px] w-full md:h-[344px]" />;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {imageFirst ? (
        <>
          {img}
          {text}
        </>
      ) : (
        <>
          {text}
          {img}
        </>
      )}
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section className="mx-auto flex max-w-[1312px] flex-col gap-10 px-6 py-12 md:gap-12 md:py-16 lg:gap-16 lg:py-20">
      <div className="flex flex-col gap-6">
        <span
          className="inline-flex h-12 w-fit items-center rounded-[10px] border px-6 font-heading text-sm font-semibold md:text-lg lg:text-2xl"
          style={{
            borderColor: "var(--color-primary-hover)",
            color: "var(--color-accent-light)",
          }}
        >
          Features
        </span>
        <div className="flex flex-col gap-3 md:gap-4">
          <h2 className="max-w-[889px] font-heading text-[32px] font-semibold leading-tight md:text-[48px] lg:text-[56px]">
            Everything your notebook couldn&apos;t do
          </h2>
          <p className="max-w-[889px] text-base text-[var(--color-text-secondary)] md:font-heading md:text-2xl md:font-semibold">
            Six reasons shop owners stop carrying the black book everywhere.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12 lg:gap-16">
        {/* Row 1: two stacked text blocks + one big image (desktop/tablet); simple stack on mobile */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex flex-col gap-10 lg:w-[470px] lg:shrink-0 lg:gap-[110px]">
            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="font-heading text-2xl font-semibold md:text-[48px]">
                Fast sale entry
              </h3>
              <p className="text-base text-[var(--color-text-secondary)] md:font-heading md:text-2xl md:font-semibold">
                Log a sale in under ten seconds. Built for busy counters, not
                spreadsheets
              </p>
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="font-heading text-2xl font-semibold md:text-[48px]">
                Automatic stock tracking
              </h3>
              <p className="text-base text-[var(--color-text-secondary)] md:font-heading md:text-2xl md:font-semibold">
                Every sale updates your stock in real time. Every restock
                does too. No manual counting.
              </p>
            </div>
          </div>
          <ImagePlaceholder
            label="Dashboard preview — pending asset export"
            className="h-[260px] w-full lg:h-[546px]"
          />
        </div>

        {/* Row 2: two cards side by side on desktop/tablet, stacked on mobile */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-8 lg:gap-16">
          <FeatureBlock
            title="Multiple staff, one record"
            body="Everyone on your team logs sales under their own name, so you know who sold what."
            image="Team illustration — pending asset export"
            imageFirst={true}
          />
          <FeatureBlock
            title="Fix mistakes easily"
            body="Entered the wrong price? Edit or delete a sale after the fact, your stock and totals adjust automatically."
            image="Edit icon render — pending asset export"
            imageFirst={false}
          />
        </div>

        {/* Row 3: two cards side by side on desktop/tablet, stacked on mobile */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-8 lg:gap-16">
          <FeatureBlock
            title="Works on any phone"
            body="Everyone on your team logs sales under their own name, so you know who sold what."
            image="Phone mockup — pending asset export"
            imageFirst={false}
          />
          <FeatureBlock
            title="Search your history"
            body="Find any sale by date in seconds. Your whole sales history, always at your finger tips."
            image="Search icon render — pending asset export"
            imageFirst={true}
          />
        </div>
      </div>
    </section>
  );
}
