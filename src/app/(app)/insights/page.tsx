import Link from "next/link";
import { getCurrentShopContext, shopOf } from "@/lib/shop-context";
import { isPaidShop } from "@/lib/plan";
import { formatNaira } from "@/lib/format";
import {
  addDays,
  addMonths,
  formatYmd,
  lagosMidnight,
  lagosToday,
  monthStart,
  weekStart,
} from "@/lib/lagos-date";
import TrendChart, { type TrendBar } from "./TrendChart";

/*
  Insights: what is selling, what is about to run out, what is not moving,
  and how sales are trending. For owners and staff alike, as the dashboard
  is. Built 12 September 2026 in the app's existing style; the owner will
  redesign it in Figma later.

    Trend         7 days (vs the 7 before), weeks, months
                  Free: 7 days and 4 weeks, inside its 30-day window
                  Paid: 8 weeks and 12 months too
    Top sellers   last 30 days, by money; free for everyone
    Running out   how fast each item sells against its stock; Paid
    Not selling   stock that has not sold in 30 days; Paid

  All numbers come from database functions that run as the signed-in user
  (sales_summary and insights_*), so row-level security decides what they
  can see and a busy shop is never cut short by the API's 1000-row limit.
*/

type Range = "7d" | "weeks" | "months";

interface Day {
  day: string;
  total: number;
  sales: number;
}

async function summary(
  supabase: Awaited<ReturnType<typeof getCurrentShopContext>>["supabase"],
  fromYmd: string,
  toYmd: string
): Promise<Day[]> {
  const { data } = await supabase.rpc("sales_summary", {
    p_from: lagosMidnight(fromYmd).toISOString(),
    p_to: lagosMidnight(toYmd).toISOString(),
  });
  return ((data?.days ?? []) as Day[]).map((d) => ({
    day: d.day,
    total: Number(d.total),
    sales: Number(d.sales),
  }));
}

const sumIn = (days: Day[], from: string, to: string) =>
  days.filter((d) => d.day >= from && d.day < to).reduce(
    (a, d) => ({ total: a.total + d.total, sales: a.sales + d.sales }),
    { total: 0, sales: 0 }
  );

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-md bg-[var(--color-bg-surface)] p-5 tab:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        {note && <p className="text-sm text-[var(--color-text-secondary)]">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function PaidOnly({ what, isOwner }: { what: string; isOwner: boolean }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-[var(--color-border)] p-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        {what} is on the paid plan.
      </p>
      {isOwner ? (
        <Link
          href="/settings#billing"
          className="press flex h-10 items-center justify-center rounded-md bg-[var(--color-primary)] px-5 text-sm font-semibold text-white"
        >
          See plans
        </Link>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">Ask the shop owner about the paid plan.</p>
      )}
    </div>
  );
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { supabase, profile } = await getCurrentShopContext();
  const params = await searchParams;
  const shop = shopOf(profile);
  const paid = isPaidShop(shop);
  const isOwner = profile.role === "owner";
  const today = lagosToday();
  const tomorrow = addDays(today, 1);

  const range: Range =
    params.range === "weeks" || params.range === "months" ? params.range : "7d";
  const weeksShown = paid ? 8 : 4;
  const rangeLocked = range === "months" && !paid;

  /* ---------------- trend ---------------- */
  let bars: TrendBar[] = [];
  let headline = { total: 0, sales: 0 };
  let compare: { pct: number | null; prevTotal: number } | null = null;
  let rangeLabel = "";

  if (!rangeLocked) {
    if (range === "7d") {
      const days = await summary(supabase, addDays(today, -13), tomorrow);
      const from = addDays(today, -6);
      headline = sumIn(days, from, tomorrow);
      const prev = sumIn(days, addDays(today, -13), from);
      compare = {
        prevTotal: prev.total,
        pct: prev.total > 0 ? Math.round(((headline.total - prev.total) / prev.total) * 100) : null,
      };
      rangeLabel = "Last 7 days";
      bars = Array.from({ length: 7 }, (_, i) => {
        const day = addDays(from, i);
        const t = sumIn(days, day, addDays(day, 1));
        return {
          key: day,
          label: i === 6 ? "Today" : formatYmd(day, { weekday: "short" }),
          title: formatYmd(day, { weekday: "long", day: "numeric", month: "short" }),
          total: t.total,
          sales: t.sales,
          href: `/sales-history?view=day&date=${day}`,
        };
      });
    } else if (range === "weeks") {
      const first = addDays(weekStart(today), -7 * (weeksShown - 1));
      const end = addDays(weekStart(today), 7);
      const days = await summary(supabase, first, end);
      headline = sumIn(days, first, end);
      rangeLabel = `Last ${weeksShown} weeks`;
      bars = Array.from({ length: weeksShown }, (_, i) => {
        const wk = addDays(first, 7 * i);
        const t = sumIn(days, wk, addDays(wk, 7));
        return {
          key: wk,
          label: i === weeksShown - 1 ? "This wk" : formatYmd(wk, { day: "numeric", month: "short" }),
          title: `Week of ${formatYmd(wk, { day: "numeric", month: "short" })}`,
          total: t.total,
          sales: t.sales,
          href: `/sales-history?view=week&date=${wk}`,
        };
      });
    } else {
      const first = addMonths(monthStart(today), -11);
      const end = addMonths(monthStart(today), 1);
      const days = await summary(supabase, first, end);
      headline = sumIn(days, first, end);
      rangeLabel = "Last 12 months";
      bars = Array.from({ length: 12 }, (_, i) => {
        const m = addMonths(first, i);
        const t = sumIn(days, m, addMonths(m, 1));
        return {
          key: m,
          label: formatYmd(m, { month: "short" }),
          title: formatYmd(m, { month: "long", year: "numeric" }),
          total: t.total,
          sales: t.sales,
          href: `/sales-history?view=month&date=${m}`,
        };
      });
    }
  }

  /* ---------------- the lists ---------------- */
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [top, runningOut, notSelling, typed, logged, oldestProduct] = await Promise.all([
    supabase.rpc("insights_top_items", { p_from: since30, p_to: new Date().toISOString(), p_limit: 5 }),
    paid ? supabase.rpc("insights_running_out", { p_days: 14 }) : Promise.resolve({ data: null }),
    paid ? supabase.rpc("insights_not_selling", { p_days: 30 }) : Promise.resolve({ data: null }),
    supabase.from("sales").select("id", { count: "exact", head: true }).eq("shop_id", profile.shop_id).is("product_id", null).gte("sold_at", since30),
    supabase.from("sales").select("id", { count: "exact", head: true }).eq("shop_id", profile.shop_id).gte("sold_at", since30),
    supabase.from("products").select("created_at").eq("shop_id", profile.shop_id).is("archived_at", null).order("created_at").limit(1).maybeSingle(),
  ]);

  const topItems = ((top.data ?? []) as { item: string; quantity: number; revenue: number; sales: number }[]).map((t) => ({
    item: t.item,
    quantity: Number(t.quantity),
    revenue: Number(t.revenue),
  }));
  const topMax = Math.max(1, ...topItems.map((t) => t.revenue));

  const soon = ((runningOut.data ?? []) as { item: string; stock: number; per_day: number; days_left: number }[])
    .map((r) => ({ item: r.item, stock: Number(r.stock), perDay: Number(r.per_day), daysLeft: Number(r.days_left) }))
    .filter((r) => r.daysLeft <= 7);

  const stale = ((notSelling.data ?? []) as { item: string; stock: number; stock_value: number; last_sold: string | null }[]).map((r) => ({
    item: r.item,
    stock: Number(r.stock),
    value: Number(r.stock_value),
    lastSold: r.last_sold,
  }));
  const catalogueAgeDays = oldestProduct.data?.created_at
    ? Math.floor((Date.now() - new Date(oldestProduct.data.created_at).getTime()) / 86_400_000)
    : 0;

  const typedCount = typed.count ?? 0;
  const loggedCount = logged.count ?? 0;
  const mostlyTyped = typedCount >= 3 && typedCount / Math.max(1, loggedCount) >= 0.3;

  const tab = (r: Range, text: string, locked = false) => (
    <Link
      href={`/insights?range=${r}`}
      aria-current={range === r ? "page" : undefined}
      className={`flex h-10 flex-1 items-center justify-center gap-1 rounded-md text-sm font-semibold transition tab:flex-none tab:px-5 ${
        range === r
          ? "bg-primary-default text-text-on-primary"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      {text}
      {locked && <span aria-label="paid plan" className="text-[10px] font-bold uppercase opacity-70">Paid</span>}
    </Link>
  );

  const daysPhrase = (n: number) =>
    n < 1 ? "less than a day" : n < 1.5 ? "about 1 day" : `about ${Math.round(n)} days`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[32px] font-semibold">Insights</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          What is selling, what needs restocking, and how {shop?.name ?? "your shop"} is doing.
        </p>
      </div>

      {mostlyTyped && isOwner && (
        <div className="flex flex-col gap-3 rounded-md border border-primary-border bg-primary-subtle p-4 tab:flex-row tab:items-center tab:justify-between">
          <p className="text-sm text-primary-text">
            {typedCount} of your {loggedCount} sales this month were typed in by
            hand. Add those items to your products and Insights can track their
            stock and warn you before they run out.
          </p>
          <Link
            href="/products"
            className="press flex h-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] px-5 text-sm font-semibold text-white"
          >
            Go to products
          </Link>
        </div>
      )}

      {/* Trend */}
      <Card title="Sales trend">
        <nav aria-label="Range" className="flex gap-1 rounded-md bg-[var(--color-bg-canvas)] p-1 tab:self-start">
          {tab("7d", "7 days")}
          {tab("weeks", `${weeksShown} weeks`)}
          {tab("months", "12 months", !paid)}
        </nav>

        {rangeLocked ? (
          <PaidOnly what="Seeing the last 12 months" isOwner={isOwner} />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-heading text-[32px] font-semibold">{formatNaira(headline.total)}</span>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {rangeLabel} · {headline.sales} {headline.sales === 1 ? "sale" : "sales"}
              </span>
              {compare && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    compare.pct === null
                      ? "bg-[var(--color-bg-canvas)] text-[var(--color-text-secondary)]"
                      : compare.pct >= 0
                        ? "bg-primary-subtle text-primary-text"
                        : "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
                  }`}
                >
                  {compare.pct === null
                    ? "No sales the week before to compare"
                    : `${compare.pct >= 0 ? "Up" : "Down"} ${Math.abs(compare.pct)}% on the 7 days before`}
                </span>
              )}
            </div>
            <TrendChart bars={bars} />
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 web:grid-cols-2">
        {/* Top sellers */}
        <Card title="Top sellers" note="Last 30 days, by money brought in">
          {topItems.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              No sales in the last 30 days yet. Your best sellers will show here.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {topItems.map((t, i) => (
                <li key={t.item} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate font-semibold">
                      {i + 1}. {t.item}
                    </span>
                    <span className="shrink-0 font-semibold">{formatNaira(t.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-canvas)]">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-primary-default"
                        style={{ width: `${(t.revenue / topMax) * 100}%` }}
                      />
                    </span>
                    <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">{t.quantity} sold</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {/* Running out */}
        <Card title="Running out soon" note="How fast each item sells, against the stock you have">
          {!paid ? (
            <PaidOnly what="Knowing what will run out, before it does," isOwner={isOwner} />
          ) : soon.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Nothing is about to run out. Items that sell fast and are low on
              stock will show here, about a week ahead.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-border)]">
              {soon.map((r) => (
                <li key={r.item} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{r.item}</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Sells about {r.perDay >= 1 ? Math.round(r.perDay) : r.perDay} a day · {r.stock <= 0 ? "none" : r.stock} left
                    </span>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.stock <= 0 || r.daysLeft < 2
                        ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
                        : "bg-primary-subtle text-primary-text"
                    }`}
                  >
                    {r.stock <= 0 ? "Out of stock" : daysPhrase(r.daysLeft)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Not selling */}
      <Card title="Not selling" note="Items with stock that have not sold in the last 30 days">
        {!paid ? (
          <PaidOnly what="Spotting stock that is not selling" isOwner={isOwner} />
        ) : catalogueAgeDays < 30 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Check back after 30 days. Items get a fair month to sell before
            they show here{catalogueAgeDays > 0 ? `, and your oldest product was added ${catalogueAgeDays} ${catalogueAgeDays === 1 ? "day" : "days"} ago` : ""}.
          </p>
        ) : stale.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Everything with stock has sold at least once in the last 30 days.
          </p>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-[var(--color-border)]">
              {stale.map((r) => (
                <li key={r.item} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{r.item}</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {r.stock} in stock ·{" "}
                      {r.lastSold
                        ? `last sold ${formatYmd(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date(r.lastSold)), { day: "numeric", month: "short" })}`
                        : "never sold"}
                    </span>
                  </div>
                  <span className="shrink-0 text-right text-sm font-semibold">
                    {formatNaira(r.value)}
                    <span className="block text-xs font-normal text-[var(--color-text-secondary)]">tied up</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Worth a look: a discount could free up the money, or you might
              stop restocking it. You can remove a product from the Products
              page; its past sales are kept.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
