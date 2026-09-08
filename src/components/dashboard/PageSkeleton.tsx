/*
  What a signed-in page shows while its data is on the way.

  Next renders this the instant a nav item is tapped, so the app responds to
  the touch immediately instead of sitting on the old screen for a second with
  nothing happening — which is what made navigation feel broken rather than
  merely slow. The sidebar and bottom bar live in the layout, so they stay put
  and only this column swaps.

  Deliberately shaped like the real content — a title, then cards, then rows —
  so the page does not visibly jump when the data lands.

  aria-hidden with a visually-hidden live region: a screen reader should hear
  "Loading" once, not read out a wall of meaningless empty boxes.
*/

function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[10px] bg-[var(--color-bg-surface)] ${className}`}
    />
  );
}

export default function PageSkeleton({
  cards = 4,
  rows = 4,
}: {
  cards?: number;
  rows?: number;
}) {
  return (
    <>
      <span className="sr-only" role="status">
        Loading
      </span>

      <div aria-hidden className="flex flex-col gap-8">
        <Block className="h-9 w-48" />

        {cards > 0 && (
          <div className="grid grid-cols-1 gap-4 tab:grid-cols-2 web:grid-cols-4">
            {Array.from({ length: cards }).map((_, i) => (
              <Block key={i} className="h-[132px] w-full" />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Block className="h-6 w-32" />
          {Array.from({ length: rows }).map((_, i) => (
            <Block key={i} className="h-[68px] w-full" />
          ))}
        </div>
      </div>
    </>
  );
}
