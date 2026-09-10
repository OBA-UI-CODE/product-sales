import { redirect } from "next/navigation";
import { getCurrentShopContext, shopOf } from "@/lib/shop-context";
import { signOut } from "@/app/(app)/actions";
import { isPaidShop } from "@/lib/plan";
import { Wordmark } from "@/components/Brand";

/*
  Where a staff member lands when their access is paused because the shop is
  on the Free plan, which keeps one staff member working.

  Outside the (app) route group for the same reason as /account/paused: the
  app layout sends people here, so living inside it would bounce forever.

  Nothing about their account has changed. The moment the owner subscribes,
  or chooses them as the staff member who keeps access, they are back in.
*/

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const { supabase, profile } = await getCurrentShopContext();
  const shop = shopOf(profile);

  /* Only for staff who really are paused. Anyone else goes back to work. */
  if (profile.role !== "staff" || isPaidShop(shop)) redirect("/dashboard");
  const { data: hasSeat } = await supabase.rpc("current_user_has_seat");
  if (hasSeat !== false) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center gap-8 px-6 py-16">
      <Wordmark className="text-[32px] text-primary-text" />

      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-[28px] font-semibold leading-tight tab:text-[32px]">
          Your access is paused
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          <strong>{shop?.name}</strong> is on the Free plan, which includes one
          staff account, and another staff member is using it. Your account and
          every sale you have logged are safe.
        </p>
        <p className="text-[var(--color-text-secondary)]">
          You can sign in again as soon as the owner subscribes, or chooses you
          as the staff member who keeps access.
        </p>
      </div>

      <p className="rounded-md bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
        Please speak to the shop owner.
      </p>

      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-[var(--color-text-secondary)] underline"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
