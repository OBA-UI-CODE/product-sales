import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

/*
  "Continue with Google", shared by the sign-in and sign-up pages.

  Google itself is switched on in the Supabase dashboard (Authentication >
  Sign In / Providers > Google), with a client id and secret from Google
  Cloud. Nothing here holds a secret.
*/

/*
  Whether Google is switched on in Supabase. signInWithOAuth() only BUILDS a
  url, it never asks the server, so without this a disabled provider sends
  people to a raw JSON error page on supabase.co. Asked of the public auth
  settings endpoint, cached for a minute. If the question itself fails, the
  sign-in is attempted anyway rather than blocked on a hiccup.
*/
async function googleEnabled(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
      {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return true;
    const settings = (await res.json()) as { external?: { google?: boolean } };
    return settings.external?.google === true;
  } catch {
    return true;
  }
}

/*
  Where Google sends people back to. The request's own origin, so local
  development returns to localhost; the live address when a browser does not
  send one. Supabase only honours addresses on its redirect allow list, so a
  forged Origin header cannot send anyone elsewhere.
*/
async function siteOrigin(): Promise<string> {
  return (await headers()).get("origin") ?? SITE_URL;
}

export async function startGoogleSignIn({
  next,
  errorPage,
}: {
  /* Where to land once signed in: /dashboard, or /onboarding for new shops. */
  next: string;
  /* The page to return to, with ?error=..., if it cannot start. */
  errorPage: "/login" | "/signup";
}): Promise<never> {
  if (!(await googleEnabled())) {
    redirect(`${errorPage}?error=google_unavailable`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect(`${errorPage}?error=google_oauth_failed`);
  }

  redirect(data.url);
}

/*
  Only ever a path on this site. The callback builds `${origin}${next}`, so a
  next of "@evil.com" would have produced https://johta.click@evil.com, which
  browsers read as a login to evil.com: a JOHTA link that lands somewhere
  else straight after sign-in. "//evil.com" and "/\evil.com" are the other
  two spellings of the same trick.
*/
export function safeNextPath(next: string | null, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
