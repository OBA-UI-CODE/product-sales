import { getCurrentShopContext } from "@/lib/shop-context";
import { initials, formatNaira } from "@/lib/format";
import { DollarSign, BarChart3, ShoppingCart, TrendingDown } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
        <Icon size={18} className="text-[var(--color-primary-hover)]" />
      </div>
      <span className="font-heading text-[32px] font-semibold">{value}</span>
      <span className="text-sm text-[var(--color-text-secondary)]">{sub}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const { supabase, profile } = await getCurrentShopContext();
  const shopId = profile.shop_id;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: todaySales } = await supabase
    .from("sales")
    .select("id, custom_item_name, category, quantity, total_price, amount_paid, sold_at, seller_id, product_id, products(name)")
    .eq("shop_id", shopId)
    .gte("sold_at", startOfToday.toISOString())
    .order("sold_at", { ascending: false })
    .limit(10);

  const sales = todaySales ?? [];
  const totalToday = sales.reduce((sum, s) => sum + Number(s.total_price), 0);
  const collectedToday = sales.reduce((sum, s) => sum + Number(s.amount_paid), 0);
  const owedToday = totalToday - collectedToday;
  const avgSale = sales.length ? totalToday / sales.length : 0;

  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id")
    .eq("shop_id", shopId)
    .lte("stock_quantity", 5)
    .is("archived_at", null);

  const { data: sellerProfiles } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("shop_id", shopId);

  const sellerMap = new Map((sellerProfiles ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-[var(--color-text-secondary)]">
            Good Morning, {profile.name.split(" ")[0]}
          </p>
          <h1 className="font-heading text-[32px] font-semibold">
            How Market Today.
          </h1>
        </div>
        <button className="flex h-11 items-center rounded-[10px] bg-[var(--color-primary)] px-5 font-semibold text-white transition hover:bg-[var(--color-primary-hover)]">
          + Add Sale
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <StatCard
          label="Today's sales"
          value={formatNaira(totalToday)}
          sub={`${formatNaira(collectedToday)} collected${owedToday > 0 ? ` · ${formatNaira(owedToday)} owed` : " - all paid"}`}
          icon={DollarSign}
        />
        <StatCard
          label="Sales logged"
          value={String(sales.length)}
          sub={`by ${new Set(sales.map((s) => s.seller_id)).size} staff members`}
          icon={BarChart3}
        />
        <StatCard
          label="Average sale"
          value={formatNaira(avgSale)}
          sub="Per transaction"
          icon={ShoppingCart}
        />
        <StatCard
          label="Low stock"
          value={String(lowStockProducts?.length ?? 0)}
          sub="items need restock soon"
          icon={TrendingDown}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold">
            Today&apos;s Sales
          </h2>
          <a
            href="/sales-history"
            className="font-heading text-lg font-semibold text-[var(--color-primary-hover)]"
          >
            See all
          </a>
        </div>

        <div className="flex flex-col gap-3">
          {sales.length === 0 && (
            <p className="rounded-[14px] border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
              No sales logged yet today.
            </p>
          )}
          {sales.map((sale) => {
            const itemName =
              sale.custom_item_name ??
              (sale.products as unknown as { name: string } | null)?.name ??
              "Item";
            const sellerName = sellerMap.get(sale.seller_id) ?? "Staff";
            const isPaid = Number(sale.amount_paid) >= Number(sale.total_price);
            const time = new Date(sale.sold_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-[14px] bg-[var(--color-bg-surface)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-border-strong)] text-sm">
                    {initials(sellerName)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg">{itemName}</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {sale.category ?? "General"} · {time}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">
                      {formatNaira(Number(sale.total_price))}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isPaid
                          ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                          : "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
                      }`}
                    >
                      {isPaid ? "Paid" : "Owing"}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {sellerName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
