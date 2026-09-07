"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentShopContext } from "@/lib/shop-context";
import {
  disableSubscription,
  initializeSubscription,
  isConfigured,
  type BillingPlan,
} from "@/lib/paystack";

export interface BillingState {
  error?: string;
  success?: string;
}

/*
  Writes to shops go through the service role.

  The shops table has no INSERT/UPDATE policy for billing columns — owners can
  update their shop's name, but subscription state must never be settable by
  the customer, or anyone could mark their own shop paid. Billing is changed
  here and in the webhook only.
*/
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export async function startSubscription(
  _prevState: BillingState,
  formData: FormData
): Promise<BillingState> {
  const { user, profile } = await getCurrentShopContext();

  if (profile.role !== "owner") {
    return { error: "Only the owner can manage billing." };
  }

  if (!isConfigured()) {
    return {
      error:
        "Payments are not set up yet. Add your Paystack secret key and plan codes to the server environment.",
    };
  }

  const plan = formData.get("plan") as BillingPlan;
  if (plan !== "monthly" && plan !== "yearly") {
    return { error: "Pick a plan to continue." };
  }

  const result = await initializeSubscription({
    email: user.email!,
    plan,
    shopId: profile.shop_id,
    callbackUrl: `${siteUrl()}/settings?billing=done`,
  });

  if (!result.ok || !("data" in result) || !result.data?.authorization_url) {
    return { error: result.message || "Could not start the payment." };
  }

  /*
    Remember which plan was chosen before handing off. The webhook confirms
    what was actually paid for, but this keeps the screen honest if the user
    comes back before the webhook lands.
  */
  const admin = adminClient();
  if (admin) {
    await admin
      .from("shops")
      .update({ billing_plan: plan })
      .eq("id", profile.shop_id);
  }

  // Paystack hosts the card form; we never see or store card details.
  redirect(result.data.authorization_url);
}

export async function cancelSubscription(): Promise<BillingState> {
  const { profile } = await getCurrentShopContext();

  if (profile.role !== "owner") {
    return { error: "Only the owner can manage billing." };
  }

  const admin = adminClient();
  if (!admin) {
    return { error: "Billing is not configured on the server." };
  }

  const { data: shop } = await admin
    .from("shops")
    .select("paystack_subscription_code, paystack_email_token")
    .eq("id", profile.shop_id)
    .maybeSingle();

  if (!shop?.paystack_subscription_code || !shop?.paystack_email_token) {
    return { error: "There is no active subscription to cancel." };
  }

  const result = await disableSubscription(
    shop.paystack_subscription_code,
    shop.paystack_email_token
  );

  if (!result.ok) {
    return { error: result.message || "Could not cancel the subscription." };
  }

  /*
    Marked canceled straight away so the screen tells the truth immediately;
    Paystack also sends subscription.disable, which sets the same thing.

    The shop keeps writing until current_period_end, because they have already
    paid for this period — shop_can_write() only stops on 'canceled', so the
    webhook is what flips it when the period actually runs out.
  */
  await admin
    .from("shops")
    .update({ subscription_status: "canceled" })
    .eq("id", profile.shop_id);

  revalidatePath("/settings");
  return {
    success:
      "Your subscription has been cancelled. You can subscribe again at any time.",
  };
}
