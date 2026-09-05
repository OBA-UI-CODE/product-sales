"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

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

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

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

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error || !data.url) {
    redirect("/signup?error=google_oauth_failed");
  }

  redirect(data.url);
}
