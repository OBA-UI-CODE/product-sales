import Link from "next/link";
import { getCurrentShopContext, shopOf } from "@/lib/shop-context";
import { FREE_HISTORY_DAYS, freeHistoryStart, isPaidShop } from "@/lib/plan";
import { formatNaira } from "@/lib/format";
import DatePicker from "./DatePicker";
import { SaleList, type SaleRowData } from "./SaleList";

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

  /*
    Free shops see the last 30 days. The database hides older sales anyway
    (except ones still owed), so a day before the window would come back
    empty or showing only its debts, which reads as "nothing was sold".
    It is said plainly instead, without querying.
  */
  const paid = isPaidShop(shopOf(profile));
  const windowStart = freeHistoryStart();
  windowStart.setHours(0, 0, 0, 0);
  const locked = !paid && end < windowStart;
  /* Billing is the owner's; staff are not sent to a page they cannot use. */
  const isOwner = profile.role === "owner";

  const { data: salesData } = locked
    ? { data: [] }
    : await supabase
    .from("sales")
    .select(
      "id, custom_item_name, category, quantity, total_price, amount_paid, debtor_name, sold_at, edited_at, seller_id, products(name)"
    )
    .eq("shop_id", profile.shop_id)
    .gte("sold_at", start.toISOString())
    .lte("sold_at", end.toISOString())
    .order("sold_at", { ascending: false });

  const { data: sellerProfiles } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("shop_id", profile.shop_id);
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
  const dateStr = selectedDate.toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[32px] font-semibold">
          Sales History
        </h1>
        <DatePicker
          defaultValue={dateStr}
          min={paid ? undefined : windowStart.toISOString().split("T")[0]}
        />
      </div>

      {!paid && !locked && (
        <p className="-mt-4 text-sm text-[var(--color-text-secondary)]">
          The Free plan shows the last {FREE_HISTORY_DAYS} days.{" "}
          {isOwner && (
            <Link href="/settings#billing" className="font-semibold text-primary-text underline">
              See your full history
            </Link>
          )}
        </p>
      )}

      <div className="flex flex-col gap-1 rounded-md bg-[var(--color-bg-surface)] p-6">
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

      {locked ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-[var(--color-border)] p-6 text-center">
          <p className="text-[var(--color-text-secondary)]">
            Sales older than {FREE_HISTORY_DAYS} days are on the paid plan.
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
      ) : sales.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-text-secondary)]">
          No sales logged on this day.
        </p>
      ) : (
        <SaleList sales={sales} />
      )}
    </div>
  );
}
