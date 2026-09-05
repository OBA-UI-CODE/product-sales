import { getCurrentShopContext } from "@/lib/shop-context";
import { initials, formatNaira } from "@/lib/format";
import DatePicker from "./DatePicker";

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { supabase, profile } = await getCurrentShopContext();
  const { date } = await searchParams;

  const selectedDate = date ? new Date(date) : new Date();
  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(selectedDate);
  end.setHours(23, 59, 59, 999);

  const { data: salesData } = await supabase
    .from("sales")
    .select("id, custom_item_name, category, total_price, amount_paid, sold_at, seller_id, products(name)")
    .eq("shop_id", profile.shop_id)
    .gte("sold_at", start.toISOString())
    .lte("sold_at", end.toISOString())
    .order("sold_at", { ascending: false });

  const { data: sellerProfiles } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("shop_id", profile.shop_id);
  const sellerMap = new Map((sellerProfiles ?? []).map((p) => [p.id, p.name]));

  const sales = salesData ?? [];
  const total = sales.reduce((sum, s) => sum + Number(s.total_price), 0);
  const dateStr = selectedDate.toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[32px] font-semibold">
          Sales History
        </h1>
        <DatePicker defaultValue={dateStr} />
      </div>

      <div className="flex flex-col gap-1 rounded-[14px] bg-[var(--color-bg-surface)] p-6">
        <span className="text-sm text-[var(--color-text-secondary)]">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <span className="font-heading text-[32px] font-semibold">
          {formatNaira(total)}
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {sales.length} sales
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {sales.length === 0 && (
          <p className="rounded-[14px] border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
            No sales logged on this day.
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
  );
}
