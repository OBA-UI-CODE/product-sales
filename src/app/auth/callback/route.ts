import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/google-auth";

// Handles both Google OAuth redirects and email confirmation/reset links,
// which both land here as a `code` param per Supabase's PKCE flow.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  /* Only ever a path on this site; see safeNextPath. */
  const next = safeNextPath(searchParams.get("next"), "/");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      /*
        Staff sign in with the email and password their owner set, never with
        Google. The owner runs staff logins: they set and change those
        passwords, and changing one is meant to lock the old one out. Google
        links itself to any account with the same verified email, so a staff
        member with a Gmail address could otherwise keep walking in with
        Google after the owner changed their password.

        This closes the ordinary route in. Removing a staff member (a ban) is
        still what locks someone out completely, by every route.
      */
      const viaGoogle = data.user?.identities?.some((i) => i.provider === "google");
      if (viaGoogle && data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile?.role === "staff") {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=staff_use_password`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
