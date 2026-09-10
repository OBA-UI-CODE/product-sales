import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Only these paths require a signed-in user at all. Everything else
// (the marketing site: /, /about, /pricing, /how-it-works, /contact,
// /terms, /privacy) is public and served to anyone.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/sales-history",
  "/products",
  "/debts",
  "/settings",
];

export async function updateSession(request: NextRequest) {
  /*
    A sign-in that arrived at the home page. When Supabase cannot use the
    return address it was given, it sends people to the site's home page
    with the ?code= still attached, and nothing there finishes the sign-in:
    they saw the website and had to start again. Passing it on to the
    callback completes it instead. Owners land on the dashboard; someone new
    is moved on to onboarding from there.
  */
  const code = request.nextUrl.searchParams.get("code");
  if (request.nextUrl.pathname === "/" && code) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    url.search = "";
    url.searchParams.set("code", code);
    url.searchParams.set("next", "/dashboard");
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isProtectedPath = PROTECTED_PREFIXES.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  /*
    Public pages do no auth work at all.

    auth.getUser() is a NETWORK CALL to Supabase — it validates the token with
    the auth server rather than just reading the cookie. This used to run on
    every request the matcher caught, which is every marketing page, so
    visitors to the home page waited on a round trip to Ireland for an answer
    nothing on the page used. Returning early is why the public site got
    noticeably quicker.

    The session refresh is skipped here too. That is fine: the only thing it
    would refresh is a token that only the signed-in area reads, and the first
    protected request refreshes it anyway.
  */
  if (!isProtectedPath) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated but hasn't finished onboarding yet (no profile/shop) —
  // force them into the wizard rather than letting them reach the
  // dashboard with no shop_id to operate against. Only applies to
  // protected paths — an authenticated user browsing the public
  // marketing site doesn't need to be interrupted.
  if (user && request.nextUrl.pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
