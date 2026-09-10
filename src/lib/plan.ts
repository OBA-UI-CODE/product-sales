/*
  Free and paid plans, as the app sees them.

  The DATABASE is the authority: shop_is_paid() in
  supabase/migrations/20260910152135_free_and_paid_plans.sql decides, and the
  limits are enforced there and in the receipt and export routes. This file
  mirrors that rule so screens can show the right thing without an extra round
  trip. If the SQL changes, change isPaidShop() to match.

    Free   sales, products, stock, sizes and packs, low-stock warnings, debts,
           one staff account, the last 30 days of history, pause and delete
    Paid   all of that, plus receipts, unlimited staff, full history and
           downloading the shop's records

  The one-month trial counts as Paid.
*/

export const FREE_STAFF_LIMIT = 1;
export const FREE_HISTORY_DAYS = 30;

export interface PlanFields {
  subscription_status: "trialing" | "active" | "past_due" | "canceled" | string;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

export function isPaidShop(shop: PlanFields | null | undefined): boolean {
  if (!shop) return false;
  const now = Date.now();
  const future = (value: string | null) =>
    !!value && new Date(value).getTime() > now;

  if (shop.subscription_status === "active") return true;
  if (shop.subscription_status === "trialing") return future(shop.trial_ends_at);
  if (shop.subscription_status === "canceled") return future(shop.current_period_end);
  /* past_due: Paystack is retrying a failed card. Free until it succeeds. */
  return false;
}

/* True while the shop is inside its one-month trial. */
export function isOnTrial(shop: PlanFields | null | undefined): boolean {
  return (
    shop?.subscription_status === "trialing" &&
    !!shop.trial_ends_at &&
    new Date(shop.trial_ends_at).getTime() > Date.now()
  );
}

/* The earliest date a Free shop can see in its sales history. */
export function freeHistoryStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - FREE_HISTORY_DAYS);
  return d;
}
