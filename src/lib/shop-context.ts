import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/*
  Wrapped in React's cache() so the app layout and the page it renders share a
  single lookup instead of each paying for its own auth.getUser() round trip
  plus profile query. Both run in the same request, so this halves the calls on
  every screen in the (app) group.
*/
export const getCurrentShopContext = cache(async function getCurrentShopContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
    The embed MUST name profiles_shop_id_fkey.

    There are two foreign keys between profiles and shops — profiles.shop_id →
    shops.id, and shops.owner_id → profiles.id — so a bare shops(...) embed is
    ambiguous and PostgREST rejects the whole query with PGRST201. That left
    `profile` null here, which sent the user to /onboarding, which found their
    profile and sent them back to /dashboard: an infinite redirect loop that
    presented as the dashboard never loading.
  */
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, name, role, shop_id, shops!profiles_shop_id_fkey(name, category, theme_color)"
    )
    .eq("id", user.id)
    .maybeSingle();

  /*
    A failed query is NOT the same as "this user has not onboarded". Treating
    the two alike is what turned the bug above into a loop instead of an error,
    so a fault is raised rather than redirected.
  */
  if (error) {
    throw new Error(
      `Could not load the profile for the signed-in user: ${error.message}`
    );
  }

  if (!profile) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
});
