import Link from "next/link";
import { formatNaira } from "@/lib/format";

/*
  Column chart for Insights: one bar per day, week or month.

  Drawn with plain elements rather than a charting library. A library would
  add roughly 100KB of JavaScript to every visit for a handful of bars, on
  phones that are often cheap and on slow data. This renders on the server
  and costs nothing to run.

  Every bar is a link to that period in Sales History, so a tall bar can be
  opened to see what made it tall. The best bar is marked; periods still to
  come are drawn faint. Not in Figma; follows the app's existing cards.
*/

export interface TrendBar {
  key: string;
  label: string;
  /* Longer name for screen readers and the tooltip. */
  title: string;
  total: number;
  sales: number;
  href: string;
  future?: boolean;
}

export default function TrendChart({ bars }: { bars: TrendBar[] }) {
  const max = Math.max(1, ...bars.map((b) => b.total));
  const best = bars.reduce<TrendBar | null>((b, x) => (!x.future && (!b || x.total > b.total) ? x : b), null);
  const showValues = bars.length <= 8;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-[180px] items-end gap-1.5 tab:gap-3" role="list">
        {bars.map((b) => {
          const pct = b.future ? 0 : Math.max(b.total > 0 ? 3 : 0, (b.total / max) * 100);
          const isBest = best && b.key === best.key && b.total > 0;
          const column = (
            <div className="flex h-full flex-col items-center justify-end gap-1">
              {showValues && !b.future && b.total > 0 && (
                <span className="hidden whitespace-nowrap text-[11px] font-medium text-[var(--color-text-secondary)] tab:block">
                  {formatNaira(b.total)}
                </span>
              )}
              <span
                className={`w-full rounded-t-[4px] ${
                  isBest ? "bg-primary-default" : "bg-primary-default/45"
                }`}
                style={{ height: `${pct}%`, minHeight: b.total > 0 ? 4 : 0 }}
              />
            </div>
          );
          return (
            <div key={b.key} role="listitem" className="h-full min-w-0 flex-1">
              {b.future ? (
                <div className="h-full" aria-label={`${b.title}: still to come`}>{column}</div>
              ) : (
                <Link
                  href={b.href}
                  title={`${b.title}: ${formatNaira(b.total)}, ${b.sales} ${b.sales === 1 ? "sale" : "sales"}`}
                  aria-label={`${b.title}: ${formatNaira(b.total)}, ${b.sales} ${b.sales === 1 ? "sale" : "sales"}`}
                  className="block h-full rounded-t-[4px] transition hover:opacity-80"
                >
                  {column}
                </Link>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 border-t border-[var(--color-border)] pt-2 tab:gap-3">
        {bars.map((b) => (
          <span
            key={b.key}
            className={`min-w-0 flex-1 truncate text-center text-[11px] tab:text-xs ${
              b.future ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-secondary)]"
            }`}
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
