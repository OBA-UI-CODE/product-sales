import { getCurrentShopContext } from "@/lib/shop-context";
import SettingsClient from "./SettingsClient";
import BillingSection, { type BillingInfo } from "./BillingSection";
import { isConfigured } from "@/lib/paystack";
import AccountSection from "./AccountSection";
import ShopDetailsSection from "./ShopDetailsSection";
import { GRACE_DAYS } from "@/lib/account";

export default async function SettingsPage() {
  const { supabase, profile } = await getCurrentShopContext();

  /*
    Removed staff are archived, not deleted, so that past sales still say who
    sold them — hence the removed_at filter. Every other place that reads
    profiles (the dashboard, sales history, debts, the CSV export) deliberately
    does NOT filter, because those are looking up the seller's name and need
    people who have since left.
  */
  const { data: staff } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("shop_id", profile.shop_id)
    .is("removed_at", null)
    .order("role", { ascending: false });

  /*
    Billing state is read straight from the shop. It is only ever written by
    the webhook or the billing actions (service role), never by the customer.
  */
  const { data: shop } = await supabase
    .from("shops")
    .select(
      "name, phone, subscription_status, trial_ends_at, current_period_end, billing_plan"
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

      {profile.role === "owner" && shop && (
        <ShopDetailsSection name={shop.name} phone={shop.phone} />
      )}

      {/* Billing is the owner's business only. */}
      {profile.role === "owner" && billing && (
        <BillingSection billing={billing} />
      )}

      {/*
        Last on the page, and after billing, on purpose. Nobody arrives at
        Settings looking to close their shop, and the things people do come
        here for should not sit underneath the button that deletes everything.
      */}
      <AccountSection
        isOwner={profile.role === "owner"}
        shopName={shop?.name ?? ""}
        graceDays={GRACE_DAYS}
      />
    </div>
  );
}
