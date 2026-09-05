"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentShopContext } from "@/lib/shop-context";
import { revalidatePath } from "next/cache";

export async function addProduct(formData: FormData) {
  const { supabase, profile } = await getCurrentShopContext();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  await supabase.from("products").insert({
    shop_id: profile.shop_id,
    name,
    category,
    default_price: price,
    stock_quantity: stock,
  });

  revalidatePath("/products");
}

export async function restockProduct(productId: string, quantity: number) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("restock_product", {
    p_product_id: productId,
    p_quantity: quantity,
    p_reason: "restock",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  const { supabase, profile } = await getCurrentShopContext();
  await supabase
    .from("products")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", productId)
    .eq("shop_id", profile.shop_id);
  revalidatePath("/products");
}
