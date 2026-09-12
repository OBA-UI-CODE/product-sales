"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentShopContext } from "@/lib/shop-context";
import { revalidatePath } from "next/cache";

export interface AddSaleInput {
  productId: string | null;
  /* Set when the shop picked a specific size / pack. Stock then moves on the
     variant rather than the product. */
  variantId: string | null;
  customItemName: string | null;
  category: string | null;
  quantity: number;
  totalPrice: number;
  amountPaid: number;
  debtorName: string | null;
}

export async function addSale(input: AddSaleInput) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("create_sale", {
    p_product_id: input.productId,
    p_variant_id: input.variantId,
    p_custom_item_name: input.customItemName,
    p_category: input.category,
    p_quantity: input.quantity,
    p_total_price: input.totalPrice,
    p_amount_paid: input.amountPaid,
    p_debtor_name: input.debtorName,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/sales-history");
  revalidatePath("/debts");
  revalidatePath("/insights");

  const suggestProduct = input.customItemName
    ? await productSuggestion(input.customItemName)
    : null;
  return { success: true, suggestProduct };
}

/*
  "You've sold Ankara 3 times. Add it to your products?"

  Sales typed in by hand have no product, so they get no stock tracking and
  only a name-match in Insights (running out and not selling need a
  product). The second time the same thing is typed within 60 days, the
  owner is offered to make it a product. Owners only: staff cannot add
  products. Not offered if a product of that name already exists.

  Compared in JS after a bounded read rather than with ILIKE, whose % and _
  would turn a name like "50% off" into a pattern.
*/
async function productSuggestion(typed: string): Promise<{ name: string; times: number } | null> {
  const { supabase, profile } = await getCurrentShopContext();
  if (profile.role !== "owner") return null;

  const norm = (v: string | null) => (v ?? "").trim().replace(/\s+/g, " ").toLowerCase();
  const target = norm(typed);
  if (!target) return null;

  const since = new Date(Date.now() - 60 * 86_400_000).toISOString();
  const [{ data: recent }, { data: products }] = await Promise.all([
    supabase
      .from("sales")
      .select("custom_item_name")
      .eq("shop_id", profile.shop_id)
      .is("product_id", null)
      .gte("sold_at", since)
      .limit(500),
    supabase
      .from("products")
      .select("name")
      .eq("shop_id", profile.shop_id)
      .is("archived_at", null),
  ]);

  if ((products ?? []).some((p) => norm(p.name) === target)) return null;
  const times = (recent ?? []).filter((r) => norm(r.custom_item_name) === target).length;
  return times >= 2 ? { name: typed.trim().replace(/\s+/g, " "), times } : null;
}
