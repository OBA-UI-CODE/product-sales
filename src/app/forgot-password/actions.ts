"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export interface ForgotPasswordState {
  error?: string;
  success?: boolean;
}

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Please enter your email." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  // Always report success, whether or not the email exists — this
  // prevents using this form to check which emails have accounts.
  if (error) {
    console.error("resetPasswordForEmail error:", error.message);
  }

  return { success: true };
}
