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

export interface SaleActionResult {
  error?: string;
}

/*
  These RETURN their error rather than throwing it.

  Next sanitises the message of an error thrown inside a server action before
  it reaches the browser, which is right for an unexpected crash and wrong
  here: "You can only edit sales you logged yourself" is the whole point of
  the message, and the modal was showing "Couldn't save those changes. Try
  again." instead — advice that would have a staff member retrying forever
  against a rule that will never let them through.
*/
export async function updateSale(
  input: UpdateSaleInput
): Promise<SaleActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_sale", {
    p_sale_id: input.saleId,
    p_quantity: input.quantity,
    p_total_price: input.totalPrice,
    p_amount_paid: input.amountPaid,
    p_debtor_name: input.debtorName,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/sales-history");
  revalidatePath("/debts");
  return {};
}

export async function deleteSale(
  saleId: string
): Promise<SaleActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_sale", { p_sale_id: saleId });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/sales-history");
  revalidatePath("/debts");
  return {};
}
