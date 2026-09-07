import { getCurrentShopContext } from "@/lib/shop-context";
import SettingsClient from "./SettingsClient";
import BillingSection, { type BillingInfo } from "./BillingSection";
import { isConfigured } from "@/lib/paystack";

export default async function SettingsPage() {
  const { supabase, profile } = await getCurrentShopContext();

  const { data: staff } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("shop_id", profile.shop_id)
    .order("role", { ascending: false });

  /*
    Billing state is read straight from the shop. It is only ever written by
    the webhook or the billing actions (service role), never by the customer.
  */
  const { data: shop } = await supabase
    .from("shops")
    .select(
      "subscription_status, trial_ends_at, current_period_end, billing_plan"
    )
    .eq("id", profile.shop_id)
    .maybeSingle();

  const billing: BillingInfo | null = shop
    ? {
        status: shop.subscription_status,
        trialEndsAt: shop.trial_ends_at,
        currentPeriodEnd: shop.current_period_end,
        plan: shop.billing_plan,
        configured: isConfigured(),
      }
    : null;

  return (
    <div className="flex flex-col gap-8">
      <SettingsClient
        staff={staff ?? []}
        currentUserId={profile.id}
        isOwner={profile.role === "owner"}
      />

      {/* Billing is the owner's business only. */}
      {profile.role === "owner" && billing && (
        <BillingSection billing={billing} />
      )}
    </div>
  );
}
