import { LogOut } from "lucide-react";
import { getCurrentShopContext } from "@/lib/shop-context";
import { initials } from "@/lib/format";
import { signOut } from "./actions";
import SidebarNav from "./SidebarNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentShopContext();

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-canvas)]">
      <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-6 py-8">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-medium text-white">
              {initials(profile.name)}
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl font-medium">
                {profile.name}
              </span>
              <span className="text-base capitalize text-[var(--color-text-secondary)]">
                {profile.role}
              </span>
            </div>
          </div>

          <SidebarNav />
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 rounded-[10px] px-4 py-3 text-lg font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)]"
          >
            <LogOut size={20} />
            Logout
          </button>
        </form>
      </aside>

      <main className="flex-1 px-10 py-10">{children}</main>
    </div>
  );
}
