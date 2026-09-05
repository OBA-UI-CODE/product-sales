"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AddSaleInput {
  productId: string | null;
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
  return { success: true };
}
