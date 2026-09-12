import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TrendIcon } from "@/components/dashboard/NavIcons";
import { getCurrentShopContext, shopOf } from "@/lib/shop-context";
import { FREE_HISTORY_DAYS, freeHistoryStart, isPaidShop } from "@/lib/plan";
import { formatNaira } from "@/lib/format";
import {
  addDays,
  addMonths,
  formatYmd,
  isYmd,
  lagosMidnight,
  lagosToday,
  monthStart,
  weekStart,
} from "@/lib/lagos-date";
import DatePicker from "./DatePicker";
import { SaleList, type SaleRowData } from "./SaleList";
import PeriodSummary, { monthBars, weekBars, type SummaryDay, type SummaryItem } from "./PeriodSummary";

/*
  Sales History: Day, Week and Month.

    Day    every sale on one day (as before), picked with the date box
    Week   Monday to Sunday: the total, a bar per day, best day, top items
    Month  the calendar month: the total, a bar per week, best day, top items

  All three use Lagos days (lib/lagos-date.ts). The old page used the
  server's midnight, which is UTC, so sales between midnight and 1am landed
  on the previous day.

  Week and Month are added up in the database (sales_summary) so a busy
  month is never cut short by the API's 1000-row limit.

  Free shops see what is inside their recent window: today and recent days,
  this week and last week, this month. Anything starting before it says so
  plainly, instead of showing a total that is quietly missing the older
  sales. Not in Figma; uses the page's existing styling.
*/

type View = "day" | "week" | "month";

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const { supabase, profile } = await getCurrentShopContext();
  const params = await searchParams;

  const view: View =
    params.view === "week" || params.view === "month" ? params.view : "day";
  const today = lagosToday();
  const anchor = isYmd(params.date) && params.date <= today ? params.date : today;

  /* The period being looked at, as Lagos days: [start, end). */
  const start =
    view === "day" ? anchor : view === "week" ? weekStart(anchor) : monthStart(anchor);
  const end =
    view === "day" ? addDays(start, 1) : view === "week" ? addDays(start, 7) : addMonths(start, 1);
  const prev =
    view === "day" ? addDays(start, -1) : view === "week" ? addDays(start, -7) : addMonths(start, -1);
  const next = end <= today ? end : null;

  const paid = isPaidShop(shopOf(profile));
  const isOwner = profile.role === "owner";
  const windowStart = freeHistoryStart();
  /* A period is shown only if all of it is visible; a half-hidden week
     would show a total that looks complete and is not. */
  const locked = !paid && lagosMidnight(start) < windowStart;

  const href = (v: View, d: string) => `/sales-history?view=${v}&date=${d}`;

  const label =
    view === "day"
      ? formatYmd(start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : view === "week"
        ? `${formatYmd(start, { day: "numeric", month: "short" })} to ${formatYmd(addDays(end, -1), { day: "numeric", month: "short", year: "numeric" })}`
        : formatYmd(start, { month: "long", year: "numeric" });

  let body: React.ReactNode;

  if (locked) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-[var(--color-border)] p-6 text-center">
        <p className="text-[var(--color-text-secondary)]">
          {view === "day"
            ? `Sales older than ${FREE_HISTORY_DAYS} days are on the paid plan.`
            : `This ${view} goes back further than the Free plan's ${FREE_HISTORY_DAYS} days, so its total is on the paid plan.`}{" "}
          They are all still here and come back the moment you subscribe.
        </p>
        {isOwner && (
          <Link
            href="/settings#billing"
            className="press flex h-11 items-center justify-center rounded-md bg-[var(--color-primary)] px-6 font-semibold text-white"
          >
            See plans
          </Link>
        )}
      </div>
    );
  } else if (view === "day") {
    const [{ data: salesData }, { data: sellerProfiles }] = await Promise.all([
      supabase
        .from("sales")
        .select(
          "id, custom_item_name, category, quantity, total_price, amount_paid, debtor_name, sold_at, edited_at, seller_id, products(name)"
        )
        .eq("shop_id", profile.shop_id)
        .gte("sold_at", lagosMidnight(start).toISOString())
        .lt("sold_at", lagosMidnight(end).toISOString())
        .order("sold_at", { ascending: false }),
      supabase.from("profiles").select("id, name").eq("shop_id", profile.shop_id),
    ]);
    const sellerMap = new Map((sellerProfiles ?? []).map((p) => [p.id, p.name]));

    const sales: SaleRowData[] = (salesData ?? []).map((s) => ({
      id: s.id,
      itemName:
        s.custom_item_name ??
        (s.products as unknown as { name: string } | null)?.name ??
        "Item",
      category: s.category,
      quantity: s.quantity,
      totalPrice: Number(s.total_price),
      amountPaid: Number(s.amount_paid),
      debtorName: s.debtor_name,
      sellerName: sellerMap.get(s.seller_id) ?? "Staff",
      soldAt: s.sold_at,
      edited: !!s.edited_at,
    }));
    const total = sales.reduce((sum, s) => sum + s.totalPrice, 0);

    body = (
      <>
        <div className="flex flex-col gap-1 rounded-md bg-[var(--color-bg-surface)] p-6">
          <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
          <span className="font-heading text-[32px] font-semibold">{formatNaira(total)}</span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {sales.length} {sales.length === 1 ? "sale" : "sales"}
          </span>
        </div>
        {sales.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
            No sales logged on this day.
          </p>
        ) : (
          <SaleList sales={sales} />
        )}
      </>
    );
  } else {
    const { data } = await supabase.rpc("sales_summary", {
      p_from: lagosMidnight(start).toISOString(),
      p_to: lagosMidnight(end).toISOString(),
    });
    const summary = (data ?? { days: [], top_items: [] }) as {
      days: SummaryDay[];
      top_items: SummaryItem[];
    };
    const days = summary.days.map((d) => ({
      day: d.day,
      total: Number(d.total),
      sales: Number(d.sales),
      collected: Number(d.collected),
    }));
    const topItems = summary.top_items.map((t) => ({
      item: t.item,
      total: Number(t.total),
      quantity: Number(t.quantity),
    }));

    body = (
      <PeriodSummary
        view={view}
        label={label}
        days={days}
        topItems={topItems}
        bars={
          view === "week"
            ? weekBars(start, days, today)
            : monthBars(start, end, days, today, weekStart)
        }
      />
    );
  }

  const tab = (v: View, text: string) => (
    <Link
      href={href(v, anchor)}
      aria-current={view === v ? "page" : undefined}
      className={`flex h-10 flex-1 items-center justify-center rounded-md text-sm font-semibold transition tab:flex-none tab:px-6 ${
        view === v
          ? "bg-primary-default text-text-on-primary"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      {text}
    </Link>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-[32px] font-semibold">Sales History</h1>
        <div className="flex flex-wrap items-center gap-3">
          {/*
            The way to Insights on phones, where it is not in the bottom bar
            (kept at five items). Here on tablet and web too, beside the
            sales it is about.
          */}
          <Link
            href="/insights"
            className="press flex h-11 items-center gap-2 rounded-md border border-primary-border px-4 text-sm font-semibold text-primary-text"
          >
            <TrendIcon className="size-4" />
            Insights
          </Link>
          {view === "day" && (
            <DatePicker
              key={anchor}
              defaultValue={anchor}
              max={today}
              min={paid ? undefined : addDays(today, -FREE_HISTORY_DAYS)}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 tab:flex-row tab:items-center tab:justify-between">
        <nav
          aria-label="Period"
          className="flex gap-1 rounded-md bg-[var(--color-bg-surface)] p-1"
        >
          {tab("day", "Day")}
          {tab("week", "Week")}
          {tab("month", "Month")}
        </nav>

        <div className="flex items-center justify-between gap-2 tab:justify-end">
          <Link
            href={href(view, prev)}
            aria-label={`Previous ${view}`}
            className="press flex size-10 items-center justify-center rounded-md border border-[var(--color-border)]"
          >
            <ChevronLeft size={18} />
          </Link>
          <span className="text-center text-sm font-semibold">
            {view === "day"
              ? start === today
                ? "Today"
                : start === addDays(today, -1)
                  ? "Yesterday"
                  : formatYmd(start, { weekday: "short", day: "numeric", month: "short" })
              : view === "week"
                ? start === weekStart(today)
                  ? "This week"
                  : start === addDays(weekStart(today), -7)
                    ? "Last week"
                    : label
                : start === monthStart(today)
                  ? "This month"
                  : label}
          </span>
          {next ? (
            <Link
              href={href(view, next)}
              aria-label={`Next ${view}`}
              className="press flex size-10 items-center justify-center rounded-md border border-[var(--color-border)]"
            >
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="flex size-10 items-center justify-center rounded-md border border-[var(--color-border)] opacity-30" aria-hidden>
              <ChevronRight size={18} />
            </span>
          )}
        </div>
      </div>

      {!paid && !locked && (
        <p className="-mt-2 text-sm text-[var(--color-text-secondary)]">
          The Free plan shows the last {FREE_HISTORY_DAYS} days.{" "}
          {isOwner && (
            <Link href="/settings#billing" className="font-semibold text-primary-text underline">
              See your full history
            </Link>
          )}
        </p>
      )}

      {body}
    </div>
  );
}
