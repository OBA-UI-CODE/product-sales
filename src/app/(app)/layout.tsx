import { getCurrentShopContext } from "@/lib/shop-context";
import { initials } from "@/lib/format";
import { signOut } from "./actions";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import { themeVars } from "@/lib/theme";

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
  const { profile } = await getCurrentShopContext();

  /*
    The shop's accent colour, applied as CSS variables on the shell. Every
    primary-* utility in the signed-in app resolves to these, so the sidebar,
    buttons, badges, avatars and links all follow the owner's choice without
    any component knowing about it. The marketing site is outside this layout
    and keeps the brand green.
  */
  const shop = profile.shops as unknown as { theme_color: string | null } | null;

  return (
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
  );
}
