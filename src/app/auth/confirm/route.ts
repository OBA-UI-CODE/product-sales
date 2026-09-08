import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/*
  Email confirmation and password-reset links.

  These are NOT the same flow as Google sign-in. OAuth comes back with a
  `code` and is handled by /auth/callback; the links Supabase puts in emails
  arrive with `token_hash` and `type` and have to be verified with verifyOtp.

  Sending both through the callback route was the bug behind "confirm email
  takes me to the landing page": there was no `code`, so nothing was verified
  and the visitor was bounced to the site root still signed out.

  On success the visitor is already signed in, so they go straight to `next` —
  the onboarding wizard for a new signup — rather than being asked to log in
  again with the password they just chose.
*/
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    /*
      Most often an expired or already-used link — someone clicking the button
      a second time, or coming back to it the next day. Say so plainly rather
      than dropping them on a generic error.
    */
    return NextResponse.redirect(`${origin}/login?error=link_expired`);
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`);
}
