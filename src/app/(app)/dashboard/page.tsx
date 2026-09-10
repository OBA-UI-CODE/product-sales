import { getCurrentShopContext } from "@/lib/shop-context";
import { initials, formatNaira } from "@/lib/format";
import { getGreetingHeadline, getGreetingPrefix } from "@/lib/greeting";
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

  return (
    <div className="flex flex-col gap-6 web:gap-12">
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
            afternoon and evening lines are longer and wrapped inside it, so
            on web, where there is room beside Add Sale, the box fits the
            line instead and the headline stays on one line. */}
        <div className="flex w-[316px] flex-col gap-2 web:w-auto">
          <p className="w-full font-body text-[18px] font-medium leading-[28px] text-text-secondary">
            {getGreetingPrefix()}, {profile.name.split(" ")[0]}
          </p>
          <p className="w-full font-heading text-[40px] font-semibold leading-[48px] tracking-[-1px] text-text-primary tab:text-[32px] tab:leading-[39px] web:whitespace-nowrap">
            {getGreetingHeadline()}
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
