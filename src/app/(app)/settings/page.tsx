import { getCurrentShopContext } from "@/lib/shop-context";
import SettingsClient from "./SettingsClient";
import BillingSection, { type BillingInfo } from "./BillingSection";
import { isConfigured } from "@/lib/paystack";
import AccountSection from "./AccountSection";
import ShopDetailsSection from "./ShopDetailsSection";
import RecordsSection from "./RecordsSection";
import { GRACE_DAYS } from "@/lib/account";
import InstallApp from "@/components/InstallApp";
import { FREE_STAFF_LIMIT, isPaidShop } from "@/lib/plan";

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
    .select("id, name, role, created_at")
    .eq("shop_id", profile.shop_id)
    .is("removed_at", null)
    .order("role", { ascending: false })
    .order("created_at", { ascending: true });

  /*
    Billing state is read straight from the shop. It is only ever written by
    the webhook or the billing actions (service role), never by the customer.
  */
  const { data: shop } = await supabase
    .from("shops")
    .select(
      "name, phone, subscription_status, trial_ends_at, current_period_end, billing_plan, free_staff_seat"
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

  /*
    On Free, which staff member keeps working. Mirrors staff_seat_holder() in
    the database: the one the owner chose, if they are still here, otherwise
    whoever was added first. The query above is already in that order.
  */
  const paid = isPaidShop(shop);
  const staffOnly = (staff ?? []).filter((s) => s.role === "staff");
  const seatHolder = paid
    ? null
    : (staffOnly.find((s) => s.id === shop?.free_staff_seat) ?? staffOnly[0])
        ?.id ?? null;

  return (
    <div className="flex flex-col gap-8">
      <SettingsClient
        staff={(staff ?? []).map(({ id, name, role }) => ({ id, name, role }))}
        currentUserId={profile.id}
        isOwner={profile.role === "owner"}
        paid={paid}
        seatHolder={seatHolder}
        canAddStaff={paid || staffOnly.length < FREE_STAFF_LIMIT}
      />

      {profile.role === "owner" && shop && (
        <ShopDetailsSection name={shop.name} phone={shop.phone} />
      )}

      {/* Billing is the owner's business only. */}
      {profile.role === "owner" && billing && (
        <BillingSection billing={billing} paid={paid} />
      )}

      {/* The owner's copy of everything. Staff are not shown it. */}
      {profile.role === "owner" && <RecordsSection paid={paid} />}

      {/* Still here after the dashboard's install card is closed, so there
          is always a way back to installing. The whole section, heading
          included, disappears once the app is installed or on a browser
          that cannot install it. */}
      <InstallApp variant="settings" />

      {/*
        Last on the page, and after billing, on purpose. Nobody arrives at
        Settings looking to close their shop, and the things people do come
        here for should not sit underneath the button that deletes everything.
      */}
      <AccountSection
        isOwner={profile.role === "owner"}
        paid={paid}
        shopName={shop?.name ?? ""}
        graceDays={GRACE_DAYS}
      />
    </div>
  );
}
