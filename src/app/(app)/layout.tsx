import { redirect } from "next/navigation";
import { getCurrentShopContext, isSuspended, shopOf } from "@/lib/shop-context";
import { initials } from "@/lib/format";
import { signOut } from "./actions";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import { themeVars } from "@/lib/theme";
import { isPaidShop } from "@/lib/plan";
import { PlanProvider } from "@/components/PlanContext";

/*
  App shell — Figma 201:3069 (web) / 201:3077 (tablet) / 201:3085 (mobile).

  Sidebar 256 wide from tablet up; on mobile it is replaced by the fixed bottom
  bar. The main column starts at x294 on web and tablet — 256 of sidebar plus a
  38px gutter — and is inset 24 from the top. On mobile the content is 24 in
  from each edge and 40 down, with room left at the bottom for the bar.
*/
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, profile } = await getCurrentShopContext();

  /*
    A paused shop, or one queued for deletion, has no working screens — so
    nobody is shown one.

    The gate is HERE rather than on each page because this layout wraps every
    signed-in route, and a redirect thrown while it renders stops the page
    underneath from rendering at all. Putting it on individual pages would
    mean a new screen could be added later and quietly miss the check.

    This is a courtesy, not the enforcement. shop_can_write() in the database
    is what actually refuses the writes, including for anyone calling the API
    directly rather than using these screens.
  */
  if (isSuspended(shopOf(profile))) {
    redirect("/account/paused");
  }

  /*
    The shop's accent colour, applied as CSS variables on the shell. Every
    primary-* utility in the signed-in app resolves to these, so the sidebar,
    buttons, badges, avatars and links all follow the owner's choice without
    any component knowing about it. The marketing site is outside this layout
    and keeps the brand green.
  */
  const shop = shopOf(profile);
  const paid = isPaidShop(shop);

  /*
    On Free only one staff member keeps working. Anyone else is sent to a page
    that explains why, rather than into screens whose every save would be
    refused. Only asked when it can matter (staff, on Free), so owners and
    paid shops pay nothing for the check. The database refuses their writes
    either way.
  */
  if (profile.role === "staff" && !paid) {
    const { data: hasSeat } = await supabase.rpc("current_user_has_seat");
    if (hasSeat === false) redirect("/account/no-access");
  }

  return (
    <PlanProvider paid={paid} isOwner={profile.role === "owner"}>
    <div className="flex min-h-screen bg-bg-canvas" style={themeVars(shop?.theme_color)}>
      <Sidebar
        name={profile.name}
        role={profile.role}
        initials={initials(profile.name)}
        onSignOut={signOut}
      />

      <main className="min-w-0 flex-1 px-6 pb-[141px] pt-10 tab:px-0 tab:pb-6 tab:pl-[38px] tab:pr-[38px] tab:pt-6">
        {children}
      </main>

      <BottomNav />
    </div>
    </PlanProvider>
  );
}
