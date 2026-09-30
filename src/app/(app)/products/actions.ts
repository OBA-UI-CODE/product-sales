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
        price: Number(v.price),
        stock: Number(v.stock),
      }));
  } catch {
    return [];
  }
}

function validInventoryNumber(value: number, integer = false): boolean {
  return Number.isFinite(value) && value >= 0 && (!integer || Number.isSafeInteger(value));
}

function validateVariant(variant: VariantInput): void {
  if (!variant.label || variant.label.length > 100) {
    throw new Error("Each size or pack needs a label of up to 100 characters.");
  }
  if (!validInventoryNumber(variant.price) || !validInventoryNumber(variant.stock, true)) {
    throw new Error("Prices and stock must be valid non-negative numbers.");
  }
}

export async function addProduct(formData: FormData) {
  const { supabase, profile } = await getCurrentShopContext();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const variants = parseVariants(formData.get("variants"));

  if (!name || name.length > 200 || category.length > 100) {
    throw new Error("Enter a valid product name and category.");
  }
  if (!validInventoryNumber(price) || !validInventoryNumber(stock, true)) {
    throw new Error("Price and stock must be valid non-negative numbers.");
  }
  if (variants.length > 100) throw new Error("A product can have at most 100 variants.");
  variants.forEach(validateVariant);

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

  if (error || !product) throw new Error(error?.message ?? "Could not add the product.");

  if (variants.length > 0) {
    const { error: variantsError } = await supabase.from("product_variants").insert(
      variants.map((v) => ({
        shop_id: profile.shop_id,
        product_id: product.id,
        label: v.label,
        price: v.price,
        stock_quantity: v.stock,
      }))
    );
    if (variantsError) {
      // The product is brand new and has no sales, so remove the partial row.
      await supabase.from("products").delete().eq("id", product.id);
      throw new Error(variantsError.message);
    }
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
}

/* Add a size to a product that already exists. */
export async function addVariant(productId: string, variant: VariantInput) {
  const { supabase, profile } = await getCurrentShopContext();
  const clean = { ...variant, label: variant.label.trim() };
  validateVariant(clean);

  const { error } = await supabase.from("product_variants").insert({
    shop_id: profile.shop_id,
    product_id: productId,
    label: clean.label,
    price: clean.price,
    stock_quantity: clean.stock,
  });
  if (error) throw new Error(error.message);

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
