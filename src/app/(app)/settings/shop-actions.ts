"use server";

import { revalidatePath } from "next/cache";
import { getCurrentShopContext } from "@/lib/shop-context";
import type { StaffState } from "./actions";

/*
  Saves the shop's name and phone number.

  Written with the SIGNED-IN user's client on purpose, not the service role.
  These are two of the five columns an owner is allowed to write directly, so
  the database is what enforces the rule: if this ever tried to change a
  billing column it would be refused rather than quietly succeeding.
*/
export async function updateShopDetails(
  _prev: StaffState,
  formData: FormData
): Promise<StaffState> {
  const { supabase, profile } = await getCurrentShopContext();

  if (profile.role !== "owner") {
    return { error: "Only the owner can change the shop's details." };
  }

  const name = ((formData.get("name") as string) ?? "").trim();
  const phone = ((formData.get("phone") as string) ?? "").trim();

  if (!name) return { error: "Your shop needs a name." };

  const { error } = await supabase
    .from("shops")
    .update({ name, phone: phone || null })
    .eq("id", profile.shop_id);

  if (error) return { error: `Could not save that: ${error.message}` };

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: "Saved." };
}
