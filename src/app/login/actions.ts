"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { startGoogleSignIn } from "@/lib/google-auth";

export interface LoginFormState {
  error?: string;
}

export async function signInWithEmail(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately vague — do not reveal whether the email exists.
    return { error: "Incorrect email or password." };
  }

  redirect("/dashboard");
}

/* Shared with the other auth page; see lib/google-auth.ts. */
export async function signInWithGoogle() {
  await startGoogleSignIn({ next: "/dashboard", errorPage: "/login" });
}
