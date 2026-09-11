import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { addDays, formatYmd } from "@/lib/lagos-date";

/*
  The Week and Month views of Sales History: the total for the period, a
  bar for each day (week) or each week (month), the best day, and the items
  that brought in the most. Built from sales_summary(), which adds up in the
  database. Not in Figma; uses the Sales History cards' existing styling.

  Each bar is a link: a day opens that day's sales, a week opens that week.
*/

export interface SummaryDay {
  day: string; // YYYY-MM-DD, Lagos
  total: number;
  sales: number;
  collected: number;
}

export interface SummaryItem {
  item: string;
  total: number;
  quantity: number;
}

interface Bar {
  key: string;
  label: string;
  total: number;
  sales: number;
  href: string;
  future: boolean;
}

export default function PeriodSummary({
  view,
  label,
  days,
  topItems,
  bars,
}: {
  view: "week" | "month";
  label: string;
  days: SummaryDay[];
  topItems: SummaryItem[];
  bars: Bar[];
}) {
  const total = days.reduce((s, d) => s + d.total, 0);
  const sales = days.reduce((s, d) => s + d.sales, 0);
  const collected = days.reduce((s, d) => s + d.collected, 0);
  const owed = Math.max(0, total - collected);
  const best = days.reduce<SummaryDay | null>((b, d) => (!b || d.total > b.total ? d : b), null);
  const max = Math.max(1, ...bars.map((b) => b.total));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 rounded-md bg-[var(--color-bg-surface)] p-6">
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
        <span className="font-heading text-[32px] font-semibold">{formatNaira(total)}</span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {sales} {sales === 1 ? "sale" : "sales"} · {formatNaira(collected)} collected
          {owed > 0 && (
            <>
              {" · "}
              <span className="text-[var(--color-danger)]">{formatNaira(owed)} still owed</span>
            </>
          )}
        </span>
      </div>

      {sales === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
          No sales logged {view === "week" ? "this week" : "this month"}.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1 rounded-md bg-[var(--color-bg-surface)] p-4 tab:p-6">
            <h2 className="mb-2 font-semibold">
              {view === "week" ? "Day by day" : "Week by week"}
            </h2>
            {bars.map((b) => {
              const isBest = view === "week" && best && b.key === best.day && best.total > 0;
              const row = (
                <div className="flex items-center gap-3 py-1.5">
                  <span className="w-[92px] shrink-0 text-sm text-[var(--color-text-secondary)] tab:w-[120px]">
                    {b.label}
                  </span>
                  <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-canvas)]">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-primary-default"
                      style={{ width: `${(b.total / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-[104px] shrink-0 text-right text-sm font-medium tab:w-[130px]">
                    {b.future ? "" : formatNaira(b.total)}
                    {isBest && (
                      <span className="ml-1 hidden rounded-full bg-primary-subtle px-2 py-0.5 text-xs text-primary-text tab:inline">
                        best
                      </span>
                    )}
                  </span>
                </div>
              );
              return b.future ? (
                <div key={b.key} className="opacity-40">
                  {row}
                </div>
              ) : (
                <Link
                  key={b.key}
                  href={b.href}
                  className="-mx-2 rounded-md px-2 transition hover:bg-[var(--color-bg-canvas)]"
                  aria-label={`${b.label}: ${formatNaira(b.total)}, ${b.sales} sales`}
                >
                  {row}
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 tab:grid-cols-2">
            {best && best.total > 0 && (
              <div className="flex flex-col gap-1 rounded-md bg-[var(--color-bg-surface)] p-6">
                <span className="text-sm text-[var(--color-text-secondary)]">Best day</span>
                <span className="font-heading text-xl font-semibold">
                  {formatYmd(best.day, { weekday: "long", day: "numeric", month: "short" })}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {formatNaira(best.total)} from {best.sales} {best.sales === 1 ? "sale" : "sales"}
                </span>
              </div>
            )}
            {topItems.length > 0 && (
              <div className="flex flex-col gap-2 rounded-md bg-[var(--color-bg-surface)] p-6">
                <span className="text-sm text-[var(--color-text-secondary)]">Top items</span>
                {topItems.map((t, i) => (
                  <div key={t.item} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {i + 1}. {t.item}
                      <span className="text-sm text-[var(--color-text-secondary)]"> × {t.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium">{formatNaira(t.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* The seven days of a week, Monday first, as bars. */
export function weekBars(start: string, days: SummaryDay[], today: string): Bar[] {
  const byDay = new Map(days.map((d) => [d.day, d]));
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(start, i);
    const d = byDay.get(day);
    return {
      key: day,
      label: formatYmd(day, { weekday: "short", day: "numeric", month: "short" }),
      total: d?.total ?? 0,
      sales: d?.sales ?? 0,
      href: `/sales-history?view=day&date=${day}`,
      future: day > today,
    };
  });
}

/* The weeks of a month, each cut to the month's own days, as bars. */
export function monthBars(
  start: string,
  end: string, // first day of the next month
  days: SummaryDay[],
  today: string,
  weekStartOf: (ymd: string) => string
): Bar[] {
  const bars: Bar[] = [];
  let cursor = start;
  while (cursor < end) {
    const wkEnd = addDays(weekStartOf(cursor), 7);
    const last = wkEnd < end ? addDays(wkEnd, -1) : addDays(end, -1);
    const inRange = days.filter((d) => d.day >= cursor && d.day <= last);
    bars.push({
      key: cursor,
      label:
        cursor === last
          ? formatYmd(cursor, { day: "numeric", month: "short" })
          : `${formatYmd(cursor, { day: "numeric" })} to ${formatYmd(last, { day: "numeric", month: "short" })}`,
      total: inRange.reduce((s, d) => s + d.total, 0),
      sales: inRange.reduce((s, d) => s + d.sales, 0),
      href: `/sales-history?view=week&date=${cursor}`,
      future: cursor > today,
    });
    cursor = addDays(last, 1);
  }
  return bars;
}
