import { getCurrentShopContext } from "@/lib/shop-context";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const { supabase, profile } = await getCurrentShopContext();

  const [{ data: products }, { data: variants }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, category, default_price, stock_quantity")
      .eq("shop_id", profile.shop_id)
      .is("archived_at", null)
      .order("name"),
    supabase
      .from("product_variants")
      .select("id, product_id, label, price, stock_quantity")
      .eq("shop_id", profile.shop_id)
      .is("archived_at", null)
      .order("price"),
  ]);

  return (
    <ProductsClient products={products ?? []} variants={variants ?? []} />
  );
}
