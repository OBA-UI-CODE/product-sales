"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { startGoogleSignIn } from "@/lib/google-auth";
import { SITE_URL } from "@/lib/site";
import { headers } from "next/headers";
import {
  checkPasswordPwned,
  pwnedPasswordMessage,
} from "@/lib/password-check";

export interface SignupFormState {
  error?: string;
}

export async function signUpWithEmail(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!fullName || !email || !password) {
    return { error: "Please fill in every field." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  /* Free stand-in for Supabase's paid leaked-password protection. Returns
     null if HIBP could not be reached, in which case the signup proceeds. */
  const pwned = await checkPasswordPwned(password);
  if (pwned?.pwned) {
    return { error: pwnedPasswordMessage(pwned.count) };
  }

  const supabase = await createClient();
  /* Falls back to the live address if a browser sends no Origin, rather
     than producing a confirmation link to "null/auth/callback". */
  const origin = (await headers()).get("origin") ?? SITE_URL;

  // NOTE: this only creates the auth.users row and stashes the name in
  // user metadata. The `shops` + `profiles` rows are created at the end
  // of the onboarding wizard (Day 2), not here — a signed-up user with
  // no shop yet is a valid, expected state.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/signup/check-email");
}

/* Shared with the other auth page; see lib/google-auth.ts. */
export async function signInWithGoogle() {
  await startGoogleSignIn({ next: "/onboarding", errorPage: "/signup" });
}
