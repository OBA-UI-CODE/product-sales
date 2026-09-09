"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentShopContext, shopOf } from "@/lib/shop-context";
import { disableSubscription } from "@/lib/paystack";
import { GRACE_DAYS, type AccountState } from "@/lib/account";

/*
  Pausing, deleting and restoring an account.

  Three things are true of everything in this file:

  1. Writes go through the SERVICE ROLE. `shops` has no customer-writable
     policy for these columns, and it must not get one — a shop being paused
     or queued for deletion is exactly the sort of flag that should not be
     settable by anyone holding a user token.

  2. Ownership is re-checked here every time. The interface hides these
     controls from staff, but hiding a button is not a permission check.

  3. The subscription is cancelled BEFORE the account is put away. Someone who
     pauses or deletes their shop and then keeps getting charged ₦1,599 a month
     has been robbed, however politely. This is the part that matters most.
*/


function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/*
  Cancels the Paystack subscription if there is one.

  Returns an error string only when there was a live subscription that we
  failed to stop. A shop still on its free trial has nothing to cancel, and
  that is not a failure — it must not block the pause or the deletion.
*/
async function stopBilling(
  admin: ReturnType<typeof adminClient>,
  shopId: string
): Promise<string | null> {
  if (!admin) return null;

  const { data: shop } = await admin
    .from("shops")
    .select("paystack_subscription_code, paystack_email_token")
    .eq("id", shopId)
    .maybeSingle();

  if (!shop?.paystack_subscription_code || !shop?.paystack_email_token) {
    return null;
  }

  const result = await disableSubscription(
    shop.paystack_subscription_code,
    shop.paystack_email_token
  );

  if (!result.ok) {
    /*
      Deliberately fatal. If we cannot stop the money going out, carrying on
      and locking them out of the screen where they could try again is the
      worst of both worlds.
    */
    return "We could not stop your subscription with Paystack, so nothing has been changed. Please try again in a moment, or cancel from the Billing section first.";
  }

  await admin
    .from("shops")
    .update({ subscription_status: "canceled" })
    .eq("id", shopId);

  return null;
}

async function requireOwner() {
  const { user, profile } = await getCurrentShopContext();
  if (profile.role !== "owner") return null;
  return { user, profile };
}

/* ------------------------------------------------------------------ pause */

export async function deactivateShop(): Promise<AccountState> {
  const ctx = await requireOwner();
  if (!ctx) return { error: "Only the shop owner can pause the account." };

  const admin = adminClient();
  if (!admin) return { error: "This is not configured on the server." };

  const billingError = await stopBilling(admin, ctx.profile.shop_id);
  if (billingError) return { error: billingError };

  const { error } = await admin
    .from("shops")
    .update({ deactivated_at: new Date().toISOString() })
    .eq("id", ctx.profile.shop_id);

  if (error) return { error: `Could not pause the account: ${error.message}` };

  /*
    Everyone is signed out, staff included — their sessions are killed at the
    Supabase end rather than merely being redirected, so a stale tab cannot
    keep working against the API.
  */
  await signOutEveryone(admin, ctx.profile.shop_id);

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?notice=paused");
}

export async function reactivateShop(): Promise<AccountState> {
  const ctx = await requireOwner();
  if (!ctx) return { error: "Only the shop owner can reopen the account." };

  const admin = adminClient();
  if (!admin) return { error: "This is not configured on the server." };

  const { error } = await admin
    .from("shops")
    .update({ deactivated_at: null })
    .eq("id", ctx.profile.shop_id);

  if (error) return { error: `Could not reopen the account: ${error.message}` };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/* --------------------------------------------------------------- deletion */

/*
  Starts the countdown. Nothing is destroyed here.

  The shop is closed immediately — that is what the owner asked for — but the
  rows stay untouched for GRACE_DAYS so that a decision made in a bad moment,
  or by someone who had the owner's phone, can be undone. purge_expired_shops()
  in the database is what eventually destroys them, on a nightly schedule.
*/
export async function requestAccountDeletion(
  _prevState: AccountState,
  formData: FormData
): Promise<AccountState> {
  const ctx = await requireOwner();
  if (!ctx) return { error: "Only the shop owner can delete the account." };

  const shop = shopOf(ctx.profile);
  const typed = ((formData.get("confirm") as string) ?? "").trim();

  /*
    Typing the shop's own name. Not a checkbox, and not "type DELETE" — the
    name is the thing being destroyed, so writing it out is the moment it
    becomes real. Compared case-insensitively; this is a confirmation, not a
    password.
  */
  if (!shop?.name || typed.toLowerCase() !== shop.name.trim().toLowerCase()) {
    return {
      error: `Type your shop name exactly as it appears (${shop?.name ?? ""}) to confirm.`,
    };
  }

  const admin = adminClient();
  if (!admin) return { error: "This is not configured on the server." };

  const billingError = await stopBilling(admin, ctx.profile.shop_id);
  if (billingError) return { error: billingError };

  const now = new Date();
  const purgeAfter = new Date(now.getTime() + GRACE_DAYS * 86_400_000);

  const { error } = await admin
    .from("shops")
    .update({
      deletion_requested_at: now.toISOString(),
      purge_after: purgeAfter.toISOString(),
    })
    .eq("id", ctx.profile.shop_id);

  if (error) {
    return { error: `Could not schedule the deletion: ${error.message}` };
  }

  await signOutEveryone(admin, ctx.profile.shop_id);

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?notice=deletion_scheduled");
}

export async function cancelAccountDeletion(): Promise<AccountState> {
  const ctx = await requireOwner();
  if (!ctx) return { error: "Only the shop owner can do this." };

  const admin = adminClient();
  if (!admin) return { error: "This is not configured on the server." };

  const { error } = await admin
    .from("shops")
    .update({ deletion_requested_at: null, purge_after: null })
    .eq("id", ctx.profile.shop_id);

  if (error) return { error: `Could not stop the deletion: ${error.message}` };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/* ------------------------------------------------------- a staff member */

/*
  A staff member removing themselves.

  Quite different from an owner deleting the shop: nothing of the business is
  touched. Their login goes, and their profile with it, but the sales they
  logged stay in the shop's records — sales.seller_id is NO ACTION precisely
  so that removing a person cannot quietly rewrite the history of what was
  sold. The shop keeps a complete record; the person keeps nothing.
*/
export async function deleteOwnStaffAccount(): Promise<AccountState> {
  const { profile } = await getCurrentShopContext();

  if (profile.role === "owner") {
    return {
      error:
        "You own this shop, so this would leave it with nobody in charge. Use Delete this shop instead.",
    };
  }

  const admin = adminClient();
  if (!admin) return { error: "This is not configured on the server." };

  /*
    The profile has to go before the auth user, even though the foreign key
    cascades, because sales.seller_id points at it and would refuse. Nulling
    it is not an option either — that would lose who sold what. So the profile
    row is kept and only detached from the shop... except it cannot be, since
    shop_id is NOT NULL.

    So: the profile is deleted only if it is not referenced. If they have
    logged sales, the login is removed and the profile stays as a record of
    the person who logged them.
  */
  const { count } = await admin
    .from("sales")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", profile.id);

  if (!count) {
    await admin.from("profiles").delete().eq("id", profile.id);
  }

  const { error } = await admin.auth.admin.deleteUser(profile.id);
  if (error) {
    return { error: `Could not delete your account: ${error.message}` };
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?notice=account_deleted");
}

/* ----------------------------------------------------------------- shared */

/*
  Revokes every session belonging to the shop.

  Without this, a staff member with the app already open keeps a valid access
  token for up to an hour after the shop is closed, and the database guard is
  the only thing standing between them and the data. Signing them out at the
  source closes that window.

  This goes through an RPC rather than the client library on purpose:
  auth.admin.signOut() takes a JWT, not a user id, so there is no way to end
  somebody else's session from the server through supabase-js. The RPC deletes
  the session rows directly and is granted to the service role alone.
*/
async function signOutEveryone(
  admin: NonNullable<ReturnType<typeof adminClient>>,
  shopId: string
) {
  const { error } = await admin.rpc("revoke_shop_sessions", {
    target_shop: shopId,
  });

  if (error) {
    /* Not fatal: the shop is already closed in the database, and every write
       is refused by shop_can_write(). This only shortens the window in which
       an already-open tab can still read. */
    console.error("revoke_shop_sessions failed", error.message);
  }
}
