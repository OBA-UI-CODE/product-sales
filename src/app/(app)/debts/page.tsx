import { getCurrentShopContext } from "@/lib/shop-context";
import DebtsClient from "./DebtsClient";

export default async function DebtsPage() {
  const { supabase, profile } = await getCurrentShopContext();

  const { data: sales } = await supabase
    .from("sales")
    .select("id, custom_item_name, debtor_name, total_price, amount_paid, sold_at, seller_id, products(name)")
    .eq("shop_id", profile.shop_id)
    .order("sold_at", { ascending: false });

  const { data: sellerProfiles } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("shop_id", profile.shop_id);
  const sellerMap = new Map((sellerProfiles ?? []).map((p) => [p.id, p.name]));

  const debts = (sales ?? [])
    .filter((s) => Number(s.amount_paid) < Number(s.total_price))
    .map((s) => ({
      id: s.id,
      custom_item_name: s.custom_item_name,
      productName: (s.products as unknown as { name: string } | null)?.name ?? null,
      debtor_name: s.debtor_name,
      total_price: Number(s.total_price),
      amount_paid: Number(s.amount_paid),
      sold_at: s.sold_at,
      sellerName: sellerMap.get(s.seller_id) ?? "Staff",
    }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-[32px] font-semibold">Debts</h1>
      <DebtsClient debts={debts} />
    </div>
  );
}
