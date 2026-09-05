"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateSaleInput {
  saleId: string;
  quantity: number;
  totalPrice: number;
  amountPaid: number;
  debtorName: string | null;
}

export async function updateSale(input: UpdateSaleInput) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_sale", {
    p_sale_id: input.saleId,
    p_quantity: input.quantity,
    p_total_price: input.totalPrice,
    p_amount_paid: input.amountPaid,
    p_debtor_name: input.debtorName,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/sales-history");
  revalidatePath("/debts");
}

export async function deleteSale(saleId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_sale", { p_sale_id: saleId });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/sales-history");
  revalidatePath("/debts");
}
