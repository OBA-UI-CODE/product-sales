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

export async function removeStaffAccount(staffId: string) {
  const { supabase, profile } = await getCurrentShopContext();
  if (profile.role !== "owner") return;
  if (staffId === profile.id) return; // can't remove yourself

  await supabase
    .from("profiles")
    .delete()
    .eq("id", staffId)
    .eq("shop_id", profile.shop_id);

  /*
    The profile row is gone, so they can no longer reach this shop's data — but
    their auth user still exists, which would let them sign in and land in the
    onboarding wizard as though they were a brand new signup. Remove the login
    as well.
  */
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    const admin = createAdminClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await admin.auth.admin.deleteUser(staffId);
  }

  revalidatePath("/settings");
}
