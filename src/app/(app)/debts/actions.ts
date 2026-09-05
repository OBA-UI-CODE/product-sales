"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordPayment(saleId: string, amount: number) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_payment", {
    p_sale_id: saleId,
    p_amount: amount,
    p_pay_full: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/debts");
  revalidatePath("/dashboard");
}
