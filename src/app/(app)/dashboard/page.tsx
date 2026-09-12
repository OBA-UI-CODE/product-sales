import { getCurrentShopContext, shopOf } from "@/lib/shop-context";
import { initials, formatNaira } from "@/lib/format";
import { getGreetingHeadline, getGreetingPrefix, HEADLINE_EM } from "@/lib/greeting";
import { AddSaleButton } from "./AddSaleButton";
import StatCard, {
  AvatarStack,
  ChangePill,
  Sparkline,
} from "@/components/dashboard/StatCard";
import SaleRowList, {
  type DashboardSale,
} from "@/components/dashboard/SaleRowList";
import InstallApp from "@/components/InstallApp";
import TrialNotice from "@/components/dashboard/TrialNotice";
import { isOnTrial, isPaidShop } from "@/lib/plan";
import { formatDay } from "@/lib/notices";
import { lagosMidnight, lagosToday, weekStart } from "@/lib/lagos-date";

/*
  Dashboard — Figma 201:3069 (web) / 201:3077 (tablet) / 201:3085 (mobile)

    header  greeting Inter Medium 18/28 secondary + headline DM Sans 32/39 -1,
            gap 8, with "+ Add Sale" on the right (tablet and web only)
    stats   four cards — one row of 265 on web, a 2x2 grid of 239 on tablet,
            a single column on mobile; 16 gap on web, 24 on tablet and mobile
    sales   "Today's Sales" + "See all", then rows 90 tall, 24 apart

  The cards show a change against yesterday, which the page did not previously
  query. That is one extra query for yesterday's sales, from which the three
  deltas are derived. The sparkline is the file's own exported curve — the
  design draws a fixed shape, not a plot of the shop's data, so it is not
  presented as one.
*/

function pctChange(today: number, yesterday: number): string {
  if (yesterday === 0) return today === 0 ? "0%" : "100%";
  return Math.round(((today - yesterday) / yesterday) * 100) + "%";
}

export default async function DashboardPage() {
  const { supabase, profile } = await getCurrentShopContext();
  const shopId = profile.shop_id;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  /*
    Run the four reads together. They do not depend on each other, and each is
    a network round trip to Supabase — awaiting them in sequence was costing
    roughly four times the latency on every dashboard load.
  */
  /* Started now so it runs alongside the reads below, not after them. */
  const weekTopPromise = supabase.rpc("insights_top_items", {
    p_from: lagosMidnight(weekStart(lagosToday())).toISOString(),
    p_to: new Date().toISOString(),
    p_limit: 3,
  });

  const [
    { data: todaySales },
    { data: yesterdaySales },
    { data: lowStockProducts },
    { data: sellerProfiles },
  ] = await Promise.all([
    supabase
      .from("sales")
      .select(
        "id, custom_item_name, category, quantity, total_price, amount_paid, debtor_name, edited_at, sold_at, seller_id, product_id, products(name)"
      )
      .eq("shop_id", shopId)
      .gte("sold_at", startOfToday.toISOString())
      .order("sold_at", { ascending: false })
      .limit(10),
    /* Yesterday, for the change figures the cards show. */
    supabase
      .from("sales")
      .select("total_price")
      .eq("shop_id", shopId)
      .gte("sold_at", startOfYesterday.toISOString())
      .lt("sold_at", startOfToday.toISOString()),
    supabase
      .from("products")
      .select("id")
      .eq("shop_id", shopId)
      .lte("stock_quantity", 5)
      .is("archived_at", null),
    supabase.from("profiles").select("id, name").eq("shop_id", shopId),
  ]);

  /* This week's top sellers (Monday to now, Lagos), for the card under the
     stats. Added up in the database, see insights_top_items(). */
  const { data: weekTop } = await weekTopPromise;
  const topThisWeek = ((weekTop ?? []) as { item: string; quantity: number; revenue: number }[]).map((t) => ({
    item: t.item,
    quantity: Number(t.quantity),
    revenue: Number(t.revenue),
  }));

  const sales = todaySales ?? [];
  const totalToday = sales.reduce((sum, s) => sum + Number(s.total_price), 0);
  const collectedToday = sales.reduce(
    (sum, s) => sum + Number(s.amount_paid),
    0
  );
  const owedToday = totalToday - collectedToday;
  const avgSale = sales.length ? totalToday / sales.length : 0;

  const yesterday = yesterdaySales ?? [];
  const totalYesterday = yesterday.reduce(
    (sum, s) => sum + Number(s.total_price),
    0
  );
  const avgYesterday = yesterday.length ? totalYesterday / yesterday.length : 0;
  const countDelta = sales.length - yesterday.length;

  const sellerMap = new Map((sellerProfiles ?? []).map((p) => [p.id, p.name]));
  const sellerIdsToday = [...new Set(sales.map((s) => s.seller_id))];
  const sellerInitials = sellerIdsToday.map((id) =>
    initials(sellerMap.get(id) ?? "Staff")
  );
  const lowStockCount = lowStockProducts?.length ?? 0;

  /*
    Shaped here rather than in the client component so the row still renders on
    the server; only the click handling and modal are client-side.
  */
  const saleRows: DashboardSale[] = sales.map((sale) => {
    const itemName =
      sale.custom_item_name ??
      (sale.products as unknown as { name: string } | null)?.name ??
      "Item";
    const sellerName = sellerMap.get(sale.seller_id) ?? "Staff";
    const time = new Date(sale.sold_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return {
      id: sale.id,
      initials: initials(sellerName),
      itemName,
      meta: (sale.category ?? "General") + " · " + time,
      price: formatNaira(Number(sale.total_price)),
      paid: Number(sale.amount_paid) >= Number(sale.total_price),
      sellerName,
      quantity: sale.quantity,
      totalPrice: Number(sale.total_price),
      amountPaid: Number(sale.amount_paid),
      debtorName: sale.debtor_name,
      soldAt: sale.sold_at,
      edited: sale.edited_at !== null,
    };
  });

  const collectedNote =
    owedToday > 0
      ? formatNaira(collectedToday) +
        " collected · " +
        formatNaira(owedToday) +
        " owed"
      : formatNaira(collectedToday) + " collected - all paid";

  /*
    One line on mobile too. The line is shrunk only as far as the phone needs:
    the width it must fit is the screen less the page's 24px margins (and 2px
    to spare), letter-spacing of -1px per character is given back, and the
    result is divided by the headline's width in ems. Capped at the design's
    40px, so the short morning line is untouched on an ordinary phone.
  */
  const headline = getGreetingHeadline();
  const headlineFit = `calc((100vw - 50px + ${headline.length}px) / ${
    HEADLINE_EM[headline] ?? 13.25
  })`;

  /*
    The owner's free-month notice: during the trial, in its last three days,
    and for a week after it ends while the shop is on Free. See
    components/dashboard/TrialNotice.tsx.
  */
  const shop = shopOf(profile);
  let trialNotice: React.ReactNode = null;
  if (profile.role === "owner" && shop?.trial_ends_at) {
    const endsAt = new Date(shop.trial_ends_at).getTime();
    const msLeft = endsAt - Date.now();
    const daysLeft = Math.max(1, Math.ceil(msLeft / 86_400_000));
    /* Only a trial that ran out without subscribing. A shop that paid and
       then let it lapse is not told its "free month" ended. */
    const endedRecently =
      shop.subscription_status === "trialing" &&
      !isPaidShop(shop) &&
      msLeft <= 0 &&
      msLeft > -7 * 86_400_000;
    const phase = isOnTrial(shop)
      ? msLeft <= 3 * 86_400_000
        ? "final"
        : "trial"
      : endedRecently
        ? "ended"
        : null;
    if (phase) {
      trialNotice = (
        <TrialNotice
          phase={phase}
          endsOn={formatDay(shop.trial_ends_at)}
          daysLeft={daysLeft}
          shopName={shop.name}
          storageKey={`johta:trial-notice:${phase}:${shop.trial_ends_at.slice(0, 10)}`}
        />
      );
    }
  }

  return (
    <div className="flex flex-col gap-6 web:gap-12">
      {trialNotice}
      {/* Where most installs happen: people install after signing up, not
          while reading the marketing site. Renders nothing once installed
          or dismissed. */}
      <InstallApp variant="inline" />
      {/* Header and cards share a group: the gap between them is 32 on
          mobile, 24 on tablet and 48 on web, while the gap down to the sales
          list is 24 / 24 / 48. */}
      <div className="flex flex-col gap-8 tab:gap-6 web:gap-12">
      {/* The Add Sale button sits on the bottom edge of the 75-tall header on
          tablet and is centred on web, per the two frames. */}
          <div className="flex items-end justify-between web:items-center">
        {/* 316 is the file's box, drawn around "How Market Today.". The
            afternoon and evening lines are longer and wrapped inside it. On
            web the box fits the line instead; on mobile it takes the full
            width and the line is sized to fit it (see headlineFit). Tablet
            keeps the file's box. */}
        <div className="flex w-full flex-col gap-2 tab:w-[316px] web:w-auto">
          <p className="w-full font-body text-[18px] font-medium leading-[28px] text-text-secondary">
            {getGreetingPrefix()}, {profile.name.split(" ")[0]}
          </p>
          <p
            style={{ "--greet-fit": headlineFit } as React.CSSProperties}
            className="w-full whitespace-nowrap font-heading text-[length:min(40px,var(--greet-fit))] font-semibold leading-[1.2] tracking-[-1px] text-text-primary tab:whitespace-normal tab:text-[32px] tab:leading-[39px] web:whitespace-nowrap"
          >
            {headline}
          </p>
        </div>
        <AddSaleButton />
      </div>

      <div className="grid grid-cols-1 gap-6 tab:grid-cols-2 web:grid-cols-4 web:gap-4">
        <StatCard
          label="Today&rsquo;s sales"
          icon="/figma/card-coin.svg"
          value={formatNaira(totalToday)}
          sub={collectedNote}
          footer={
            <div className="flex w-full items-end justify-between gap-4">
              <ChangePill
                direction={totalToday >= totalYesterday ? "up" : "down"}
                value={pctChange(totalToday, totalYesterday)}
                note={sales.length + " sales logged today"}
              />
              <Sparkline src="/figma/card-spark-1.svg" />
            </div>
          }
        />

        <StatCard
          label="Sales logged"
          icon="/figma/card-chart-card.svg"
          value={String(sales.length)}
          sub={"by " + sellerIdsToday.length + " staff members"}
          footer={
            <div className="flex w-full items-center justify-between gap-4">
              <ChangePill
                direction={countDelta >= 0 ? "up" : "down"}
                value={(countDelta >= 0 ? "+" : "") + countDelta}
                note="vs yesterday"
              />
              <AvatarStack names={sellerInitials} />
            </div>
          }
        />

        <StatCard
          label="Average sale"
          icon="/figma/card-cart.svg"
          value={formatNaira(avgSale)}
          sub="Per transaction"
          footer={
            <div className="flex w-full items-end justify-between gap-4">
              <ChangePill
                direction={avgSale >= avgYesterday ? "up" : "down"}
                value={pctChange(avgSale, avgYesterday)}
              />
              <Sparkline src="/figma/card-spark-2.svg" />
            </div>
          }
        />

        <StatCard
          label="Low stock"
          icon="/figma/card-trend.svg"
          iconClass="h-3 w-5 rotate-180"
          mobileContentClass="h-[178px]"
          value={String(lowStockCount)}
          sub={lowStockCount + " items need restock soon"}
          footer={<ChangePill direction="down" value={"-" + lowStockCount} />}
        />
      </div>
      </div>

      {/*
        Top sellers this week, at a glance. Not in Figma (added with the
        Insights page, 12 September 2026); styled like the stat cards.
        Hidden in a week with no sales yet rather than showing an empty box.
      */}
      {topThisWeek.length > 0 && (
        <section className="flex flex-col gap-4 rounded-md border border-border-default bg-bg-surface p-5 tab:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-primary">
              Top sellers this week
            </h2>
            <a
              href="/insights"
              className="whitespace-nowrap font-body text-[14px] leading-[24px] text-primary-text tab:text-[16px]"
            >
              See insights
            </a>
          </div>
          <ol className="flex flex-col gap-3">
            {topThisWeek.map((t, i) => (
              <li key={t.item} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-heading text-sm font-semibold text-primary-text">
                    {i + 1}
                  </span>
                  <span className="min-w-0 truncate font-body text-[16px] text-text-primary">{t.item}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-body text-[16px] font-semibold text-text-primary">{formatNaira(t.revenue)}</span>
                  <span className="block font-body text-[12px] text-text-secondary">{t.quantity} sold</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-primary tab:text-[24px] tab:leading-[29px]">
            Today&apos;s Sales
          </h2>
          <a
            href="/sales-history"
            className="whitespace-nowrap font-body text-[14px] font-normal leading-[24px] text-primary-text tab:text-[18px] tab:leading-[22px]"
          >
            See all
          </a>
        </div>

        <SaleRowList sales={saleRows} />
      </div>

      <AddSaleButton variant="fab" />
    </div>
  );
}
