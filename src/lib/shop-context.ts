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
      "id, name, role, shop_id, shops!profiles_shop_id_fkey(name, category, theme_color, deactivated_at, deletion_requested_at, purge_after, subscription_status, trial_ends_at, current_period_end)"
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

/*
  The shape of the shop embedded above. PostgREST types embeds loosely, so
  every reader was casting it by hand; this gives them one name to use.
*/
export interface EmbeddedShop {
  name: string;
  category: string | null;
  theme_color: string | null;
  deactivated_at: string | null;
  deletion_requested_at: string | null;
  purge_after: string | null;
  /* Billing state, so any screen can tell Free from Paid (see lib/plan.ts). */
  subscription_status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

export function shopOf(profile: { shops: unknown }): EmbeddedShop | null {
  return (profile.shops as EmbeddedShop | null) ?? null;
}

/*
  True when the shop is paused or waiting to be deleted.

  Both states mean the same thing to the app — the records are still there,
  but nobody works in this shop today. They are told apart only on the screen
  that offers to bring it back.
*/
export function isSuspended(shop: EmbeddedShop | null): boolean {
  return !!(shop?.deactivated_at || shop?.deletion_requested_at);
}
