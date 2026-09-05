"use server";

import { getCurrentShopContext } from "@/lib/shop-context";
import { revalidatePath } from "next/cache";

export interface AddStaffState {
  error?: string;
  success?: boolean;
}

export async function addStaffAccount(
  _prevState: AddStaffState,
  formData: FormData
): Promise<AddStaffState> {
  const { profile } = await getCurrentShopContext();

  if (profile.role !== "owner") {
    return { error: "Only the owner can add staff." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Please fill in every field." };
  }

  // NOTE: this requires the Supabase service role key to create a user
  // without going through the normal signup/email-confirmation flow.
  // SUPABASE_SERVICE_ROLE_KEY is not yet configured in this project's
  // environment (see .env.local.example) — this action will fail until
  // that's added. Flagged rather than silently left broken.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return {
      error:
        "Staff creation requires the Supabase service role key, which isn't configured yet in this environment.",
    };
  }

  return { error: "Not yet implemented." };
}

export async function removeStaffAccount(staffId: string) {
  const { supabase, profile } = await getCurrentShopContext();
  if (profile.role !== "owner") return;
  if (staffId === profile.id) return; // can't remove yourself

  await supabase
    .from("profiles")
    .delete()
    .eq("id", staffId)
    .eq("shop_id", profile.shop_id);

  revalidatePath("/settings");
}
