"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordFullPayment(saleId: string) {
  const supabase = await createClient();
  await supabase.rpc("record_payment", {
    p_sale_id: saleId,
    p_amount: null,
    p_pay_full: true,
  });
  revalidatePath("/debts");
}
