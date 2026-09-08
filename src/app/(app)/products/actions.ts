"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentShopContext } from "@/lib/shop-context";
import { revalidatePath } from "next/cache";

export interface VariantInput {
  label: string;
  price: number;
  stock: number;
}

/*
  Variants are optional. A product saved without any keeps using its own
  default_price and stock_quantity, exactly as before; a product saved with
  them ignores those two fields and counts stock per size instead.
*/
function parseVariants(raw: FormDataEntryValue | null): VariantInput[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as VariantInput[];
    return parsed
      .filter((v) => v && typeof v.label === "string" && v.label.trim())
      .map((v) => ({
        label: v.label.trim(),
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
      }));
  } catch {
    return [];
  }
}

export async function addProduct(formData: FormData) {
  const { supabase, profile } = await getCurrentShopContext();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  const variants = parseVariants(formData.get("variants"));

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      shop_id: profile.shop_id,
      name,
      category,
      default_price: price,
      stock_quantity: stock,
    })
    .select("id")
    .single();

  if (error || !product) return;

  if (variants.length > 0) {
    await supabase.from("product_variants").insert(
      variants.map((v) => ({
        shop_id: profile.shop_id,
        product_id: product.id,
        label: v.label,
        price: v.price,
        stock_quantity: v.stock,
      }))
    );
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
}

/* Add a size to a product that already exists. */
export async function addVariant(productId: string, variant: VariantInput) {
  const { supabase, profile } = await getCurrentShopContext();
  if (!variant.label.trim()) return;

  await supabase.from("product_variants").insert({
    shop_id: profile.shop_id,
    product_id: productId,
    label: variant.label.trim(),
    price: Number(variant.price) || 0,
    stock_quantity: Number(variant.stock) || 0,
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
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
  revalidatePath("/dashboard");
}

/* Stock lives on the variant once a product has sizes, so restocking has to
   target the variant rather than the product. */
export async function restockVariant(variantId: string, quantity: number) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("restock_variant", {
    p_variant_id: variantId,
    p_quantity: quantity,
    p_reason: "restock",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/products");
  revalidatePath("/dashboard");
}

/*
  Archives the product AND its sizes.

  This used to update only the products row, which left every variant active
  forever — still holding stock, attached to a product the app no longer
  shows. Both archives now happen inside one database function so they cannot
  half-happen, and so the paywall and ownership checks run in the same place
  as every other write.
*/
export async function deleteProduct(productId: string) {
  const { supabase } = await getCurrentShopContext();
  const { error } = await supabase.rpc("archive_product", {
    p_product_id: productId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/products");
  revalidatePath("/dashboard");
}

/*
  Archived rather than deleted: past sales point at this variant, and removing
  the row would break the record of what was actually sold.
*/
export async function deleteVariant(variantId: string) {
  const { supabase, profile } = await getCurrentShopContext();
  const { error } = await supabase
    .from("product_variants")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", variantId)
    .eq("shop_id", profile.shop_id);
  if (error) throw new Error(error.message);
  revalidatePath("/products");
  revalidatePath("/dashboard");
}
