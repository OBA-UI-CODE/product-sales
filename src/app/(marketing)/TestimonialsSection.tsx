function Stars() {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#e6a900">
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
  location,
}: {
  quote: string;
  name: string;
  role: string;
  location: string;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-[10px] bg-[var(--color-bg-surface)] p-6">
      <Stars />
      <p className="text-base text-white md:text-lg">{quote}</p>
      <div className="flex items-center gap-4 border-t border-[var(--color-border-strong)] pt-4">
        <div className="h-[58px] w-[58px] shrink-0 rounded-full bg-[var(--color-border-strong)]" />
        <div className="flex flex-col">
          <span className="font-heading text-lg font-semibold">{name}</span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {role}
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {location}
          </span>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  {
    quote:
      "\u201cI restock every week and i used to lose track of what's actually left on the shelf, Reko updates my stock the moment a sale happens. i always know what to reorder.\u201d",
    name: "Mrs Sarah. N",
    role: "Owner - Hairs and cosmetics",
    location: "Lagos State",
  },
  {
    quote:
      "\u201cBefore Reko, I was flipping through three notebooks just to find one sale from last two weeks. Now i search in ten seconds. My staff even prefers it to writing.\u201d",
    name: "Mrs Chiamaka. O",
    role: "Owner - Beauty & Hair Supplies.",
    location: "Lagos State",
  },
  {
    quote:
      "\u201cI used to close some evenings not knowing if the money on me still matched what i actually sold.\u201d",
    name: "Tunde. A",
    role: "Owner - Provision Store",
    location: "Ibadan City",
  },
  {
    quote:
      "\u201cMy two attendants used to argue about who sold what. Now every sale has a name on it. It solved a problem\u201d",
    name: "Ngozi. E",
    role: "Owner - Cosmetics Shop",
    location: "Enugu State",
  },
  {
    quote:
      "\u201cHonestly i was scared it would be complicated it took me five minutes to set up and my staff learnt\u201d",
    name: "Fatima. B",
    role: "Owner - Fashion Accessories.",
    location: "Ogun State",
  },
];

export default function TestimonialsSection() {
  const [featured, ...rest] = TESTIMONIALS;

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
          Testimonials
        </span>
        <h2 className="max-w-[653px] font-heading text-[32px] font-semibold leading-tight lg:text-[56px]">
          Read live reviews from business owners.
        </h2>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-4">
        {/* Featured card — photo background placeholder until asset export */}
        <div className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[10px] border border-dashed border-[var(--color-border)] p-6 lg:min-h-0 lg:w-[396px] lg:shrink-0">
          <span className="mb-4 text-xs text-[var(--color-text-muted)]">
            Customer photo — pending asset export
          </span>
          <p className="text-base text-white">{featured.quote}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-[58px] w-[58px] shrink-0 rounded-full bg-[var(--color-border-strong)]" />
            <div className="flex flex-col">
              <span className="font-heading text-lg font-semibold">
                {featured.name}
              </span>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {featured.role}
              </span>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {featured.location}
              </span>
            </div>
          </div>
        </div>

        {/* Remaining 4 as a 2x2 grid on desktop, stacked on mobile/tablet */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:flex-1">
          {rest.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
