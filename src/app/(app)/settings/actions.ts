"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentShopContext } from "@/lib/shop-context";
import { revalidatePath } from "next/cache";
import {
  checkPasswordPwned,
  pwnedPasswordMessage,
} from "@/lib/password-check";

export interface AddStaffState {
  error?: string;
  success?: string;
}

/* Same shape; named separately because it is used by actions that are not
   about adding anyone. */
export type StaffState = AddStaffState;

/*
  Service-role client, for the things an owner does to someone else's login:
  creating it, changing its password, banning it. Never used to skip a rule
  the owner would otherwise be subject to — the profile insert in
  addStaffAccount still goes through RLS as the owner.
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
  Creating a staff member is a two-step job:

    1. create the auth user, which needs the service role key because the
       owner is making an account on someone else's behalf — there is no
       signup form and no email confirmation round trip
    2. create the profile row that ties that user to this shop

  Step 2 runs as the OWNER, not as the service role, so the database's own
  policy ("owner can insert staff profiles in their shop") is what authorises
  it. The service role is used for the narrowest possible thing — making the
  auth user — rather than as a way to skip the rules.

  If step 2 fails the auth user is deleted again, so a half-made account is
  never left behind for someone to sign in with.
*/
export async function addStaffAccount(
  _prevState: AddStaffState,
  formData: FormData
): Promise<AddStaffState> {
  const { supabase, profile } = await getCurrentShopContext();

  if (profile.role !== "owner") {
    return { error: "Only the owner can add staff." };
  }

  const name = ((formData.get("name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!name || !email || !password) {
    return { error: "Please fill in every field." };
  }

  if (password.length < 8) {
    return { error: "The temporary password must be at least 8 characters." };
  }

  /* Owners tend to reach for something obvious when setting a password for
     someone else, which is exactly the case this catches. */
  const pwned = await checkPasswordPwned(password);
  if (pwned?.pwned) {
    return { error: pwnedPasswordMessage(pwned.count) };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return {
      error:
        "Staff accounts need the Supabase service role key, which is not configured on the server.",
    };
  }

  const admin = createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      // Confirmed on the owner's word, so the staff member can sign in with
      // the temporary password straight away.
      email_confirm: true,
      user_metadata: { full_name: name },
    });

  if (createError || !created?.user) {
    const message = createError?.message ?? "";
    if (/already been registered|already exists/i.test(message)) {
      return {
        error: "Someone with that email address already has an account.",
      };
    }
    if (/password/i.test(message)) {
      return { error: `That temporary password was rejected: ${message}` };
    }
    return {
      error: message || "Could not create that staff account. Please try again.",
    };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    shop_id: profile.shop_id,
    name,
    role: "staff",
  });

  if (profileError) {
    // Undo the auth user so the email is free to try again.
    await admin.auth.admin.deleteUser(created.user.id);
    return {
      error: `Could not add them to your shop: ${profileError.message}`,
    };
  }

  revalidatePath("/settings");
  return { success: `${name} can now sign in with the password you set.` };
}

/*
  Removing a staff member.

  This used to delete the profile and then the auth user, checking neither for
  errors. Both fail for any staff member whose name is on a sale, because
  sales.seller_id references profiles with NO ACTION — so the owner pressed
  remove, nothing happened, and the person could still sign in. It only ever
  appeared to work for staff who had never sold anything.

  The foreign key is correct: deleting the profile would erase who sold what.
  So the profile is ARCHIVED and the LOGIN is dealt with separately:

    · banned, so they cannot sign in
    · sessions revoked, so an open tab stops working now rather than in an hour
    · email freed, so the owner can add the same person back straight away

  The email is moved to a .invalid address, which RFC 2606 reserves precisely
  so it can never resolve to a real mailbox anywhere.
*/
export async function removeStaffAccount(staffId: string): Promise<StaffState> {
  const { profile } = await getCurrentShopContext();
  if (profile.role !== "owner") {
    return { error: "Only the owner can remove staff." };
  }
  if (staffId === profile.id) {
    return { error: "You cannot remove yourself." };
  }

  const admin = adminClient();
  if (!admin) {
    return { error: "Staff accounts need the service role key, which is not configured on the server." };
  }

  /* Scoped to this shop, so an owner cannot archive somebody else's staff by
     passing an id from another shop. */
  const { data: target } = await admin
    .from("profiles")
    .select("id, name")
    .eq("id", staffId)
    .eq("shop_id", profile.shop_id)
    .is("removed_at", null)
    .maybeSingle();

  if (!target) return { error: "That staff member is not in your shop." };

  const { error: archiveError } = await admin
    .from("profiles")
    .update({ removed_at: new Date().toISOString() })
    .eq("id", staffId)
    .eq("shop_id", profile.shop_id);

  if (archiveError) {
    return { error: `Could not remove them: ${archiveError.message}` };
  }

  const { error: banError } = await admin.auth.admin.updateUserById(staffId, {
    // A hundred years. Supabase has no permanent ban, so this is how one is spelled.
    ban_duration: "876000h",
    email: `removed-${staffId}@removed.johta.invalid`,
    email_confirm: true,
  });

  if (banError) {
    // Put the profile back rather than leave them archived but able to sign in.
    await admin
      .from("profiles")
      .update({ removed_at: null })
      .eq("id", staffId);
    return { error: `Could not disable their login: ${banError.message}` };
  }

  await admin.rpc("revoke_user_sessions", { target_user: staffId });

  revalidatePath("/settings");
  return { success: `${target.name} has been removed and can no longer sign in.` };
}

/*
  Setting a new password for a staff member.

  Staff cannot change their own password by design — the owner administers
  those accounts, the way they administer everything else in the shop. This is
  what makes that workable: without it the only way to rotate a password was
  to remove the person and add them back, retyping their details each time.

  The new password is checked against Have I Been Pwned for the same reason
  the temporary one is: an owner setting a password on someone else's behalf
  reaches for something obvious.
*/
export async function resetStaffPassword(
  _prevState: StaffState,
  formData: FormData
): Promise<StaffState> {
  const { profile } = await getCurrentShopContext();
  if (profile.role !== "owner") {
    return { error: "Only the owner can change staff passwords." };
  }

  const staffId = ((formData.get("staffId") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (staffId === profile.id) {
    return {
      error: "Use the forgot-password link on the sign-in page to change your own password.",
    };
  }

  if (password.length < 8) {
    return { error: "The new password must be at least 8 characters." };
  }

  const pwned = await checkPasswordPwned(password);
  if (pwned?.pwned) return { error: pwnedPasswordMessage(pwned.count) };

  const admin = adminClient();
  if (!admin) {
    return { error: "This needs the service role key, which is not configured on the server." };
  }

  const { data: target } = await admin
    .from("profiles")
    .select("id, name")
    .eq("id", staffId)
    .eq("shop_id", profile.shop_id)
    .is("removed_at", null)
    .maybeSingle();

  if (!target) return { error: "That staff member is not in your shop." };

  const { error } = await admin.auth.admin.updateUserById(staffId, { password });
  if (error) return { error: `Could not set the password: ${error.message}` };

  /*
    Sign them out everywhere. The point of changing a password is usually that
    somebody should no longer have access, which is not achieved if their
    existing session keeps working.
  */
  await admin.rpc("revoke_user_sessions", { target_user: staffId });

  revalidatePath("/settings");
  return { success: `${target.name} can now sign in with the new password.` };
}
